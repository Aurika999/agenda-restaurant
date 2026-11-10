import { useId } from 'react';
import { iso, fmtDateLong, money, num, sortRes, todayIso, totals } from '../utils';
import ReservationCard from './ReservationCard.jsx';
import { useLang } from '../i18n.jsx';

const ICONS = {
  cloche: <path d="M4 18h16M5.5 18a6.5 6.5 0 0 1 13 0M12 9.5V7.5M10 7h4" />,
  calendar: <><rect x="3.5" y="5" width="17" height="15.5" rx="2.5" /><path d="M3.5 10h17M8 3v4M16 3v4" /></>,
  users: <><circle cx="9" cy="8.5" r="3.3" /><path d="M2.8 20a6.2 6.2 0 0 1 12.4 0M15.8 5.3a3.3 3.3 0 0 1 0 6.4M17.5 14.6A6.2 6.2 0 0 1 21.2 20" /></>,
  wallet: <><rect x="3" y="6" width="18" height="14" rx="3" /><path d="M3 10.5h18M15.5 15h2.5M6 6l9-3 1 3" /></>,
};

/** Inel de progres (0–1) cu o iconiță în mijloc. */
function Ring({ value, icon }) {
  const id = 'ring' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const R = 25, C = 2 * Math.PI * R;
  const v = Math.max(0, Math.min(1, value || 0));
  return (
    <div className="ring" aria-hidden="true">
      <svg viewBox="0 0 58 58">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#6fd0a4" /><stop offset="1" stopColor="#23795a" />
          </linearGradient>
        </defs>
        <circle className="track" cx="29" cy="29" r={R} />
        <circle className="bar" cx="29" cy="29" r={R} stroke={`url(#${id})`} strokeDasharray={C} strokeDashoffset={C * (1 - v)} />
      </svg>
      <span className="ico">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{ICONS[icon]}</svg>
      </span>
    </div>
  );
}

const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);

function Stats({ store, month }) {
  const { t, months } = useLang();
  const today = todayIso();
  const active = store.reservations.filter((r) => r.status !== 'anulat');
  const inMonth = active.filter((r) => r.data.startsWith(month));
  const upcoming = active.filter((r) => r.data >= today);
  const guestsOf = (list) => list.reduce((s, r) => s + num(r.persoane) + num(r.copii), 0);
  const guests = guestsOf(inMonth);
  const guestsConf = guestsOf(inMonth.filter((r) => r.status === 'confirmat'));
  const upConf = upcoming.filter((r) => r.status === 'confirmat').length;
  const due = upcoming.reduce((s, r) => s + Math.max(0, totals(r).rest), 0);
  const upTotal = upcoming.reduce((s, r) => s + totals(r).total, 0);
  const upPaid = upcoming.reduce((s, r) => s + Math.min(num(r.avans), totals(r).total), 0);
  const [yy, mm] = month.split('-').map(Number);
  const daysInMonth = new Date(yy, mm, 0).getDate();
  const busyDays = new Set(inMonth.map((r) => r.data)).size;
  const mName = months[mm - 1];

  const items = [
    { v: upcoming.length, l: t('Rezervări viitoare'), s: t('{p}% confirmate', { p: pct(upConf, upcoming.length) }), r: upConf / (upcoming.length || 1), icon: 'cloche' },
    { v: inMonth.length, l: t('Evenimente în {m}', { m: mName }), s: t('{n} din {d} zile ocupate', { n: busyDays, d: daysInMonth }), r: busyDays / daysInMonth, icon: 'calendar' },
    { v: guests, l: t('Invitați în {m}', { m: mName }), s: t('{p}% confirmați', { p: pct(guestsConf, guests) }), r: guestsConf / (guests || 1), icon: 'users' },
    { v: money(due, store.settings.moneda), l: t('De încasat (viitoare)'), s: t('{p}% încasat ca avans', { p: pct(upPaid, upTotal) }), r: upPaid / (upTotal || 1), icon: 'wallet' },
  ];
  return (
    <div className="stats">
      {items.map((it) => (
        <div className="stat" key={it.icon}>
          <div>
            <div className="v">{it.v}</div>
            <div className="l">{it.l}</div>
            <div className="s">{it.s}</div>
          </div>
          <Ring value={it.r} icon={it.icon} />
        </div>
      ))}
    </div>
  );
}

export default function CalendarView({ store, sel, setSel, month, setMonth, onNew, onEdit, onContract }) {
  const { t, lang, months, dow } = useLang();
  const [y, m] = month.split('-').map(Number);
  const today = todayIso();
  const first = new Date(y, m - 1, 1);
  const start = new Date(first);
  start.setDate(1 - ((first.getDay() + 6) % 7));

  const days = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    if (i >= 35 && d.getMonth() !== m - 1) break;
    days.push(d);
  }

  const shift = (k) => setMonth(iso(new Date(y, m - 1 + k, 1)).slice(0, 7));
  const pick = (s) => { setSel(s); if (s.slice(0, 7) !== month) setMonth(s.slice(0, 7)); };
  const dayRes = sortRes(store.reservations.filter((r) => r.data === sel));

  return (
    <section>
      <Stats store={store} month={month} />
      <div className="grid2">
        <div className="card">
          <div className="cal-head">
            <button className="btn sm" onClick={() => shift(-1)}>‹</button>
            <h2>{months[m - 1]} {y}</h2>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="btn sm" onClick={() => pick(today)}>{t('Azi')}</button>
              <button className="btn sm" onClick={() => shift(1)}>›</button>
            </div>
          </div>
          <div className="cal">
            {dow.map((d) => <div className="dow" key={d}>{d}</div>)}
            {days.map((d) => {
              const s = iso(d);
              const rs = sortRes(store.reservations.filter((r) => r.data === s));
              const cls = ['d', d.getMonth() !== m - 1 && 'out', s === today && 'today', s === sel && 'sel', rs.length && 'has']
                .filter(Boolean).join(' ');
              return (
                <div key={s} className={cls} onClick={() => pick(s)}>
                  <span className="n">{d.getDate()}</span>
                  {rs.slice(0, 2).map((r) => (
                    <span key={r.id} className={'chip ' + r.status}>{(r.oraStart ? r.oraStart + ' ' : '') + r.client}</span>
                  ))}
                  {rs.length > 2 && <span className="more">{t('+{n} încă', { n: rs.length - 2 })}</span>}
                </div>
              );
            })}
          </div>
        </div>
        <div className="card">
          <div className="day-title">
            <h3>{fmtDateLong(sel, lang)}</h3>
            <button className="btn sm" onClick={() => onNew(sel)}>{t('+ Adaugă')}</button>
          </div>
          {dayRes.length
            ? dayRes.map((r) => (
              <ReservationCard key={r.id} r={r} cur={store.settings.moneda} onEdit={onEdit} onContract={onContract} />
            ))
            : <div className="empty">{t('Nicio rezervare în această zi.')}</div>}
        </div>
      </div>
    </section>
  );
}
