'use client';

import {useMemo,useState} from 'react';
import {readerBlocksFromText} from '@/lib/reader-format';
import {PdfPagesViewer} from './pdf-pages-viewer';

type Props={title:string;text:string;mode:'preview'|'full';purchaseId?:string;fileMimeType?:string|null;previewPdfUrl?:string|null};

export function ReadingExperience({title,text,mode,purchaseId,fileMimeType,previewPdfUrl}:Props){
  const blocks=useMemo(()=>readerBlocksFromText(text),[text]);
  const [documentUrl,setDocumentUrl]=useState(''),[documentLoading,setDocumentLoading]=useState(false),[documentError,setDocumentError]=useState(''),[pdfPage,setPdfPage]=useState('1'),[viewerFailed,setViewerFailed]=useState(false);
  const modeLabel=mode==='preview'?'Apri e leggi l’estratto':'Apri il lettore';
  const hasOriginalPdf=mode==='full'&&fileMimeType==='application/pdf'&&Boolean(purchaseId);
  // Con le pagine originali (estratto o libro acquistato) si mostra solo quella versione, senza il testo estratto duplicato.
  // Se il PDF non si apre, resta il testo come ripiego.
  const showPdfOnly=((mode==='preview'&&Boolean(previewPdfUrl))||hasOriginalPdf)&&!documentError&&!viewerFailed;

  const openOriginal=async()=>{
    if(!purchaseId||documentUrl||documentLoading)return;
    setDocumentLoading(true);setDocumentError('');
    try{const response=await fetch(`/api/reader-file?purchaseId=${encodeURIComponent(purchaseId)}`),body=await response.json() as {url?:string;error?:string};if(!response.ok||!body.url)throw new Error(body.error||'Documento non disponibile.');setDocumentUrl(body.url)}
    catch(error){setDocumentError(error instanceof Error?error.message:'Documento non disponibile.')}
    finally{setDocumentLoading(false)}
  };
  if(!blocks.length)return null;

  // Dopo l’acquisto il libro impaginato si apre da solo quando si apre il lettore.
  return <details className={`reading-experience reading-${mode}`} onToggle={event=>{if(event.currentTarget.open&&hasOriginalPdf)void openOriginal()}}>
    <summary><span>{modeLabel}</span><small>{mode==='preview'?'Anteprima autorizzata dall’autore':'Riservato al tuo acquisto'}</small></summary>
    {mode==='preview'&&previewPdfUrl&&<section className="original-document preview-document"><div><strong>Le pagine originali dell’estratto</strong><p>Le pagine 20–30 del libro, con immagini e impaginazione come nell’edizione originale.</p></div><a className="button alt" href={previewPdfUrl} target="_blank" rel="noopener noreferrer">Apri a schermo intero</a><div className="pdf-reader"><PdfPagesViewer url={previewPdfUrl} title={title} firstPageLabel={20} fallbackHref={previewPdfUrl} onError={()=>setViewerFailed(true)}/></div></section>}
    {hasOriginalPdf&&<section className="original-document"><div><strong>Edizione impaginata</strong><p>Leggi il PDF originale con immagini, pagine e formattazione identiche al libro acquistato.</p></div>{!documentUrl?<button type="button" onClick={openOriginal} disabled={documentLoading}>{documentLoading?'Apertura in corso…':'Apri il libro impaginato'}</button>:<div className="pdf-reader"><label>Vai alla pagina<input type="number" min="1" inputMode="numeric" value={pdfPage} onChange={event=>setPdfPage(event.target.value.replace(/\D/g,'')||'1')}/></label><PdfPagesViewer url={documentUrl} title={title} goToPage={Number(pdfPage)||1} fallbackHref={documentUrl} onError={()=>setViewerFailed(true)}/></div>}{documentError&&<p className="notice">{documentError}</p>}</section>}
    {!showPdfOnly&&<p className="reading-help">Il testo è disponibile qui sotto; per i PDF l’edizione impaginata conserva pagine e immagini dell’originale.</p>}
    {!showPdfOnly&&<article className="reading-text" aria-label={`Testo di ${title}`}>{blocks.map((block,index)=>block.kind==='heading'?<h3 id={`reader-block-${mode}-${index}`} key={`${index}-${block.text}`}>{block.text}</h3>:<p id={`reader-block-${mode}-${index}`} key={`${index}-${block.text.slice(0,24)}`}>{block.text}</p>)}</article>}
  </details>;
}
