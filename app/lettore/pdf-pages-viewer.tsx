'use client';

import {useEffect,useRef,useState} from 'react';
import {openPdfDocument} from '@/lib/pdf-client';

type PdfDocument={numPages:number;getPage:(pageNumber:number)=>Promise<any>;destroy:()=>Promise<void>|void};
type Props={
  /** Indirizzo del PDF (anche temporaneo o `blob:`). */
  url:string;
  title:string;
  /** Pagina del PDF (da 1) verso cui scorrere. */
  goToPage?:number;
  /** Numero da mostrare sulla prima pagina (per l'estratto: 20). */
  firstPageLabel?:number;
  /** Indirizzo da aprire se le pagine non si possono mostrare. */
  fallbackHref?:string;
  /** Chiamata se le pagine non si possono mostrare (il chiamante può ripiegare sul testo). */
  onError?:()=>void;
};

const ZOOM_STEPS=[1,1.25,1.5,2,2.5];

/**
 * Mostra le pagine di un PDF come immagini adattate alla larghezza dello schermo.
 * Funziona anche sui telefoni che non sanno aprire un PDF dentro la pagina e
 * mantiene la proporzione tra testo e schermo (con zoom + e − facoltativo).
 */
export function PdfPagesViewer({url,title,goToPage,firstPageLabel=1,fallbackHref,onError}:Props){
  const [pageCount,setPageCount]=useState(0);
  const [status,setStatus]=useState<'loading'|'ready'|'error'>('loading');
  const [zoomIndex,setZoomIndex]=useState(0);
  const documentRef=useRef<PdfDocument|null>(null);
  const [document_,setDocument]=useState<PdfDocument|null>(null);
  const scrollRef=useRef<HTMLDivElement>(null);

  useEffect(()=>{
    let cancelled=false;
    let opened:PdfDocument|null=null;
    setStatus('loading');setPageCount(0);setDocument(null);
    openPdfDocument(url).then(loaded=>{
      opened=loaded as unknown as PdfDocument;
      if(cancelled){void opened.destroy();return;}
      documentRef.current=opened;setDocument(opened);setPageCount(opened.numPages);setStatus('ready');
    }).catch(error=>{console.error('Visualizzazione PDF non riuscita',error);if(!cancelled){setStatus('error');onError?.();}});
    return()=>{cancelled=true;documentRef.current=null;if(opened)void opened.destroy();};
  },[url]);

  useEffect(()=>{
    if(status!=='ready'||!goToPage||goToPage<1)return;
    const target=Math.min(goToPage,pageCount);
    scrollRef.current?.querySelector(`[data-pdf-page="${target}"]`)?.scrollIntoView({block:'start',behavior:'smooth'});
  },[goToPage,status,pageCount]);

  if(status==='error')return <p className="notice">Non riesco a mostrare le pagine su questo dispositivo.{fallbackHref&&<> <a href={fallbackHref} target="_blank" rel="noopener noreferrer">Aprilo in una nuova scheda</a>.</>}</p>;

  const zoom=ZOOM_STEPS[zoomIndex];
  return <div className="pdf-pages" aria-label={`Pagine di ${title}`}>
    <div className="pdf-pages__bar">
      <span className="pdf-pages__count" aria-live="polite">{status==='loading'?'Caricamento delle pagine…':`${pageCount} ${pageCount===1?'pagina':'pagine'}`}</span>
      <div className="pdf-pages__zoom" role="group" aria-label="Zoom">
        <button type="button" className="button alt" onClick={()=>setZoomIndex(index=>Math.max(0,index-1))} disabled={zoomIndex===0} aria-label="Riduci lo zoom">−</button>
        <span>{Math.round(zoom*100)}%</span>
        <button type="button" className="button alt" onClick={()=>setZoomIndex(index=>Math.min(ZOOM_STEPS.length-1,index+1))} disabled={zoomIndex===ZOOM_STEPS.length-1} aria-label="Aumenta lo zoom">+</button>
      </div>
    </div>
    <div className="pdf-pages__scroll" ref={scrollRef}>
      <div className="pdf-pages__inner" style={{width:`${zoom*100}%`}}>
        {document_&&Array.from({length:pageCount},(_,index)=><PdfPageCanvas key={index+1} document_={document_} pageNumber={index+1} label={`Pagina ${firstPageLabel+index}`}/>)}
      </div>
    </div>
  </div>;
}

/** Una pagina: si disegna solo quando è vicina allo schermo e si libera quando è lontana. */
function PdfPageCanvas({document_,pageNumber,label}:{document_:PdfDocument;pageNumber:number;label:string}){
  const wrapperRef=useRef<HTMLDivElement>(null);
  const canvasRef=useRef<HTMLCanvasElement>(null);
  const [near,setNear]=useState(pageNumber<=2);
  const [width,setWidth]=useState(0);
  const [aspect,setAspect]=useState<number|null>(null);

  useEffect(()=>{
    const wrapper=wrapperRef.current;
    if(!wrapper)return;
    const visibility=new IntersectionObserver(entries=>{entries.forEach(entry=>setNear(entry.isIntersecting));},{rootMargin:'900px 0px'});
    visibility.observe(wrapper);
    let timer:ReturnType<typeof setTimeout>|undefined;
    const sizing=new ResizeObserver(entries=>{
      const next=Math.round(entries[0].contentRect.width);
      clearTimeout(timer);
      timer=setTimeout(()=>setWidth(previous=>Math.abs(previous-next)>2?next:previous),120);
    });
    sizing.observe(wrapper);
    setWidth(Math.round(wrapper.clientWidth));
    return()=>{visibility.disconnect();sizing.disconnect();clearTimeout(timer);};
  },[]);

  useEffect(()=>{
    const canvas=canvasRef.current;
    if(!canvas)return;
    if(!near||width<=0){canvas.width=0;canvas.height=0;return;}
    let cancelled=false;
    let task:{cancel:()=>void;promise:Promise<unknown>}|null=null;
    (async()=>{
      try{
        const page=await document_.getPage(pageNumber);
        const base=page.getViewport({scale:1});
        if(cancelled)return;
        setAspect(base.width/base.height);
        const ratio=Math.min(window.devicePixelRatio||1,2.5);
        const viewport=page.getViewport({scale:(width/base.width)*ratio});
        canvas.width=Math.floor(viewport.width);canvas.height=Math.floor(viewport.height);
        const context=canvas.getContext('2d');
        if(!context)return;
        task=page.render({canvasContext:context,viewport});
        await task!.promise;
      }catch(error:any){
        if(error?.name!=='RenderingCancelledException')console.error('Disegno della pagina non riuscito',error);
      }
    })();
    return()=>{cancelled=true;task?.cancel();};
  },[document_,pageNumber,near,width]);

  return <div className="pdf-page" ref={wrapperRef} data-pdf-page={pageNumber} style={aspect?{aspectRatio:String(aspect)}:{aspectRatio:'0.707'}}>
    <canvas ref={canvasRef} role="img" aria-label={label}/>
    <span className="pdf-page__label" aria-hidden="true">{label}</span>
  </div>;
}
