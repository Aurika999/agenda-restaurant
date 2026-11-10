# Agenda Rezervări Restaurant (React)

Aplicație pentru programul rezervărilor la restaurant, cu contract generat automat pentru fiecare eveniment.

## Pornire

```bash
npm install
npm run dev
```

Deschide adresa afișată (de obicei http://localhost:5173).

Pentru o versiune finală: `npm run build`. Rezultatul apare în folderul `dist/` și poate fi pus pe orice hosting static (Netlify, Vercel, GitHub Pages).

## Funcții
- Calendar lunar cu rezervările pe zile + statistici (rezervări viitoare, invitați, sume de încasat)
- Formular rezervare: client, tip eveniment, dată/oră, sală, nr. persoane, meniu, prețuri, avans; total și rest calculate automat
- Avertizare când două evenimente se suprapun în aceeași zi și sală
- Listă cu căutare și filtre (status, viitoare/trecute)
- Contract numerotat automat: descărcare PDF, printare, copiere text
- Setări: datele firmei și condițiile contractului (termene confirmare/plată/anulare, clauze proprii)
- Backup / import date (.json)

## Salvare date

**Fără Firebase:** datele stau doar în browser (localStorage); fă periodic un backup din Setări.

**Cu Firebase (recomandat):** rezervările, setările și o copie a fiecărui contract se salvează în Firestore și apar pe orice dispozitiv după autentificare.

1. Creează un proiect pe https://console.firebase.google.com
2. **Build → Authentication → Get started → Email/Password → Enable**. Apoi, la **Users → Add user**, creează contul (email + parolă).
3. **Build → Firestore Database → Create database** (locație `eur3 (europe-west)`, mod *production*). La **Rules**, lipește conținutul din `firestore.rules` și apasă *Publish*.
4. **Project settings → General → Your apps → Web (</>)**: înregistrează aplicația și copiază valorile `firebaseConfig`.
5. Copiază `.env.example` ca `.env.local`, completează valorile și repornește `npm run dev`.

La prima autentificare, dacă cloud-ul e gol, datele existente din browser se urcă automat.

Structura în Firestore (separat pentru fiecare cont):
- `users/{uid}` – setări + numărul următorului contract
- `users/{uid}/reservations/{id}` – rezervări
- `users/{uid}/contracts/{id}` – copia contractului (HTML + text), salvată la fiecare deschidere dacă s-a schimbat

## Structură
- `src/App.jsx` – navigare și ferestre
- `src/useStore.js` – starea aplicației și salvarea
- `src/utils.js` – calcule, date, verificarea suprapunerilor
- `src/components/` – Calendar, Listă, Setări, Formular rezervare, Contract
