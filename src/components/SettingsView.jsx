import { useRef, useState } from 'react';
import { downloadBlob, num, todayIso } from '../utils';

const PRESTATOR = [
  ['firma', 'Denumire firmă', 'c2', 'SC Exemplu SRL'],
  ['restaurant', 'Nume restaurant', 'c2', 'Restaurant …'],
  ['cui', 'CUI'], ['regcom', 'Nr. Reg. Com.'],
  ['adresa', 'Adresă', 'c2'],
  ['telefon', 'Telefon'], ['email', 'Email'],
  ['reprezentant', 'Reprezentant legal (nume, funcție)', 'c2', 'Ion Popescu, Administrator'],
  ['iban', 'IBAN / Banca', 'c2'],
  ['sali', 'Săli / zone disponibile (separate prin virgulă)', 'c4', 'Salon mare, Salon mic, Terasă'],
];
const CONDITII = [
  ['zileConfirmare', 'Confirmare nr. final invitați (zile înainte)', 'number'],
  ['zilePlata', 'Plata restului (zile înainte; 0 = la final)', 'number'],
  ['zileAnulare', 'Anulare fără penalități (zile înainte)', 'number'],
  ['moneda', 'Monedă', 'text'],
];

export default function SettingsView({ store, toast }) {
  const [f, setF] = useState(store.settings);
  const fileRef = useRef();
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    const out = { ...f };
    CONDITII.forEach(([k, , t]) => { if (t === 'number') out[k] = num(out[k]); });
    store.saveSettings(out);
    toast('Setări salvate');
  };

  const doExport = () => {
    downloadBlob(new Blob([store.exportData()], { type: 'application/json' }), `agenda-backup-${todayIso()}.json`);
  };
  const doImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try { store.importData(await file.text()); toast('Date importate'); }
    catch { toast('Fișierul nu este un backup valid'); }
    e.target.value = '';
  };

  return (
    <section className="card" style={{ maxWidth: 820 }}>
      <h2 style={{ fontSize: 20, marginBottom: 6 }}>Datele restaurantului</h2>
      <p className="hint">Aceste date apar automat în fiecare contract.</p>
      <form onSubmit={submit}>
        <fieldset>
          <legend>Prestator</legend>
          <div className="fg">
            {PRESTATOR.map(([k, label, cls, ph]) => (
              <div className={'f ' + (cls || '')} key={k}>
                <label>{label}</label>
                <input value={f[k] ?? ''} onChange={set(k)} placeholder={ph} />
              </div>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend>Condiții contract</legend>
          <div className="fg">
            {CONDITII.map(([k, label, type]) => (
              <div className="f" key={k}>
                <label>{label}</label>
                <input type={type} min={0} value={f[k] ?? ''} onChange={set(k)} />
              </div>
            ))}
            <div className="f c4">
              <label>Clauze suplimentare (opțional, câte una pe rând)</label>
              <textarea value={f.clauze} onChange={set('clauze')}
                placeholder="Ex: Accesul formațiilor de muzică este permis până la ora 02:00." />
            </div>
          </div>
        </fieldset>
        <button className="btn primary" type="submit">Salvează setările</button>
      </form>

      <fieldset style={{ marginTop: 20 }}>
        <legend>Backup date</legend>
        <p className="hint">Datele sunt salvate în acest browser. Fă din când în când un backup sau mută-le pe alt calculator.</p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn" type="button" onClick={doExport}>Exportă backup (.json)</button>
          <button className="btn" type="button" onClick={() => fileRef.current.click()}>Importă backup</button>
          <input ref={fileRef} type="file" accept=".json,application/json" hidden onChange={doImport} />
        </div>
      </fieldset>
    </section>
  );
}
