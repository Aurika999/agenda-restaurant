import { fmtDate, fmtDateLong, money, num, totals } from '../utils';

const DOTS = '……………………';

function Row({ label, children }) {
  return <tr><td>{label}</td><td>{children || '—'}</td></tr>;
}
const Multiline = ({ text }) => (text || '').split('\n').map((l, i) => <span key={i}>{i > 0 && <br />}{l}</span>);

/** Textul contractului pentru o rezervare. */
export default function Contract({ r, s }) {
  const t = totals(r);
  const cur = s.moneda;
  const m = (v) => money(v, cur);
  const firma = s.firma || DOTS;
  const zP = num(s.zilePlata), zC = num(s.zileConfirmare), zA = num(s.zileAnulare);
  const clauze = (s.clauze || '').split('\n').map((x) => x.trim()).filter(Boolean);

  let n = 0;
  const art = (title) => <h4>Art. {++n}. {title}</h4>;

  return (
    <>
      <h1>CONTRACT DE PRESTĂRI SERVICII</h1>
      <div style={{ textAlign: 'center', fontWeight: 'bold' }}>pentru organizarea unui eveniment</div>
      <div className="nr">Nr. <b>{r.nr}</b> din data <b>{fmtDate(r.creat)}</b></div>

      {art('Părțile contractante')}
      <p>
        <b>{firma}{s.restaurant && ` – ${s.restaurant}`}</b>, cu sediul în {s.adresa || DOTS}, CUI {s.cui || DOTS}
        {s.regcom && `, Nr. Reg. Com. ${s.regcom}`}{s.iban && `, cont ${s.iban}`}, telefon {s.telefon || DOTS},
        reprezentată prin {s.reprezentant || DOTS}, denumită în continuare <b>PRESTATOR</b>,
      </p>
      <p>și</p>
      <p>
        <b>{r.client}</b>{r.adresa && `, domiciliat(ă) în ${r.adresa}`}{r.act && `, identificat(ă) prin ${r.act}`},
        telefon {r.telefon}{r.email && `, email ${r.email}`}, denumit(ă) în continuare <b>BENEFICIAR</b>,
      </p>
      <p>au convenit încheierea prezentului contract, cu respectarea următoarelor clauze:</p>

      {art('Obiectul contractului')}
      <p>Prestatorul se obligă să organizeze și să asigure serviciile de restaurant pentru evenimentul descris mai jos:</p>
      <table><tbody>
        <Row label="Tip eveniment">{r.tip}</Row>
        <Row label="Data evenimentului">{fmtDateLong(r.data)}</Row>
        <Row label="Interval orar">{(r.oraStart || '—') + (r.oraSfarsit ? ` – ${r.oraSfarsit}` : '')}</Row>
        <Row label="Sala / zona">{r.sala}</Row>
        <Row label="Număr invitați">{num(r.persoane)} adulți{num(r.copii) ? ` și ${num(r.copii)} copii` : ''}</Row>
      </tbody></table>

      {art('Meniu și servicii')}
      <table><tbody>
        <Row label="Meniu">{r.meniu && <Multiline text={r.meniu} />}</Row>
        <Row label="Preț meniu / adult">{r.pretPers && m(r.pretPers)}</Row>
        {num(r.copii) > 0 && <Row label="Preț meniu / copil">{r.pretCopil && m(r.pretCopil)}</Row>}
        <Row label="Băuturi">{r.bauturi}</Row>
        <Row label="Servicii suplimentare">{r.extra}{num(r.extraCost) > 0 && ` (${m(r.extraCost)})`}</Row>
        {r.obs && <Row label="Cerințe speciale"><Multiline text={r.obs} /></Row>}
      </tbody></table>

      {art('Prețul și modalitatea de plată')}
      <table><tbody>
        <Row label="Valoare meniu">{m(t.meniu)}</Row>
        <Row label="Servicii suplimentare">{m(r.extraCost)}</Row>
        <Row label={<b>Valoare totală estimată</b>}><b>{m(t.total)}</b></Row>
        <Row label="Avans achitat la semnare">{m(r.avans)}</Row>
        <Row label={<b>Rest de plată</b>}><b>{m(t.rest)}</b></Row>
      </tbody></table>
      <p>
        Restul de plată se achită{' '}
        {zP ? <>cu cel puțin <b>{zP} zile</b> înainte de data evenimentului</> : <b>la finalul evenimentului</b>}.
        Valoarea finală se recalculează în funcție de numărul final de invitați confirmat.
      </p>

      {art('Obligațiile prestatorului')}
      <p>
        a) să pună la dispoziție sala/zona convenită, curată și amenajată, la data și ora stabilite;<br />
        b) să servească meniul ales, în cantitățile și calitatea convenite, cu respectarea normelor igienico-sanitare;<br />
        c) să asigure personalul de servire necesar desfășurării evenimentului.
      </p>

      {art('Obligațiile beneficiarului')}
      <p>
        a) să achite avansul și restul de plată la termenele stabilite;<br />
        b) să confirme numărul final de invitați cu cel puțin <b>{zC} zile</b> înainte de eveniment; în lipsa confirmării
        se va factura numărul de persoane din prezentul contract;<br />
        c) să răspundă pentru eventualele daune produse bunurilor prestatorului de către invitați.
      </p>

      {art('Anularea evenimentului')}
      <p>
        În cazul anulării evenimentului de către beneficiar cu mai mult de <b>{zA} zile</b> înainte de data acestuia,
        avansul se restituie integral. În cazul anulării cu mai puțin de {zA} zile înainte, avansul nu se restituie,
        cu titlu de daune-interese. Anularea se comunică în scris.
      </p>

      {clauze.length > 0 && (
        <>
          {art('Clauze suplimentare')}
          <p>{clauze.map((c, i) => <span key={i}>{i > 0 && <br />}{c}</span>)}</p>
        </>
      )}

      {art('Forța majoră')}
      <p>
        Niciuna dintre părți nu răspunde de neexecutarea obligațiilor dacă aceasta este cauzată de forța majoră,
        notificată celeilalte părți în cel mult 5 zile de la producere.
      </p>

      {art('Dispoziții finale')}
      <p>
        Orice modificare a prezentului contract se face prin act adițional semnat de ambele părți. Eventualele litigii
        se soluționează pe cale amiabilă, iar în caz contrar de instanțele competente. Prezentul contract s-a încheiat
        în 2 (două) exemplare, câte unul pentru fiecare parte.
      </p>

      <div className="sign">
        <div><b>PRESTATOR</b><br />{firma}<div className="line">Semnătura și ștampila</div></div>
        <div><b>BENEFICIAR</b><br />{r.client}<div className="line">Semnătura</div></div>
      </div>
    </>
  );
}
