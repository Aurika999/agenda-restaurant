import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useStore } from './useStore';
import { todayIso } from './utils';
import { useLang } from './i18n.jsx';
import CalendarView from './components/CalendarView.jsx';
import ReservationList from './components/ReservationList.jsx';
import SettingsView from './components/SettingsView.jsx';
import ReservationModal from './components/ReservationModal.jsx';
import ContractModal from './components/ContractModal.jsx';
import InstallButton from './components/InstallButton.jsx';

const VIEWS = { calendar: 'Calendar', lista: 'Toate rezervările', setari: 'Setări' };
const VIEW_ICONS = { calendar: '📅', lista: '📋', setari: '⚙️' };

/** Pastila care alunecă sub fila activă (poziția se măsoară din butonul activ). */
function useSlider(dep) {
  const ref = useRef();
  const [style, setStyle] = useState({ opacity: 0 });
  useLayoutEffect(() => {
    const place = () => {
      const on = ref.current?.querySelector('button.on');
      if (on) setStyle({ left: on.offsetLeft, width: on.offsetWidth, opacity: 1 });
    };
    place();
    window.addEventListener('resize', place);
    document.fonts?.ready.then(place);
    return () => window.removeEventListener('resize', place);
  }, [dep]);
  return [ref, style];
}

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
  const [tabsRef, tabsSlider] = useSlider(view + lang + store.ready);
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
          <nav className="tabs" ref={tabsRef}>
            <span className="slider" style={tabsSlider} aria-hidden="true" />
            {Object.entries(VIEWS).map(([k, label]) => (
              <button key={k} className={view === k ? 'on' : ''} aria-current={view === k ? 'page' : undefined} onClick={() => setView(k)}>
                <span className="ico" aria-hidden="true">{VIEW_ICONS[k]}</span>{t(label)}
              </button>
            ))}
          </nav>
          <div className="top-acts">
            <InstallButton toast={toast} />
            <div className="lang-switch" role="group" aria-label="Limba / Мова" style={{ '--i': lang === 'uk' ? 1 : 0 }}>
              <span className="slider" aria-hidden="true" />
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
