import { useCallback, useEffect, useRef, useState } from 'react';
import { useStore } from './useStore';
import { todayIso } from './utils';
import CalendarView from './components/CalendarView.jsx';
import ReservationList from './components/ReservationList.jsx';
import SettingsView from './components/SettingsView.jsx';
import ReservationModal from './components/ReservationModal.jsx';
import ContractModal from './components/ContractModal.jsx';

const VIEWS = { calendar: 'Calendar', lista: 'Toate rezervările', setari: 'Setări restaurant' };

export default function App() {
  const store = useStore();
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

  const handleSave = (data, id) => {
    store.saveReservation(data, id);
    setSel(data.data);
    setMonth(data.data.slice(0, 7));
    setEditing(null);
    toast(id ? 'Rezervare actualizată' : 'Rezervare adăugată');
  };
  const handleDelete = (id) => {
    store.deleteReservation(id);
    setEditing(null);
    toast('Rezervare ștearsă');
  };

  const contractRes = store.reservations.find((r) => r.id === contractId);

  return (
    <>
      <div className="wrap">
        <header className="top">
          <div>
            <h1>{store.settings.restaurant || 'Agenda Rezervări'}</h1>
            <div className="sub">Programul rezervărilor și contractele pentru evenimente</div>
          </div>
          <nav className="tabs">
            {Object.entries(VIEWS).map(([k, label]) => (
              <button key={k} className={view === k ? 'on' : ''} onClick={() => setView(k)}>{label}</button>
            ))}
          </nav>
          <button className="btn primary" onClick={() => openNew()}>+ Rezervare nouă</button>
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
        <ContractModal reservation={contractRes} settings={store.settings} toast={toast} onClose={() => setContractId(null)} />
      )}
      <div className={'toast' + (toastMsg ? ' show' : '')}>{toastMsg}</div>
    </>
  );
}
