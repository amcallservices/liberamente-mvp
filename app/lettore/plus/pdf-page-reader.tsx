'use client';

import { useMemo, useState } from 'react';

type PdfPageReaderProps = { bookId: string; title: string; pdfUrl: string; totalPages: number; confirmedPages: number[] };

export function PdfPageReader({ bookId, title, pdfUrl, totalPages, confirmedPages }: PdfPageReaderProps) {
  const [confirmed, setConfirmed] = useState(() => new Set(confirmedPages));
  const [page, setPage] = useState(() => {
    for (let current = 1; current <= totalPages; current += 1) if (!confirmedPages.includes(current)) return current;
    return totalPages;
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const completed = confirmed.size;
  const progress = Math.round((completed / totalPages) * 100);
  const pageUrl = useMemo(() => `${pdfUrl}#page=${page}&view=FitH`, [page, pdfUrl]);
  const isComplete = completed >= totalPages;

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
      else setMessage('Lettura completata: tutte le pagine sono state confermate per questo mese.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Riprova tra poco.');
    } finally { setSaving(false); }
  }

  return <section className="plus-pdf-reader" aria-label={`Lettura di ${title}`}>
    <div className="plus-pdf-reader__topline"><div><p className="eyebrow">Lettura verificata Plus</p><h3>Leggi il PDF e conferma ogni pagina</h3></div><p className="plus-pdf-reader__progress">{completed} di {totalPages} pagine confermate</p></div>
    <div className="plus-pdf-reader__bar" aria-hidden="true"><span style={{ width: `${progress}%` }} /></div>
    <div className="plus-pdf-reader__controls">
      <button className="button alt" type="button" disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>Pagina precedente</button>
      <span className="plus-pdf-reader__step">Conferma la pagina corrente per proseguire</span>
      <button className="button alt" type="button" disabled={page >= totalPages || !confirmed.has(page)} onClick={() => setPage((value) => Math.min(totalPages, value + 1))}>Pagina successiva</button>
      <span className="plus-pdf-reader__page">Pagina {page} di {totalPages}</span>
    </div>
    <iframe className="plus-pdf-reader__frame" src={pageUrl} title={`PDF: ${title}, pagina ${page}`} />
    <div className="plus-pdf-reader__confirmation"><div><strong>{confirmed.has(page) ? 'Pagina già confermata' : 'Hai terminato questa pagina?'}</strong><p>La conferma viene conteggiata una sola volta nel mese e contribuisce al report dell’autore.</p></div><button className="button" type="button" onClick={confirmPage} disabled={saving || confirmed.has(page) || isComplete}>{saving ? 'Conferma in corso…' : isComplete ? 'Lettura completata' : `Conferma pagina ${page}`}</button></div>
    {message && <p className="notice plus-pdf-reader__notice" role="status">{message}</p>}
  </section>;
}
