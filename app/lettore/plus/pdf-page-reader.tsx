'use client';

import { useEffect, useState } from 'react';
import { PdfPagesViewer } from '../pdf-pages-viewer';

type PdfPageReaderProps = { bookId: string; title: string; totalPages: number; confirmedPages: number[] };
type PagePayload = { text?: string; error?: string };

export function PdfPageReader({ bookId, title, totalPages, confirmedPages }: PdfPageReaderProps) {
  const [confirmed, setConfirmed] = useState(() => new Set(confirmedPages));
  const [page, setPage] = useState(() => {
    for (let current = 1; current <= totalPages; current += 1) if (!confirmedPages.includes(current)) return current;
    return totalPages;
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [pageText, setPageText] = useState('');
  const [loadingPage, setLoadingPage] = useState(true);
  const [pagePdfUrl, setPagePdfUrl] = useState('');
  const [pdfLoading, setPdfLoading] = useState(true);
  const [viewerFailed, setViewerFailed] = useState(false);
  const completed = confirmed.size;
  const progress = Math.round((completed / totalPages) * 100);
  const isComplete = completed >= totalPages;

  useEffect(() => {
    let active = true;
    setLoadingPage(true);
    setPageText('');
    fetch(`/api/plus/reading-page?bookId=${encodeURIComponent(bookId)}&page=${page}`, { cache: 'no-store' })
      .then(async (response) => {
        const payload = (await response.json().catch(() => null)) as PagePayload | null;
        if (!response.ok) throw new Error(payload?.error || 'Impossibile caricare la pagina.');
        if (active) setPageText(payload?.text || 'Questa pagina non contiene testo leggibile.');
      })
      .catch((error) => { if (active) setMessage(error instanceof Error ? error.message : 'Riprova tra poco.'); })
      .finally(() => { if (active) setLoadingPage(false); });
    return () => { active = false; };
  }, [bookId, page]);

  useEffect(() => {
    let active = true;
    let objectUrl = '';
    setPagePdfUrl('');
    setViewerFailed(false);
    setPdfLoading(true);
    fetch(`/api/plus/reading-page?bookId=${encodeURIComponent(bookId)}&page=${page}&format=pdf`, { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) return;
        const blob = await response.blob();
        if (!active) return;
        objectUrl = URL.createObjectURL(blob);
        setPagePdfUrl(objectUrl);
      })
      .catch(() => { /* resta disponibile il testo della pagina */ })
      .finally(() => { if (active) setPdfLoading(false); });
    return () => { active = false; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [bookId, page]);

  async function confirmPage() {
    if (saving || confirmed.has(page)) return;
    setSaving(true); setMessage('');
    try {
      const response = await fetch('/api/plus/page-read', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ bookId, pageNumber: page }) });
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) throw new Error(payload?.error || 'Impossibile confermare la pagina');
      const updated = new Set(confirmed); updated.add(page); setConfirmed(updated);
      const nextPage = Array.from({ length: totalPages }, (_, index) => index + 1).find((current) => !updated.has(current));
      if (nextPage) { setPage(nextPage); setMessage(`Pagina ${page} confermata. Puoi proseguire con la pagina ${nextPage}.`); }
      else setMessage('Lettura completata: tutte le pagine sono state confermate in modo permanente.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Riprova tra poco.');
    } finally { setSaving(false); }
  }

  const textBlock = <div className="plus-pdf-reader__page-text">{pageText.split(/\n{2,}/).filter(Boolean).map((paragraph, index) => <p key={`${page}-${index}`}>{paragraph}</p>)}</div>;

  return <section className="plus-pdf-reader" aria-label={`Lettura di ${title}`}>
    <div className="plus-pdf-reader__topline"><div><p className="eyebrow">Lettura verificata Plus</p><h3>Leggi il PDF e conferma ogni pagina</h3></div><p className="plus-pdf-reader__progress">{completed} di {totalPages} pagine confermate</p></div>
    <div className="plus-pdf-reader__bar" aria-hidden="true"><span style={{ width: `${progress}%` }} /></div>
    <div className="plus-pdf-reader__controls">
      <button className="button alt" type="button" disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>Pagina precedente</button>
      <span className="plus-pdf-reader__step">Riprendi dalla prima pagina non confermata</span>
      <button className="button alt" type="button" disabled={page >= totalPages || !confirmed.has(page)} onClick={() => setPage((value) => Math.min(totalPages, value + 1))}>Pagina successiva</button>
      <span className="plus-pdf-reader__page">Pagina {page} di {totalPages}</span>
    </div>
    <div className="plus-pdf-reader__surface" aria-live="polite">
      {pagePdfUrl && !viewerFailed && <div className="plus-pdf-reader__page-frame"><PdfPagesViewer url={pagePdfUrl} title={`Pagina ${page} di ${title}`} firstPageLabel={page} onError={() => setViewerFailed(true)} /></div>}
      {loadingPage || pdfLoading ? <p className="muted">Caricamento della pagina protetta…</p> : pagePdfUrl && !viewerFailed ? null : textBlock}
    </div>
    <p className="plus-pdf-reader__access-note">La lettura Plus è disponibile solo qui, in sequenza: non sono disponibili download, stampa o salto alle pagine successive.</p>
    <div className="plus-pdf-reader__confirmation"><div><strong>{confirmed.has(page) ? 'Pagina già confermata' : 'Hai terminato questa pagina?'}</strong><p>La conferma avviene una sola volta per questo titolo e contribuisce al report dell’autore nel mese in cui viene effettuata.</p></div><button className="button" type="button" onClick={confirmPage} disabled={saving || confirmed.has(page) || isComplete}>{saving ? 'Conferma in corso…' : isComplete ? 'Lettura completata' : `Conferma pagina ${page}`}</button></div>
    {message && <p className="notice plus-pdf-reader__notice" role="status">{message}</p>}
  </section>;
}
