import { STATUS, money, num, totals } from '../utils';

export default function ReservationCard({ r, cur, onEdit, onContract }) {
  const t = totals(r);
  return (
    <div className="res">
      <div className="row1">
        <div>
          <div className="name">{r.client}</div>
          <div className="meta">
            {r.tip} · {r.oraStart || '--:--'}{r.oraSfarsit && ` – ${r.oraSfarsit}`}{r.sala && ` · ${r.sala}`}
          </div>
          <div className="meta">
            {num(r.persoane)} adulți{num(r.copii) ? ` + ${num(r.copii)} copii` : ''} · ☎ {r.telefon}
          </div>
          {t.total > 0 && (
            <div className="meta">
              Total {money(t.total, cur)} · avans {money(r.avans, cur)} ·{' '}
              <b style={{ color: 'var(--accent)' }}>rest {money(t.rest, cur)}</b>
            </div>
          )}
        </div>
        <span className={'badge ' + r.status}>{STATUS[r.status]}</span>
      </div>
      <div className="acts">
        <button className="btn sm" onClick={() => onEdit(r)}>Editează</button>
        <button className="btn sm" onClick={() => onContract(r.id)}>📄 Contract</button>
      </div>
    </div>
  );
}
