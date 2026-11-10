import { iso, fmtDateLong, money, num, sortRes, todayIso, totals } from '../utils';
import ReservationCard from './ReservationCard.jsx';
import { useLang } from '../i18n.jsx';

function Stats({ store, month }) {
  const { t, months } = useLang();
  const today = todayIso();
  const active = store.reservations.filter((r) => r.status !== 'anulat');
  const inMonth = active.filter((r) => r.data.startsWith(month));
  const upcoming = active.filter((r) => r.data >= today);
  const guests = inMonth.reduce((s, r) => s + num(r.persoane) + num(r.copii), 0);
  const due = upcoming.reduce((s, r) => s + Math.max(0, totals(r).rest), 0);
  const mName = months[+month.split('-')[1] - 1];
  const items = [
    [upcoming.length, t('Rezervări viitoare')],
    [inMonth.length, t('Evenimente în {m}', { m: mName })],
    [guests, t('Invitați în {m}', { m: mName })],
    [money(due, store.settings.moneda), t('De încasat (viitoare)')],
  ];
  return (
    <div className="stats">
      {items.map(([v, l]) => (
        <div className="stat" key={l}><div className="v">{v}</div><div className="l">{l}</div></div>
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
