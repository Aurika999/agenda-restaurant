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

Datele se salvează în browser (localStorage); fă periodic un backup din Setări.

## Structură
- `src/App.jsx` – navigare și ferestre
- `src/useStore.js` – starea aplicației și salvarea
- `src/utils.js` – calcule, date, verificarea suprapunerilor
- `src/components/` – Calendar, Listă, Setări, Formular rezervare, Contract
