import { STATUS, money, num, totals } from '../utils';
import { useLang } from '../i18n.jsx';

export default function ReservationCard({ r, cur, onEdit, onContract }) {
  const t = totals(r);
  const { t: tr } = useLang();
  return (
    <div className="res">
      <div className="row1">
        <div>
          <div className="name">{r.client}</div>
          <div className="meta">
            {tr(r.tip)} · {r.oraStart || '--:--'}{r.oraSfarsit && ` – ${r.oraSfarsit}`}{r.sala && ` · ${r.sala}`}
          </div>
          <div className="meta">
            {tr('{n} adulți', { n: num(r.persoane) })}{num(r.copii) ? tr(' + {n} copii', { n: num(r.copii) }) : ''} · ☎ {r.telefon}
          </div>
          {t.total > 0 && (
            <div className="meta">
              {tr('Total {x} · avans {y} · ', { x: money(t.total, cur), y: money(r.avans, cur) })}
              <b style={{ color: 'var(--accent)' }}>{tr('rest {x}', { x: money(t.rest, cur) })}</b>
            </div>
          )}
        </div>
        <span className={'badge ' + r.status}>{tr(STATUS[r.status])}</span>
      </div>
      <div className="acts">
        <button className="btn sm" onClick={() => onEdit(r)}>{tr('Editează')}</button>
        <button className="btn sm" onClick={() => onContract(r.id)}>{tr('📄 Contract')}</button>
      </div>
    </div>
  );
}
