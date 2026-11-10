import { useEffect, useState } from 'react';
import { useLang } from '../i18n.jsx';

// Evenimentul de instalare poate veni înainte să apară butonul, așa că îl prindem global.
let deferred = null;
const listeners = new Set();
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferred = e;
    listeners.forEach((fn) => fn());
  });
  window.addEventListener('appinstalled', () => {
    deferred = null;
    listeners.forEach((fn) => fn());
  });
}

const isStandalone = () =>
  window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true;
const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent)
  || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

/** Buton „Instalează”: apare doar când browserul permite instalarea (sau pe iPhone/iPad, cu instrucțiuni). */
export default function InstallButton({ toast }) {
  const { t } = useLang();
  const [, rerender] = useState(0);
  const [iosHelp, setIosHelp] = useState(false);

  useEffect(() => {
    const fn = () => rerender((n) => n + 1);
    listeners.add(fn);
    return () => listeners.delete(fn);
  }, []);

  if (isStandalone()) return null;
  const ios = isIos();
  if (!deferred && !ios) return null;

  const install = async () => {
    if (ios) { setIosHelp(true); return; }
    deferred.prompt();
    const { outcome } = await deferred.userChoice;
    deferred = null;
    rerender((n) => n + 1);
    if (outcome === 'accepted') toast?.(t('Aplicația a fost instalată'));
  };

  return (
    <>
      <button className="btn install-btn" onClick={install} title={t('Instalează aplicația pe acest dispozitiv')}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 3v12m0 0l-5-5m5 5l5-5M5 20h14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {t('Instalează')}
      </button>
      {iosHelp && (
        <div className="overlay show" onMouseDown={(e) => e.target === e.currentTarget && setIosHelp(false)}>
          <div className="modal" style={{ maxWidth: 380 }}>
            <h2 style={{ fontSize: 19 }}>{t('Instalează aplicația')}</h2>
            <ol className="hint" style={{ paddingLeft: 18, lineHeight: 1.8 }}>
              <li>{t('Apasă butonul Partajare (pătratul cu săgeată în sus) din Safari.')}</li>
              <li>{t('Alege „Adaugă pe ecranul principal”.')}</li>
              <li>{t('Apasă „Adaugă”.')}</li>
            </ol>
            <div className="foot"><span /><button className="btn primary" onClick={() => setIosHelp(false)}>OK</button></div>
          </div>
        </div>
      )}
    </>
  );
}
