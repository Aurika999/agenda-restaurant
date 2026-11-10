import { useEffect, useRef, useState } from 'react';
import Contract from './Contract.jsx';
import { downloadBlob, fileBase } from '../utils';
import { useLang } from '../i18n.jsx';

const PRINT_CSS = `.paper{max-width:740px;margin:0 auto;padding:30px;font-family:Georgia,"Times New Roman",serif;font-size:13.5px;line-height:1.6;color:#111}
.paper h1{text-align:center;font-size:18px;margin:0}.paper .nr{text-align:center;margin:4px 0 20px}
.paper h4{font-size:13.5px;margin:16px 0 4px;text-transform:uppercase}.paper p{margin:4px 0}
.paper table{width:100%;border-collapse:collapse;margin:6px 0}.paper td{border:1px solid #bbb;padding:4px 8px;vertical-align:top}
.paper td:first-child{width:42%}.sign{display:flex;justify-content:space-between;margin-top:40px;gap:30px}
.sign div{flex:1;text-align:center}.sign .line{border-top:1px solid #333;margin-top:46px;padding-top:4px;font-size:12px}
@media print{.paper{padding:0}}`;

export default function ContractModal({ reservation: r, settings, toast, onSaveContract, onClose }) {
  const paperRef = useRef();
  const [busy, setBusy] = useState(false);
  const { t } = useLang();
  const [cloud, setCloud] = useState(onSaveContract ? 'saving' : null); // saving | saved | error
  const saveRef = useRef(onSaveContract);
  saveRef.current = onSaveContract;

  // Salvează automat în Firebase copia contractului, așa cum arată acum.
  useEffect(() => {
    if (!saveRef.current) return;
    let alive = true;
    setCloud('saving');
    saveRef.current(r, paperRef.current.innerHTML, paperRef.current.innerText)
      .then(() => alive && setCloud('saved'))
      .catch((e) => { console.error(e); if (alive) setCloud('error'); });
    return () => { alive = false; };
  }, [r, settings]);
  const base = fileBase(r);

  const downloadPdf = async () => {
    setBusy(true);
    try {
      const { default: html2pdf } = await import('html2pdf.js');
      const holder = document.createElement('div');
      holder.className = 'paper';
      Object.assign(holder.style, { boxShadow: 'none', padding: '0', width: '680px' });
      holder.innerHTML = paperRef.current.innerHTML;
      await html2pdf()
        .set({
          margin: [14, 14, 14, 14],
          filename: base + '.pdf',
          html2canvas: { scale: 2 },
          jsPDF: { unit: 'mm', format: 'a4' },
          pagebreak: { mode: ['css', 'legacy'], avoid: ['tr', '.sign', 'p'] },
        })
        .from(holder)
        .save();
      toast(t('PDF descărcat'));
    } catch {
      toast(t('Eroare la generarea PDF'));
    } finally {
      setBusy(false);
    }
  };

  const printContract = () => {
    const html = `<!DOCTYPE html><html lang="ro"><head><meta charset="utf-8"><title>${base}</title><style>${PRINT_CSS}</style></head>`
      + `<body><div class="paper">${paperRef.current.innerHTML}</div></body></html>`;
    const w = window.open('', '_blank');
    if (!w) { downloadBlob(new Blob([html], { type: 'text/html' }), base + '.html'); return; }
    w.document.write(html);
    w.document.close();
    w.onload = () => w.print();
    setTimeout(() => w.print(), 400);
  };

  const copyText = async () => {
    try { await navigator.clipboard.writeText(paperRef.current.innerText); toast(t('Text copiat')); }
    catch { toast(t('Copierea nu este permisă aici')); }
  };

  return (
    <div className="overlay show" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 900 }}>
        <h2>{t('Contract eveniment')}</h2>
        <div className="contract-wrap">
          <div className="paper" ref={paperRef}><Contract r={r} s={settings} /></div>
        </div>
        <div className="foot">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn primary" onClick={downloadPdf} disabled={busy}>{t(busy ? 'Se generează…' : 'Descarcă PDF')}</button>
            <button className="btn" onClick={printContract}>{t('Printează')}</button>
            <button className="btn" onClick={copyText}>{t('Copiază textul')}</button>
            {cloud && (
              <span className={'cloud-status ' + cloud}>
                {t({ saving: 'Se salvează în cloud…', saved: '☁ Contract salvat în cloud', error: '⚠ Contractul nu s-a salvat în cloud' }[cloud])}
              </span>
            )}
          </div>
          <button className="btn" onClick={onClose}>{t('Închide')}</button>
        </div>
      </div>
    </div>
  );
}
