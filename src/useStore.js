import { useEffect, useRef, useState } from 'react';
import {
  collection, doc, getDoc, onSnapshot, serverTimestamp, setDoc, writeBatch,
} from 'firebase/firestore';
import { db, firebaseEnabled } from './firebase';
import { DEFAULT_SETTINGS } from './utils';

const KEY = 'agenda-restaurant-v1';

/** Completează setările lipsă și trece moneda veche „lei” la EUR. */
const withDefaults = (settings) => {
  const s = { ...DEFAULT_SETTINGS, ...settings };
  if (!s.moneda || /^(lei|ron)$/i.test(String(s.moneda).trim())) s.moneda = 'EUR';
  return s;
};

const newId = () => 'r' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const today = () => new Date().toISOString().slice(0, 10);

function loadLocal() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (s) return { settings: withDefaults(s.settings), reservations: s.reservations || [], nextNo: s.nextNo || 1 };
  } catch { /* ignore */ }
  return { settings: withDefaults(), reservations: [], nextNo: 1 };
}

function parseBackup(json) {
  const d = JSON.parse(json);
  if (!Array.isArray(d.reservations)) throw new Error('Fișier invalid');
  return { settings: withDefaults(d.settings), reservations: d.reservations, nextNo: d.nextNo || d.reservations.length + 1 };
}

/** Mod local: datele stau doar în acest browser (localStorage). */
function useLocalStore() {
  const [state, setState] = useState(loadLocal);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ }
  }, [state]);

  const saveReservation = async (data, id) => {
    setState((s) => {
      if (id) {
        const reservations = s.reservations.map((r) => (r.id === id ? { ...r, ...data, modificat: new Date().toISOString() } : r));
        return { ...s, reservations };
      }
      const saved = { ...data, id: newId(), nr: s.nextNo, creat: today() };
      return { ...s, reservations: [...s.reservations, saved], nextNo: s.nextNo + 1 };
    });
  };
  const deleteReservation = async (id) =>
    setState((s) => ({ ...s, reservations: s.reservations.filter((r) => r.id !== id) }));
  const saveSettings = async (settings) => setState((s) => ({ ...s, settings }));
  const importData = async (json) => setState(parseBackup(json));

  return {
    ...state, ready: true, cloud: false, error: null,
    saveReservation, deleteReservation, saveSettings, importData,
    saveContract: async () => false,
    exportData: () => JSON.stringify(state, null, 2),
  };
}

/**
 * Mod Firebase: totul se salvează în Firestore, separat pentru fiecare cont:
 *   users/{uid}                    → setări + numărul următorului contract
 *   users/{uid}/reservations/{id}  → rezervările
 *   users/{uid}/contracts/{id}     → copia contractului (HTML + text), pe id-ul rezervării
 */
function useCloudStore(user) {
  const uid = user.uid;
  const [settings, setSettings] = useState(withDefaults());
  const [nextNo, setNextNo] = useState(1);
  const [reservations, setReservations] = useState([]);
  const [loaded, setLoaded] = useState({ meta: null, res: false }); // meta: null = încă se încarcă, apoi true/false = există
  const [error, setError] = useState(null);
  const migrated = useRef(false);

  const userRef = doc(db, 'users', uid);
  const resCol = collection(db, 'users', uid, 'reservations');
  const resRef = (id) => doc(db, 'users', uid, 'reservations', id);
  const contractRef = (id) => doc(db, 'users', uid, 'contracts', id);

  useEffect(() => {
    const onErr = (e) => { console.error(e); setError(e.code || e.message); };
    const u1 = onSnapshot(userRef, (snap) => {
      const d = snap.data() || {};
      setSettings(withDefaults(d.settings));
      setNextNo(d.nextNo || 1);
      setLoaded((l) => ({ ...l, meta: snap.exists() }));
    }, onErr);
    const u2 = onSnapshot(resCol, (qs) => {
      setReservations(qs.docs.map((d) => ({ ...d.data(), id: d.id })));
      setLoaded((l) => ({ ...l, res: true }));
    }, onErr);
    return () => { u1(); u2(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]);

  const writeAll = async ({ settings: st, reservations: list, nextNo: nn }) => {
    // Firestore permite max. 500 operații într-un batch.
    for (let i = 0; i < list.length; i += 400) {
      const b = writeBatch(db);
      list.slice(i, i + 400).forEach((r) => {
        const { id, ...rest } = r;
        b.set(resRef(id || newId()), rest);
      });
      await b.commit();
    }
    await setDoc(userRef, { settings: st, nextNo: nn }, { merge: true });
  };

  // Prima conectare: dacă în cloud nu e nimic, urcăm datele existente din acest browser.
  useEffect(() => {
    if (migrated.current || loaded.meta !== false || !loaded.res || reservations.length) return;
    migrated.current = true;
    const local = loadLocal();
    if (local.reservations.length || localStorage.getItem(KEY)) writeAll(local).catch((e) => setError(e.code || e.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, reservations.length]);

  const saveReservation = async (data, id) => {
    if (id) {
      await setDoc(resRef(id), { ...data, modificat: new Date().toISOString() }, { merge: true });
      return;
    }
    const nr = Math.max(nextNo, ...reservations.map((r) => (Number(r.nr) || 0) + 1));
    const b = writeBatch(db);
    b.set(resRef(newId()), { ...data, nr, creat: today() });
    b.set(userRef, { nextNo: nr + 1 }, { merge: true });
    await b.commit();
  };

  const deleteReservation = async (id) => {
    const b = writeBatch(db);
    b.delete(resRef(id));
    b.delete(contractRef(id));
    await b.commit();
  };

  const saveSettings = (st) => setDoc(userRef, { settings: st }, { merge: true });
  const importData = (json) => writeAll(parseBackup(json));

  /** Salvează copia contractului; scrie doar dacă textul s-a schimbat. */
  const saveContract = async (r, html, text) => {
    const ref = contractRef(r.id);
    const prev = await getDoc(ref).catch(() => null);
    if (prev?.exists() && prev.data().html === html) return true;
    await setDoc(ref, {
      reservationId: r.id, nr: r.nr ?? null, client: r.client || '', dataEveniment: r.data || '',
      html, text, salvat: serverTimestamp(),
    });
    return true;
  };

  return {
    settings, reservations, nextNo,
    ready: loaded.meta !== null && loaded.res,
    cloud: true, error, user,
    saveReservation, deleteReservation, saveSettings, importData, saveContract,
    exportData: () => JSON.stringify({ settings, reservations, nextNo }, null, 2),
  };
}

export const useStore = firebaseEnabled ? useCloudStore : useLocalStore;
