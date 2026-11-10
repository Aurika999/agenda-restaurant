import { useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword, onAuthStateChanged, sendPasswordResetEmail, signInWithEmailAndPassword,
} from 'firebase/auth';
import { auth, firebaseEnabled } from '../firebase';
import { useLang } from '../i18n.jsx';
import InstallButton from './InstallButton.jsx';

const ERRORS = {
  'auth/invalid-credential': 'Email sau parolă greșită.',
  'auth/invalid-email': 'Adresa de email nu este validă.',
  'auth/too-many-requests': 'Prea multe încercări. Încearcă din nou peste câteva minute.',
  'auth/network-request-failed': 'Nu există conexiune la internet.',
  'auth/email-already-in-use': 'Există deja un cont cu acest email. Intră în cont.',
  'auth/weak-password': 'Parola trebuie să aibă cel puțin 6 caractere.',
  'auth/operation-not-allowed': 'Crearea de conturi nu este activată în Firebase.',
};

function Login() {
  const { t } = useLang();
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [pass2, setPass2] = useState('');
  const [mode, setMode] = useState('login'); // login | register
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setMsg('');
    if (mode === 'register') {
      if (pass.length < 6) { setMsg(t('Parola trebuie să aibă cel puțin 6 caractere.')); return; }
      if (pass !== pass2) { setMsg(t('Parolele nu coincid.')); return; }
    }
    setBusy(true);
    try {
      if (mode === 'register') await createUserWithEmailAndPassword(auth, email.trim(), pass);
      else await signInWithEmailAndPassword(auth, email.trim(), pass);
    } catch (err) {
      setMsg(t(ERRORS[err.code] || 'Autentificarea a eșuat.'));
    } finally {
      setBusy(false);
    }
  };

  const reset = async () => {
    if (!email.trim()) { setMsg(t('Scrie mai întâi adresa de email.')); return; }
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setMsg(t('Ți-am trimis pe email un link pentru resetarea parolei.'));
    } catch (err) {
      setMsg(t(ERRORS[err.code] || 'Autentificarea a eșuat.'));
    }
  };

  return (
    <div className="login-wrap">
      <form className="card login" onSubmit={submit}>
        <h2>{t('Agenda Rezervări')}</h2>
        <div className="auth-tabs">
          {[['login', 'Intră în cont'], ['register', 'Creează cont']].map(([k, label]) => (
            <button key={k} type="button" className={mode === k ? 'on' : ''} onClick={() => { setMode(k); setMsg(''); }}>
              {t(label)}
            </button>
          ))}
        </div>
        <p className="hint">
          {t(mode === 'login'
            ? 'Intră în cont ca să vezi rezervările salvate în cloud.'
            : 'Creează un cont nou. Rezervările tale vor fi salvate în cloud și le vei vedea pe orice dispozitiv.')}
        </p>
        <div className="f">
          <label>Email</label>
          <input type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="f">
          <label>{t('Parolă')}</label>
          <input
            type="password" required minLength={mode === 'register' ? 6 : undefined}
            autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
            value={pass} onChange={(e) => setPass(e.target.value)}
          />
        </div>
        {mode === 'register' && (
          <div className="f">
            <label>{t('Confirmă parola')}</label>
            <input type="password" required autoComplete="new-password" value={pass2} onChange={(e) => setPass2(e.target.value)} />
          </div>
        )}
        {msg && <div className="warn show">{msg}</div>}
        <button className="btn primary" type="submit" disabled={busy}>{t(busy ? 'Se conectează…' : mode === 'register' ? 'Creează cont' : 'Intră în cont')}
        </button>
        {mode === 'login' && <button className="btn link" type="button" onClick={reset}>{t('Am uitat parola')}</button>}
        <div className="login-install"><InstallButton /></div>
      </form>
    </div>
  );
}

/** Cu Firebase configurat, cere autentificare înainte de aplicație. */
export default function AuthGate({ children }) {
  const { t } = useLang();
  const [user, setUser] = useState(undefined); // undefined = încă se verifică

  useEffect(() => (firebaseEnabled ? onAuthStateChanged(auth, setUser) : undefined), []);

  if (!firebaseEnabled) return children(null);
  if (user === undefined) return <div className="login-wrap"><div className="hint">{t('Se încarcă…')}</div></div>;
  if (!user) return <Login />;
  return children(user);
}
