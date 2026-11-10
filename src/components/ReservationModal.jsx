import { useEffect, useRef, useState } from 'react';
import { EMPTY_RESERVATION, EVENT_TYPES, STATUS, findConflicts, fmtDate, money, num, salaList, totals } from '../utils';
import { useLang } from '../i18n.jsx';

function Field({ label, cls = '', children }) {
  return <div className={'f ' + cls}><label>{label}</label>{children}</div>;
}

export default function ReservationModal({ initial, date, store, onSave, onDelete, onClose }) {
  const [f, setF] = useState(() => ({ ...EMPTY_RESERVATION, ...(initial || { data: date }) }));
  const [confirmDel, setConfirmDel] = useState(false);
  const { t: tr, lang } = useLang();
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
        <h2>{initial ? tr('Editează rezervarea') + (initial.nr ? tr(' · Contract nr. {n}', { n: initial.nr }) : '') : tr('Rezervare nouă')}</h2>
        <form ref={formRef} onSubmit={(e) => { e.preventDefault(); save(); }}>
          <fieldset>
            <legend>{tr('Client')}</legend>
            <div className="fg">
              <Field label={tr('Nume și prenume *')} cls="c2">{inp('client', { required: true, ref: firstRef })}</Field>
              <Field label={tr('Telefon *')}>{inp('telefon', { required: true, type: 'tel' })}</Field>
              <Field label={tr('Email')}>{inp('email', { type: 'email' })}</Field>
              <Field label={tr('Adresă (pentru contract)')} cls="c2">{inp('adresa')}</Field>
              <Field label={tr('CI seria / nr. sau CNP / CUI (opțional)')} cls="c2">{inp('act')}</Field>
            </div>
          </fieldset>

          <fieldset>
            <legend>{tr('Eveniment')}</legend>
            <div className="fg">
              <Field label={tr('Tip eveniment')}>
                <select value={f.tip} onChange={set('tip')}>{EVENT_TYPES.map((x) => <option key={x} value={x}>{tr(x)}</option>)}</select>
              </Field>
              <Field label={tr('Data *')}>{inp('data', { type: 'date', required: true })}</Field>
              <Field label={tr('Ora început')}>{inp('oraStart', { type: 'time' })}</Field>
              <Field label={tr('Ora sfârșit')}>{inp('oraSfarsit', { type: 'time' })}</Field>
              <Field label={tr('Nr. persoane adulți *')}>{inp('persoane', { type: 'number', min: 1, required: true })}</Field>
              <Field label={tr('Nr. copii')}>{inp('copii', { type: 'number', min: 0 })}</Field>
              <Field label={tr('Sala / zona')} cls="c2">
                {inp('sala', { list: 'sali-list' })}
                <datalist id="sali-list">{salaList(store.settings).map((s) => <option key={s} value={s} />)}</datalist>
              </Field>
              <Field label={tr('Status')}>
                <select value={f.status} onChange={set('status')}>
                  {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{tr(v)}</option>)}
                </select>
              </Field>
            </div>
            {conflicts.length > 0 && (
              <div className="warn show">
                {tr(f.sala ? '⚠ Atenție: în aceeași zi și sală există deja:' : '⚠ Atenție: în aceeași zi există deja:')}{' '}
                {conflicts.map((r) => `${r.client} (${r.oraStart || '?'}${r.sala ? ', ' + r.sala : ''})`).join('; ')}
              </div>
            )}
          </fieldset>

          <fieldset>
            <legend>{tr('Meniu și servicii')}</legend>
            <div className="fg">
              <Field label={tr('Meniu ales (preparate)')} cls="c4">
                <textarea value={f.meniu} onChange={set('meniu')} placeholder={tr('Aperitiv rece, Sarmale, Friptură de porc cu cartofi, Tort…')} />
              </Field>
              <Field label={tr('Preț meniu / adult')}>{inp('pretPers', { type: 'number', min: 0, step: '0.01' })}</Field>
              <Field label={tr('Preț meniu / copil')}>{inp('pretCopil', { type: 'number', min: 0, step: '0.01' })}</Field>
              <Field label={tr('Băuturi')} cls="c2">{inp('bauturi', { placeholder: tr('Incluse în meniu / aduse de client / separat') })}</Field>
              <Field label={tr('Servicii suplimentare (descriere)')} cls="c2">{inp('extra', { placeholder: tr('Decor, formație, DJ, candy bar…') })}</Field>
              <Field label={tr('Cost servicii suplimentare')}>{inp('extraCost', { type: 'number', min: 0, step: '0.01' })}</Field>
              <Field label={tr('Avans achitat')}>{inp('avans', { type: 'number', min: 0, step: '0.01' })}</Field>
              <Field label={tr('Observații / cerințe speciale')} cls="c4">
                <textarea value={f.obs} onChange={set('obs')} placeholder={tr('Alergii, meniu vegetarian, aranjarea meselor…')} />
              </Field>
            </div>
            <div className="calc">
              <span>{tr('Meniu:')} <b>{money(t.meniu, cur)}</b></span>
              <span>{tr('Suplimentar:')} <b>{money(num(f.extraCost), cur)}</b></span>
              <span>{tr('Total:')} <b>{money(t.total, cur)}</b></span>
              <span>{tr('Rest de plată:')} <b>{money(t.rest, cur)}</b></span>
            </div>
          </fieldset>
          <button type="submit" hidden />
        </form>

        <div className="foot">
          <div>{initial && <button className="btn danger" onClick={() => setConfirmDel(true)}>{tr('Șterge')}</button>}</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn" onClick={onClose}>{tr('Renunță')}</button>
            <button className="btn primary" onClick={save}>{tr('Salvează')}</button>
          </div>
        </div>
      </div>

      {confirmDel && (
        <div className="overlay show" onMouseDown={(e) => e.target === e.currentTarget && setConfirmDel(false)}>
          <div className="modal" style={{ maxWidth: 420 }}>
            <h2 style={{ fontSize: 19 }}>{tr('Ștergi rezervarea?')}</h2>
            <p className="hint">
              {initial.client} — {fmtDate(initial.data, lang)}. {tr('Acțiunea nu poate fi anulată. (Poți și să schimbi statusul în „Anulat”.)')}
            </p>
            <div className="foot">
              <span />
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn" onClick={() => setConfirmDel(false)}>{tr('Nu')}</button>
                <button className="btn primary danger-fill" onClick={() => onDelete(initial.id)}>{tr('Da, șterge')}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
