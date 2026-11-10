import { createContext, useContext, useEffect, useState } from 'react';

/**
 * Traduceri RO → UK. Cheia este chiar textul românesc; dacă lipsește o traducere,
 * se afișează textul românesc. Contractul rămâne mereu în română.
 */
const UK = {
  // Navigare / antet
  'Calendar': 'Календар',
  'Toate rezervările': 'Усі бронювання',
  'Setări': 'Налаштування',
  'Agenda Rezervări': 'Журнал бронювань',
  'Programul rezervărilor și contractele pentru evenimente': 'Розклад бронювань і договори на заходи',
  'Rezervare actualizată': 'Бронювання оновлено',
  'Rezervare adăugată': 'Бронювання додано',
  'Rezervare ștearsă': 'Бронювання видалено',

  // Calendar
  'Rezervări viitoare': 'Майбутні бронювання',
  'Evenimente în {m}': 'Заходи — {m}',
  'Invitați în {m}': 'Гості — {m}',
  'De încasat (viitoare)': 'До отримання (майбутні)',
  'Azi': 'Сьогодні',
  '+{n} încă': 'ще +{n}',
  '+ Adaugă': '+ Додати',
  'Nicio rezervare în această zi.': 'Немає бронювань на цей день.',

  // Status
  'Confirmat': 'Підтверджено',
  'În așteptare': 'Очікує',
  'Anulat': 'Скасовано',

  // Tipuri de eveniment
  'Nuntă': 'Весілля',
  'Botez': 'Хрестини',
  'Cununie civilă': 'Цивільний шлюб',
  'Aniversare': 'Ювілей / день народження',
  'Majorat': 'Повноліття',
  'Petrecere corporate': 'Корпоратив',
  'Parastas': 'Поминальний обід',
  'Cină / masă rezervată': 'Вечеря / заброньований стіл',
  'Alt eveniment': 'Інший захід',

  // Card rezervare
  '{n} adulți': '{n} дорослих',
  ' + {n} copii': ' + {n} дітей',
  'Total {x} · avans {y} · ': 'Разом {x} · аванс {y} · ',
  'rest {x}': 'залишок {x}',
  'Editează': 'Редагувати',
  '📄 Contract': '📄 Договір',

  // Listă
  'Caută după client, telefon, tip eveniment…': 'Пошук за клієнтом, телефоном, типом заходу…',
  'Toate statusurile': 'Усі статуси',
  'Viitoare': 'Майбутні',
  'Trecute': 'Минулі',
  'Toate': 'Усі',
  'Data': 'Дата',
  'Client': 'Клієнт',
  'Eveniment': 'Захід',
  'Sala': 'Зала',
  'Pers.': 'Осіб',
  'Total': 'Разом',
  'Rest': 'Залишок',
  'Status': 'Статус',
  'Nicio rezervare găsită.': 'Бронювань не знайдено.',

  // Formular rezervare
  'Editează rezervarea': 'Редагувати бронювання',
  ' · Contract nr. {n}': ' · Договір № {n}',
  'Rezervare nouă': 'Нове бронювання',
  'Nume și prenume *': 'Прізвище та імʼя *',
  'Telefon *': 'Телефон *',
  'Telefon': 'Телефон',
  'Email': 'Email',
  'Adresă (pentru contract)': 'Адреса (для договору)',
  'CI seria / nr. sau CNP / CUI (opțional)': 'Паспорт (серія / №) або ІПН / код компанії (необовʼязково)',
  'Tip eveniment': 'Тип заходу',
  'Data *': 'Дата *',
  'Ora început': 'Початок',
  'Ora sfârșit': 'Завершення',
  'Nr. persoane adulți *': 'Кількість дорослих *',
  'Nr. copii': 'Кількість дітей',
  'Sala / zona': 'Зала / зона',
  '⚠ Atenție: în aceeași zi există deja:': '⚠ Увага: цього ж дня вже є:',
  '⚠ Atenție: în aceeași zi și sală există deja:': '⚠ Увага: цього ж дня в цій залі вже є:',
  'Meniu și servicii': 'Меню та послуги',
  'Meniu ales (preparate)': 'Обране меню (страви)',
  'Aperitiv rece, Sarmale, Friptură de porc cu cartofi, Tort…': 'Холодні закуски, голубці, печеня зі свинини з картоплею, торт…',
  'Preț meniu / adult': 'Ціна меню / дорослий',
  'Preț meniu / copil': 'Ціна меню / дитина',
  'Băuturi': 'Напої',
  'Incluse în meniu / aduse de client / separat': 'Включені в меню / від клієнта / окремо',
  'Servicii suplimentare (descriere)': 'Додаткові послуги (опис)',
  'Decor, formație, DJ, candy bar…': 'Декор, гурт, DJ, кенді-бар…',
  'Cost servicii suplimentare': 'Вартість додаткових послуг',
  'Avans achitat': 'Сплачений аванс',
  'Observații / cerințe speciale': 'Примітки / особливі побажання',
  'Alergii, meniu vegetarian, aranjarea meselor…': 'Алергії, вегетаріанське меню, розстановка столів…',
  'Meniu:': 'Меню:',
  'Suplimentar:': 'Додатково:',
  'Total:': 'Разом:',
  'Rest de plată:': 'Залишок до сплати:',
  'Șterge': 'Видалити',
  'Renunță': 'Скасувати',
  'Salvează': 'Зберегти',
  'Ștergi rezervarea?': 'Видалити бронювання?',
  'Acțiunea nu poate fi anulată. (Poți și să schimbi statusul în „Anulat”.)':
    'Цю дію не можна скасувати. (Можна також змінити статус на «Скасовано».)',
  'Nu': 'Ні',
  'Da, șterge': 'Так, видалити',

  // Setări
  'Denumire firmă': 'Назва компанії',
  'Nume restaurant': 'Назва ресторану',
  'CUI': 'Код компанії (CUI)',
  'Nr. Reg. Com.': 'Реєстр. № (Reg. Com.)',
  'Adresă': 'Адреса',
  'Reprezentant legal (nume, funcție)': 'Законний представник (імʼя, посада)',
  'IBAN / Banca': 'IBAN / Банк',
  'Săli / zone disponibile (separate prin virgulă)': 'Доступні зали / зони (через кому)',
  'Confirmare nr. final invitați (zile înainte)': 'Підтвердження кількості гостей (днів до заходу)',
  'Plata restului (zile înainte; 0 = la final)': 'Оплата залишку (днів до; 0 = після заходу)',
  'Anulare fără penalități (zile înainte)': 'Скасування без штрафів (днів до заходу)',
  'Monedă': 'Валюта',
  'Setări salvate': 'Налаштування збережено',
  'Date importate': 'Дані імпортовано',
  'Fișierul nu este un backup valid': 'Файл не є дійсною резервною копією',
  'Datele restaurantului': 'Дані ресторану',
  'Aceste date apar automat în fiecare contract.': 'Ці дані автоматично вносяться в кожен договір.',
  'Prestator': 'Виконавець',
  'Condiții contract': 'Умови договору',
  'Clauze suplimentare (opțional, câte una pe rând)': 'Додаткові пункти договору (необовʼязково, по одному в рядку; договір складається румунською)',
  'Salvează setările': 'Зберегти налаштування',
  'Backup date': 'Резервна копія даних',
  'Datele sunt salvate în acest browser. Fă din când în când un backup sau mută-le pe alt calculator.':
    'Дані зберігаються в цьому браузері. Час від часу робіть резервну копію або переносьте її на інший компʼютер.',
  'Exportă backup (.json)': 'Експортувати копію (.json)',
  'Importă backup': 'Імпортувати копію',

  // Contract (fereastra)
  'Contract eveniment': 'Договір на захід (румунською)',
  'PDF descărcat': 'PDF завантажено',
  'Eroare la generarea PDF': 'Помилка створення PDF',
  'Text copiat': 'Текст скопійовано',
  'Copierea nu este permisă aici': 'Копіювання тут недоступне',
  'Se generează…': 'Створення…',
  'Descarcă PDF': 'Завантажити PDF',
  'Printează': 'Друкувати',
  'Copiază textul': 'Копіювати текст',
  'Închide': 'Закрити',
  'Se salvează în cloud…': 'Збереження в хмарі…',
  '☁ Contract salvat în cloud': '☁ Договір збережено в хмарі',
  '⚠ Contractul nu s-a salvat în cloud': '⚠ Договір не збережено в хмарі',

  // Firebase / cont
  'Intră în cont ca să vezi rezervările salvate în cloud.': 'Увійдіть, щоб побачити бронювання, збережені в хмарі.',
  'Parolă': 'Пароль',
  'Intră în cont': 'Увійти',
  'Se conectează…': 'Вхід…',
  'Am uitat parola': 'Забули пароль?',
  'Email sau parolă greșită.': 'Неправильний email або пароль.',
  'Adresa de email nu este validă.': 'Неправильна адреса email.',
  'Prea multe încercări. Încearcă din nou peste câteva minute.': 'Забагато спроб. Спробуйте за кілька хвилин.',
  'Nu există conexiune la internet.': 'Немає підключення до інтернету.',
  'Autentificarea a eșuat.': 'Не вдалося увійти.',
  'Scrie mai întâi adresa de email.': 'Спочатку введіть адресу email.',
  'Ți-am trimis pe email un link pentru resetarea parolei.': 'Ми надіслали на email посилання для скидання пароля.',
  'Se încarcă…': 'Завантаження…',
  'Se încarcă datele din cloud…': 'Завантаження даних із хмари…',
  'Eroare la salvare. Verifică internetul și încearcă din nou.': 'Помилка збереження. Перевірте інтернет і спробуйте ще раз.',
  'Eroare la ștergere. Verifică internetul și încearcă din nou.': 'Помилка видалення. Перевірте інтернет і спробуйте ще раз.',
  'Eroare Firebase: {e}': 'Помилка Firebase: {e}',
  'Datele sunt salvate în Firebase și apar pe orice dispozitiv pe care intri în cont. Backup-ul (.json) e o copie în plus.':
    'Дані зберігаються у Firebase і доступні на будь-якому пристрої після входу. Резервна копія (.json) — додатковий захист.',
  'Cont': 'Обліковий запис',
  'Conectat ca {e}': 'Ви увійшли як {e}',
  'Ieși din cont': 'Вийти',
  'Instalează': 'Встановити',
  'Instalează aplicația': 'Встановити застосунок',
  'Instalează aplicația pe acest dispozitiv': 'Встановити застосунок на цей пристрій',
  'Aplicația a fost instalată': 'Застосунок встановлено',
  'Apasă butonul Partajare (pătratul cu săgeată în sus) din Safari.': 'Натисніть кнопку «Поділитися» (квадрат зі стрілкою вгору) у Safari.',
  'Alege „Adaugă pe ecranul principal”.': 'Виберіть «На початковий екран».',
  'Apasă „Adaugă”.': 'Натисніть «Додати».',
  'Creează cont': 'Створити обліковий запис',
  'Creează un cont nou. Rezervările tale vor fi salvate în cloud și le vei vedea pe orice dispozitiv.':
    'Створіть новий обліковий запис. Ваші бронювання зберігатимуться в хмарі й будуть доступні на будь-якому пристрої.',
  'Confirmă parola': 'Підтвердіть пароль',
  'Parolele nu coincid.': 'Паролі не збігаються.',
  'Parola trebuie să aibă cel puțin 6 caractere.': 'Пароль має містити щонайменше 6 символів.',
  'Există deja un cont cu acest email. Intră în cont.': 'Обліковий запис із цим email уже існує. Увійдіть.',
  'Crearea de conturi nu este activată în Firebase.': 'Створення облікових записів не ввімкнено у Firebase.',
};

const DATES = {
  ro: {
    months: ['ianuarie', 'februarie', 'martie', 'aprilie', 'mai', 'iunie', 'iulie', 'august', 'septembrie', 'octombrie', 'noiembrie', 'decembrie'],
    dow: ['Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm', 'Dum'],
  },
  uk: {
    months: ['січень', 'лютий', 'березень', 'квітень', 'травень', 'червень', 'липень', 'серпень', 'вересень', 'жовтень', 'листопад', 'грудень'],
    dow: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'],
  },
};

const KEY = 'agenda-restaurant-lang';
const LangContext = createContext(null);

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => (localStorage.getItem(KEY) === 'uk' ? 'uk' : 'ro'));

  useEffect(() => {
    try { localStorage.setItem(KEY, lang); } catch { /* ignore */ }
    document.documentElement.lang = lang;
  }, [lang]);

  const t = (s, vars) => {
    let out = lang === 'uk' ? (UK[s] ?? s) : s;
    if (vars) Object.entries(vars).forEach(([k, v]) => { out = out.replaceAll(`{${k}}`, v); });
    return out;
  };

  const value = { lang, setLang, t, months: DATES[lang].months, dow: DATES[lang].dow };
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export const useLang = () => useContext(LangContext);
