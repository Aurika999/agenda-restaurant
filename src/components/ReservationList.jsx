import { useState } from 'react';
import { STATUS, fmtDate, money, num, sortRes, todayIso, totals } from '../utils';

export default function ReservationList({ store, onEdit, onContract }) {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [when, setWhen] = useState('viitoare');
  const today = todayIso();
  const cur = store.settings.moneda;

  let rows = store.reservations.filter((r) => {
    if (status && r.status !== status) return false;
    if (when === 'viitoare' && r.data < today) return false;
    if (when === 'trecute' && r.data >= today) return false;
    const hay = [r.client, r.telefon, r.tip, r.sala, r.email, r.nr].join(' ').toLowerCase();
    return !q || hay.includes(q.trim().toLowerCase());
  });
  rows = sortRes(rows);
  if (when === 'trecute') rows.reverse();

  return (
    <section className="card">
      <div className="toolbar">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Caută după client, telefon, tip eveniment…" />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Toate statusurile</option>
          {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={when} onChange={(e) => setWhen(e.target.value)}>
          <option value="viitoare">Viitoare</option>
          <option value="trecute">Trecute</option>
          <option value="toate">Toate</option>
        </select>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table className="list">
          <thead>
            <tr>
              <th>Data</th><th>Client</th><th>Eveniment</th><th className="hm">Sala</th>
              <th className="num">Pers.</th><th className="num hm">Total</th><th className="num hm">Rest</th>
              <th>Status</th><th />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={9} className="empty">Nicio rezervare găsită.</td></tr>}
            {rows.map((r) => {
              const t = totals(r);
              return (
                <tr key={r.id}>
                  <td>{fmtDate(r.data)}<div className="small">{r.oraStart}</div></td>
                  <td><b>{r.client}</b><div className="small">{r.telefon}</div></td>
                  <td>{r.tip}</td>
                  <td className="hm">{r.sala || '—'}</td>
                  <td className="num">{num(r.persoane) + num(r.copii)}</td>
                  <td className="num hm">{t.total ? money(t.total, cur) : '—'}</td>
                  <td className="num hm">{t.total ? money(t.rest, cur) : '—'}</td>
                  <td><span className={'badge ' + r.status}>{STATUS[r.status]}</span></td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <button className="btn sm" onClick={() => onEdit(r)}>Editează</button>{' '}
                    <button className="btn sm" onClick={() => onContract(r.id)}>📄</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
