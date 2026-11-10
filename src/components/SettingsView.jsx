import { useRef, useState } from 'react';
import { downloadBlob, num, todayIso } from '../utils';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useLang } from '../i18n.jsx';

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
  const { t } = useLang();
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    const out = { ...f };
    CONDITII.forEach(([k, , ty]) => { if (ty === 'number') out[k] = num(out[k]); });
    try {
      await store.saveSettings(out);
      toast(t('Setări salvate'));
    } catch (err) {
      console.error(err);
      toast(t('Eroare la salvare. Verifică internetul și încearcă din nou.'));
    }
  };

  const doExport = () => {
    downloadBlob(new Blob([store.exportData()], { type: 'application/json' }), `agenda-backup-${todayIso()}.json`);
  };
  const doImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try { await store.importData(await file.text()); toast(t('Date importate')); }
    catch { toast(t('Fișierul nu este un backup valid')); }
    e.target.value = '';
  };

  return (
    <section className="card" style={{ maxWidth: 820 }}>
      <h2 style={{ fontSize: 20, marginBottom: 6 }}>{t('Datele restaurantului')}</h2>
      <p className="hint">{t('Aceste date apar automat în fiecare contract.')}</p>
      <form onSubmit={submit}>
        <fieldset>
          <legend>{t('Prestator')}</legend>
          <div className="fg">
            {PRESTATOR.map(([k, label, cls, ph]) => (
              <div className={'f ' + (cls || '')} key={k}>
                <label>{t(label)}</label>
                <input value={f[k] ?? ''} onChange={set(k)} placeholder={ph} />
              </div>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend>{t('Condiții contract')}</legend>
          <div className="fg">
            {CONDITII.map(([k, label, type]) => (
              <div className="f" key={k}>
                <label>{t(label)}</label>
                <input type={type} min={0} value={f[k] ?? ''} onChange={set(k)} />
              </div>
            ))}
            <div className="f c4">
              <label>{t('Clauze suplimentare (opțional, câte una pe rând)')}</label>
              <textarea value={f.clauze} onChange={set('clauze')}
                placeholder="Ex: Accesul formațiilor de muzică este permis până la ora 02:00." />
            </div>
          </div>
        </fieldset>
        <button className="btn primary" type="submit">{t('Salvează setările')}</button>
      </form>

      <fieldset style={{ marginTop: 20 }}>
        <legend>{t('Backup date')}</legend>
        <p className="hint">
          {store.cloud
            ? t('Datele sunt salvate în Firebase și apar pe orice dispozitiv pe care intri în cont. Backup-ul (.json) e o copie în plus.')
            : t('Datele sunt salvate în acest browser. Fă din când în când un backup sau mută-le pe alt calculator.')}
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn" type="button" onClick={doExport}>{t('Exportă backup (.json)')}</button>
          <button className="btn" type="button" onClick={() => fileRef.current.click()}>{t('Importă backup')}</button>
          <input ref={fileRef} type="file" accept=".json,application/json" hidden onChange={doImport} />
        </div>
      </fieldset>

      {store.cloud && (
        <fieldset style={{ marginTop: 20 }}>
          <legend>{t('Cont')}</legend>
          <p className="hint">{t('Conectat ca {e}', { e: store.user.email })}</p>
          <button className="btn" type="button" onClick={() => signOut(auth)}>{t('Ieși din cont')}</button>
        </fieldset>
      )}
    </section>
  );
}
