export const MONTHS = ['ianuarie', 'februarie', 'martie', 'aprilie', 'mai', 'iunie', 'iulie', 'august', 'septembrie', 'octombrie', 'noiembrie', 'decembrie'];
export const DOW = ['Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm', 'Dum'];
const DOWL = ['duminică', 'luni', 'marți', 'miercuri', 'joi', 'vineri', 'sâmbătă'];
// Ucraineană: luna la genitiv („10 листопада 2026”), zilele de la duminică
const MONTHS_UK_GEN = ['січня', 'лютого', 'березня', 'квітня', 'травня', 'червня', 'липня', 'серпня', 'вересня', 'жовтня', 'листопада', 'грудня'];
const DOWL_UK = ['неділя', 'понеділок', 'вівторок', 'середа', 'четвер', 'пʼятниця', 'субота'];

export const STATUS = { confirmat: 'Confirmat', asteptare: 'În așteptare', anulat: 'Anulat' };
export const EVENT_TYPES = ['Nuntă', 'Botez', 'Cununie civilă', 'Aniversare', 'Majorat', 'Petrecere corporate', 'Parastas', 'Cină / masă rezervată', 'Alt eveniment'];

export const DEFAULT_SETTINGS = {
  firma: '', restaurant: '', cui: '', regcom: '', adresa: '', telefon: '', email: '',
  reprezentant: '', iban: '', sali: 'Salon mare, Salon mic, Terasă',
  zileConfirmare: 7, zilePlata: 0, zileAnulare: 30, moneda: 'EUR', clauze: '',
};

export const EMPTY_RESERVATION = {
  client: '', telefon: '', email: '', adresa: '', act: '', tip: 'Nuntă', data: '',
  oraStart: '18:00', oraSfarsit: '', persoane: '', copii: '', sala: '', status: 'asteptare',
  meniu: '', pretPers: '', pretCopil: '', bauturi: '', extra: '', extraCost: '', avans: '', obs: '',
};

export const num = (v) => { const n = parseFloat(v); return isNaN(n) ? 0 : n; };
const pad = (n) => String(n).padStart(2, '0');
export const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const parseIso = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
export const todayIso = () => iso(new Date());

export const fmtDate = (s, lang = 'ro') => {
  if (!s) return '—';
  const d = parseIso(s);
  return `${d.getDate()} ${(lang === 'uk' ? MONTHS_UK_GEN : MONTHS)[d.getMonth()]} ${d.getFullYear()}`;
};
export const fmtDateLong = (s, lang = 'ro') =>
  `${(lang === 'uk' ? DOWL_UK : DOWL)[parseIso(s).getDay()]}, ${fmtDate(s, lang)}`;

export const money = (v, cur = 'EUR') =>
  `${num(v).toLocaleString('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${cur || 'EUR'}`;

export const totals = (r) => {
  const meniu = num(r.persoane) * num(r.pretPers) + num(r.copii) * num(r.pretCopil);
  const total = meniu + num(r.extraCost);
  return { meniu, total, rest: total - num(r.avans) };
};

export const sortRes = (arr) =>
  arr.slice().sort((a, b) => (a.data + (a.oraStart || '')).localeCompare(b.data + (b.oraStart || '')));

export const salaList = (settings) =>
  (settings.sali || '').split(',').map((s) => s.trim()).filter(Boolean);

const toMin = (t) => { if (!t) return null; const [a, b] = t.split(':').map(Number); return a * 60 + b; };
const span = (r) => {
  const s = toMin(r.oraStart);
  if (s == null) return null;
  let e = toMin(r.oraSfarsit) ?? s + 240; // fără oră de final: presupunem 4 ore
  if (e <= s) e += 1440; // trece de miezul nopții
  return [s, e];
};

/** Rezervări active din aceeași zi și sală care se suprapun ca interval orar. */
export function findConflicts(res, all, ignoreId) {
  if (!res.data) return [];
  const a = span(res);
  return all.filter((r) => {
    if (r.id === ignoreId || r.data !== res.data || r.status === 'anulat') return false;
    if (res.sala && r.sala && res.sala.toLowerCase() !== r.sala.toLowerCase()) return false;
    const b = span(r);
    if (!a || !b) return true;
    return a[0] < b[1] && b[0] < a[1];
  });
}

export const fileBase = (r) =>
  `Contract_${r.nr || ''}_${(r.client || 'client').replace(/[^\p{L}\p{N}]+/gu, '_')}_${r.data}`;

export function downloadBlob(blob, filename) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
}
