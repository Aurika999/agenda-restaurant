const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'));

/**
 * Selector de oră în format 24h (fără AM/PM), indiferent de limba browserului.
 * Valoarea este „HH:MM” sau „” (dacă `optional` și nu e aleasă nicio oră).
 */
export default function TimeInput({ value, onChange, optional = false, ariaLabel }) {
  const [h = '', m = ''] = (value || '').split(':');
  // păstrăm și minutele care nu sunt din 5 în 5 (ex. ore salvate mai demult)
  const minutes = m && !MINUTES.includes(m) ? [...MINUTES, m].sort() : MINUTES;

  const emit = (hh, mm) => onChange(hh ? `${hh}:${mm || '00'}` : '');

  return (
    <div className="time-input" role="group" aria-label={ariaLabel}>
      <select value={h} onChange={(e) => emit(e.target.value, m)} aria-label={ariaLabel ? `${ariaLabel} – ora` : undefined}>
        {(optional || !h) && <option value="">--</option>}
        {HOURS.map((x) => <option key={x} value={x}>{x}</option>)}
      </select>
      <span className="sep">:</span>
      <select value={h ? m || '00' : ''} disabled={!h} onChange={(e) => emit(h, e.target.value)}
        aria-label={ariaLabel ? `${ariaLabel} – minute` : undefined}>
        {!h && <option value="">--</option>}
        {minutes.map((x) => <option key={x} value={x}>{x}</option>)}
      </select>
      {optional && h && (
        <button type="button" className="clear" onClick={() => onChange('')} title="✕" aria-label="✕">✕</button>
      )}
    </div>
  );
}
