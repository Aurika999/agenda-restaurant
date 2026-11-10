import { useEffect, useState } from 'react';
import { DEFAULT_SETTINGS } from './utils';

const KEY = 'agenda-restaurant-v1';

/** Completează setările lipsă și trece moneda veche „lei” la EUR. */
const withDefaults = (settings) => {
  const s = { ...DEFAULT_SETTINGS, ...settings };
  if (!s.moneda || /^(lei|ron)$/i.test(s.moneda.trim())) s.moneda = 'EUR';
  return s;
};

function load() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (s) return { settings: withDefaults(s.settings), reservations: s.reservations || [], nextNo: s.nextNo || 1 };
  } catch { /* ignore */ }
  return { settings: DEFAULT_SETTINGS, reservations: [], nextNo: 1 };
}

/** Starea aplicației, salvată automat în localStorage. */
export function useStore() {
  const [state, setState] = useState(load);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ }
  }, [state]);

  const saveReservation = (data, id) => {
    let saved;
    setState((s) => {
      if (id) {
        const reservations = s.reservations.map((r) =>
          r.id === id ? (saved = { ...r, ...data, modificat: new Date().toISOString() }) : r);
        return { ...s, reservations };
      }
      saved = {
        ...data,
        id: 'r' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        nr: s.nextNo,
        creat: new Date().toISOString().slice(0, 10),
      };
      return { ...s, reservations: [...s.reservations, saved], nextNo: s.nextNo + 1 };
    });
    return saved;
  };

  const deleteReservation = (id) =>
    setState((s) => ({ ...s, reservations: s.reservations.filter((r) => r.id !== id) }));

  const saveSettings = (settings) => setState((s) => ({ ...s, settings }));

  const exportData = () => JSON.stringify(state, null, 2);
  const importData = (json) => {
    const d = JSON.parse(json);
    if (!Array.isArray(d.reservations)) throw new Error('Fișier invalid');
    setState({ settings: withDefaults(d.settings), reservations: d.reservations, nextNo: d.nextNo || d.reservations.length + 1 });
  };

  return { ...state, saveReservation, deleteReservation, saveSettings, exportData, importData };
}
