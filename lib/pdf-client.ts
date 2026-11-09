'use client';

// Caricamento di pdf.js solo nel browser e solo quando serve: il resto del sito
// non scarica nulla di questa libreria.
type PdfJs=typeof import('pdfjs-dist/legacy/build/pdf.mjs');

let pdfjsPromise:Promise<PdfJs>|null=null;

export function loadPdfjs():Promise<PdfJs>{
  if(!pdfjsPromise){
    pdfjsPromise=import('pdfjs-dist/legacy/build/pdf.mjs').then(library=>{
      library.GlobalWorkerOptions.workerSrc=new URL('pdfjs-dist/legacy/build/pdf.worker.min.mjs',import.meta.url).toString();
      return library;
    }).catch(error=>{pdfjsPromise=null;throw error;});
  }
  return pdfjsPromise;
}

/** Scarica il PDF e lo apre. Il file viene letto per intero subito, così i link temporanei che scadono non creano problemi. */
export async function openPdfDocument(url:string){
  const pdfjs=await loadPdfjs();
  const response=await fetch(url,{cache:'no-store'});
  if(!response.ok)throw new Error(`Download del PDF non riuscito (${response.status})`);
  const data=new Uint8Array(await response.arrayBuffer());
  return pdfjs.getDocument({data}).promise;
}
