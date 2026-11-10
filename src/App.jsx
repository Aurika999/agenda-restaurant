import { useCallback, useEffect, useRef, useState } from 'react';
import { useStore } from './useStore';
import { todayIso } from './utils';
import { useLang } from './i18n.jsx';
import CalendarView from './components/CalendarView.jsx';
import ReservationList from './components/ReservationList.jsx';
import SettingsView from './components/SettingsView.jsx';
import ReservationModal from './components/ReservationModal.jsx';
import ContractModal from './components/ContractModal.jsx';

const VIEWS = { calendar: 'Calendar', lista: 'Toate rezervările', setari: 'Setări restaurant' };

const Flag = ({ stripes, vertical }) => (
  <svg className="flag" viewBox="0 0 3 2" aria-hidden="true">
    {stripes.map((c, i) => vertical
      ? <rect key={c} x={i} y="0" width="1" height="2" fill={c} />
      : <rect key={c} x="0" y={i} width="3" height="1" fill={c} />)}
  </svg>
);

const LANGS = [
  { code: 'ro', label: 'RO', title: 'Română', flag: <Flag vertical stripes={['#002B7F', '#FCD116', '#CE1126']} /> },
  { code: 'uk', label: 'UA', title: 'Українська', flag: <Flag stripes={['#0057B7', '#FFD700']} /> },
];

export default function App({ user }) {
  const store = useStore(user);
  const { t, lang, setLang } = useLang();
  const [view, setView] = useState(() => {
    const h = window.location.hash.slice(1);
    return VIEWS[h] ? h : 'calendar';
  });
  const [sel, setSel] = useState(todayIso());
  const [month, setMonth] = useState(todayIso().slice(0, 7));
  const [editing, setEditing] = useState(null); // {reservation|null, date}
  const [contractId, setContractId] = useState(null);
  const [toastMsg, setToastMsg] = useState('');
  const toastTimer = useRef();

  const toast = useCallback((msg) => {
    setToastMsg(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(''), 2200);
  }, []);

  useEffect(() => { window.history.replaceState(null, '', '#' + view); }, [view]);
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') { setEditing(null); setContractId(null); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const openNew = (date) => setEditing({ reservation: null, date: date || sel });
  const openEdit = (r) => setEditing({ reservation: r, date: r.data });

  const handleSave = async (data, id) => {
    try {
      await store.saveReservation(data, id);
    } catch (e) {
      console.error(e);
      toast(t('Eroare la salvare. Verifică internetul și încearcă din nou.'));
      return;
    }
    setSel(data.data);
    setMonth(data.data.slice(0, 7));
    setEditing(null);
    toast(t(id ? 'Rezervare actualizată' : 'Rezervare adăugată'));
  };
  const handleDelete = async (id) => {
    try {
      await store.deleteReservation(id);
    } catch (e) {
      console.error(e);
      toast(t('Eroare la ștergere. Verifică internetul și încearcă din nou.'));
      return;
    }
    setEditing(null);
    toast(t('Rezervare ștearsă'));
  };

  useEffect(() => {
    if (store.error) toast(t('Eroare Firebase: {e}', { e: store.error }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.error]);

  if (!store.ready) return <div className="login-wrap"><div className="hint">{t('Se încarcă datele din cloud…')}</div></div>;

  const contractRes = store.reservations.find((r) => r.id === contractId);

  return (
    <>
      <div className="wrap">
        <header className="top">
          <div>
            <h1>{store.settings.restaurant || t('Agenda Rezervări')}</h1>
            <div className="sub">{t('Programul rezervărilor și contractele pentru evenimente')}</div>
          </div>
          <nav className="tabs">
            {Object.entries(VIEWS).map(([k, label]) => (
              <button key={k} className={view === k ? 'on' : ''} onClick={() => setView(k)}>{t(label)}</button>
            ))}
          </nav>
          <div className="top-acts">
            <div className="lang-switch" role="group" aria-label="Limba / Мова">
              {LANGS.map(({ code, label, title, flag }) => (
                <button
                  key={code}
                  className={lang === code ? 'on' : ''}
                  aria-pressed={lang === code}
                  title={title}
                  onClick={() => setLang(code)}
                >
                  {flag}{label}
                </button>
              ))}
            </div>
            <button className="btn primary" onClick={() => openNew()}>{t('+ Rezervare nouă')}</button>
          </div>
        </header>

        {view === 'calendar' && (
          <CalendarView
            store={store} sel={sel} setSel={setSel} month={month} setMonth={setMonth}
            onNew={openNew} onEdit={openEdit} onContract={setContractId}
          />
        )}
        {view === 'lista' && <ReservationList store={store} onEdit={openEdit} onContract={setContractId} />}
        {view === 'setari' && <SettingsView store={store} toast={toast} />}
      </div>

      {editing && (
        <ReservationModal
          key={editing.reservation?.id || 'new'}
          initial={editing.reservation}
          date={editing.date}
          store={store}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => setEditing(null)}
        />
      )}
      {contractRes && (
        <ContractModal reservation={contractRes} settings={store.settings} toast={toast} onSaveContract={store.cloud ? store.saveContract : null} onClose={() => setContractId(null)} />
      )}
      <div className={'toast' + (toastMsg ? ' show' : '')}>{toastMsg}</div>
    </>
  );
}
