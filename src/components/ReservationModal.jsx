import { useEffect, useRef, useState } from 'react';
import { EMPTY_RESERVATION, EVENT_TYPES, STATUS, findConflicts, fmtDate, money, num, salaList, totals } from '../utils';

function Field({ label, cls = '', children }) {
  return <div className={'f ' + cls}><label>{label}</label>{children}</div>;
}

export default function ReservationModal({ initial, date, store, onSave, onDelete, onClose }) {
  const [f, setF] = useState(() => ({ ...EMPTY_RESERVATION, ...(initial || { data: date }) }));
  const [confirmDel, setConfirmDel] = useState(false);
  const formRef = useRef();
  const firstRef = useRef();
  const cur = store.settings.moneda;

  useEffect(() => { firstRef.current?.focus(); }, []);

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const inp = (k, props = {}) => <input value={f[k] ?? ''} onChange={set(k)} {...props} />;

  const t = totals(f);
  const conflicts = findConflicts(f, store.reservations, initial?.id);

  const save = () => {
    if (!formRef.current.reportValidity()) return;
    const clean = Object.fromEntries(Object.keys(EMPTY_RESERVATION).map((k) => [k, String(f[k] ?? '').trim()]));
    onSave(clean, initial?.id);
  };

  return (
    <div className="overlay show" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h2>{initial ? `Editează rezervarea${initial.nr ? ' · Contract nr. ' + initial.nr : ''}` : 'Rezervare nouă'}</h2>
        <form ref={formRef} onSubmit={(e) => { e.preventDefault(); save(); }}>
          <fieldset>
            <legend>Client</legend>
            <div className="fg">
              <Field label="Nume și prenume *" cls="c2">{inp('client', { required: true, ref: firstRef })}</Field>
              <Field label="Telefon *">{inp('telefon', { required: true, type: 'tel' })}</Field>
              <Field label="Email">{inp('email', { type: 'email' })}</Field>
              <Field label="Adresă (pentru contract)" cls="c2">{inp('adresa')}</Field>
              <Field label="CI seria / nr. sau CNP / CUI (opțional)" cls="c2">{inp('act')}</Field>
            </div>
          </fieldset>

          <fieldset>
            <legend>Eveniment</legend>
            <div className="fg">
              <Field label="Tip eveniment">
                <select value={f.tip} onChange={set('tip')}>{EVENT_TYPES.map((x) => <option key={x}>{x}</option>)}</select>
              </Field>
              <Field label="Data *">{inp('data', { type: 'date', required: true })}</Field>
              <Field label="Ora început">{inp('oraStart', { type: 'time' })}</Field>
              <Field label="Ora sfârșit">{inp('oraSfarsit', { type: 'time' })}</Field>
              <Field label="Nr. persoane adulți *">{inp('persoane', { type: 'number', min: 1, required: true })}</Field>
              <Field label="Nr. copii">{inp('copii', { type: 'number', min: 0 })}</Field>
              <Field label="Sala / zona" cls="c2">
                {inp('sala', { list: 'sali-list' })}
                <datalist id="sali-list">{salaList(store.settings).map((s) => <option key={s} value={s} />)}</datalist>
              </Field>
              <Field label="Status">
                <select value={f.status} onChange={set('status')}>
                  {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </Field>
            </div>
            {conflicts.length > 0 && (
              <div className="warn show">
                ⚠ Atenție: în aceeași zi{f.sala ? ' și sală' : ''} există deja:{' '}
                {conflicts.map((r) => `${r.client} (${r.oraStart || '?'}${r.sala ? ', ' + r.sala : ''})`).join('; ')}
              </div>
            )}
          </fieldset>

          <fieldset>
            <legend>Meniu și servicii</legend>
            <div className="fg">
              <Field label="Meniu ales (preparate)" cls="c4">
                <textarea value={f.meniu} onChange={set('meniu')} placeholder="Aperitiv rece, Sarmale, Friptură de porc cu cartofi, Tort…" />
              </Field>
              <Field label="Preț meniu / adult">{inp('pretPers', { type: 'number', min: 0, step: '0.01' })}</Field>
              <Field label="Preț meniu / copil">{inp('pretCopil', { type: 'number', min: 0, step: '0.01' })}</Field>
              <Field label="Băuturi" cls="c2">{inp('bauturi', { placeholder: 'Incluse în meniu / aduse de client / separat' })}</Field>
              <Field label="Servicii suplimentare (descriere)" cls="c2">{inp('extra', { placeholder: 'Decor, formație, DJ, candy bar…' })}</Field>
              <Field label="Cost servicii suplimentare">{inp('extraCost', { type: 'number', min: 0, step: '0.01' })}</Field>
              <Field label="Avans achitat">{inp('avans', { type: 'number', min: 0, step: '0.01' })}</Field>
              <Field label="Observații / cerințe speciale" cls="c4">
                <textarea value={f.obs} onChange={set('obs')} placeholder="Alergii, meniu vegetarian, aranjarea meselor…" />
              </Field>
            </div>
            <div className="calc">
              <span>Meniu: <b>{money(t.meniu, cur)}</b></span>
              <span>Suplimentar: <b>{money(num(f.extraCost), cur)}</b></span>
              <span>Total: <b>{money(t.total, cur)}</b></span>
              <span>Rest de plată: <b>{money(t.rest, cur)}</b></span>
            </div>
          </fieldset>
          <button type="submit" hidden />
        </form>

        <div className="foot">
          <div>{initial && <button className="btn danger" onClick={() => setConfirmDel(true)}>Șterge</button>}</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn" onClick={onClose}>Renunță</button>
            <button className="btn primary" onClick={save}>Salvează</button>
          </div>
        </div>
      </div>

      {confirmDel && (
        <div className="overlay show" onMouseDown={(e) => e.target === e.currentTarget && setConfirmDel(false)}>
          <div className="modal" style={{ maxWidth: 420 }}>
            <h2 style={{ fontSize: 19 }}>Ștergi rezervarea?</h2>
            <p className="hint">
              {initial.client} — {fmtDate(initial.data)}. Acțiunea nu poate fi anulată. (Poți și să schimbi statusul în „Anulat”.)
            </p>
            <div className="foot">
              <span />
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn" onClick={() => setConfirmDel(false)}>Nu</button>
                <button className="btn primary danger-fill" onClick={() => onDelete(initial.id)}>Da, șterge</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
