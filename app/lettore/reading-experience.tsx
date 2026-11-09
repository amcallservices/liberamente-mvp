'use client';

import {useEffect,useMemo,useRef,useState} from 'react';
import {readerBlocksFromText,speechChunksFromBlocks,type ReaderBlock} from '@/lib/reader-format';

type Props={title:string;text:string;mode:'preview'|'full';purchaseId?:string;fileMimeType?:string|null;plusBookId?:string;previewPdfUrl?:string|null};
type Chapter={title:string;blockIndex:number};

function chaptersFor(blocks:ReaderBlock[]):Chapter[]{
  const chapters:Chapter[]=[{title:'Inizio del libro',blockIndex:0}];
  blocks.forEach((block,index)=>{if(block.kind==='heading'&&index>0)chapters.push({title:block.text.slice(0,80),blockIndex:index});});
  if(chapters.length===1)blocks.forEach((block,index)=>{if(block.kind==='paragraph'&&index>0&&index%8===0)chapters.push({title:`Dal paragrafo ${index+1}`,blockIndex:index});});
  return chapters;
}

export function ReadingExperience({title,text,mode,purchaseId,fileMimeType,plusBookId,previewPdfUrl}:Props){
  const blocks=useMemo(()=>readerBlocksFromText(text),[text]);
  const chunks=useMemo(()=>speechChunksFromBlocks(blocks),[blocks]);
  const chapters=useMemo(()=>chaptersFor(blocks),[blocks]);
  const [voices,setVoices]=useState<SpeechSynthesisVoice[]>([]),[voiceUri,setVoiceUri]=useState(''),[rate,setRate]=useState('1'),[chapter,setChapter]=useState('0'),[activeBlock,setActiveBlock]=useState<number|null>(null),[playing,setPlaying]=useState(false),[documentUrl,setDocumentUrl]=useState(''),[documentLoading,setDocumentLoading]=useState(false),[documentError,setDocumentError]=useState(''),[pdfPage,setPdfPage]=useState('1');
  const chunkIndexRef=useRef(0),stoppedRef=useRef(true),speechRef=useRef<SpeechSynthesis|null>(null);
  const modeLabel=mode==='preview'?'Apri e leggi l’estratto':'Apri il lettore';
  const selectedBlock=chapters[Number(chapter)]?.blockIndex??0;
  const hasOriginalPdf=mode==='full'&&fileMimeType==='application/pdf'&&Boolean(purchaseId);
  // Con le pagine originali dell’estratto si mostra solo quella versione, senza il testo estratto duplicato.
  const showPdfOnly=mode==='preview'&&Boolean(previewPdfUrl);

  useEffect(()=>{
    if(!('speechSynthesis' in window))return;
    const speech=window.speechSynthesis;speechRef.current=speech;
    const load=()=>{const available=speech.getVoices();setVoices(available);const preferred=available.find(voice=>voice.lang.toLowerCase().startsWith('it'))??available.find(voice=>voice.lang.toLowerCase().startsWith('en'));setVoiceUri(current=>current&&available.some(voice=>voice.voiceURI===current)?current:(preferred?.voiceURI||available[0]?.voiceURI||''))};
    load();speech.addEventListener('voiceschanged',load);
    return()=>{speech.removeEventListener('voiceschanged',load);speech.cancel()};
  },[]);

  useEffect(()=>{if(activeBlock!==null)document.getElementById(`reader-block-${mode}-${activeBlock}`)?.scrollIntoView({block:'nearest',behavior:'smooth'})},[activeBlock,mode]);

  const stop=()=>{stoppedRef.current=true;speechRef.current?.cancel();setPlaying(false);setActiveBlock(null)};
  const speakFromBlock=(blockIndex:number)=>{
    const speech=speechRef.current,start=chunks.findIndex(chunk=>chunk.blockIndex>=blockIndex);
    if(!speech||start<0)return;
    speech.cancel();stoppedRef.current=false;chunkIndexRef.current=start;setPlaying(true);
    if(plusBookId)void fetch('/api/plus/reading-event',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({bookId:plusBookId,block:blockIndex,seconds:60})});
    const next=()=>{
      if(stoppedRef.current||chunkIndexRef.current>=chunks.length){setPlaying(false);if(!stoppedRef.current)setActiveBlock(null);return;}
      const chunk=chunks[chunkIndexRef.current],utterance=new SpeechSynthesisUtterance(chunk.text);
      const selectedVoice=voices.find(voice=>voice.voiceURI===voiceUri)||null;
      utterance.lang=selectedVoice?.lang||'it-IT';utterance.rate=Number(rate);utterance.voice=selectedVoice;
      utterance.onstart=()=>setActiveBlock(chunk.blockIndex);
      utterance.onend=()=>{chunkIndexRef.current+=1;next()};
      utterance.onerror=()=>{if(!stoppedRef.current){setPlaying(false);setActiveBlock(null)}};
      speech.speak(utterance);
    };
    next();
  };
  const togglePause=()=>{const speech=speechRef.current;if(!speech)return;if(speech.paused){speech.resume();setPlaying(true)}else{speech.pause();setPlaying(false)}};
  const openOriginal=async()=>{
    if(!purchaseId||documentUrl)return;
    setDocumentLoading(true);setDocumentError('');
    try{const response=await fetch(`/api/reader-file?purchaseId=${encodeURIComponent(purchaseId)}`),body=await response.json() as {url?:string;error?:string};if(!response.ok||!body.url)throw new Error(body.error||'Documento non disponibile.');setDocumentUrl(body.url)}
    catch(error){setDocumentError(error instanceof Error?error.message:'Documento non disponibile.')}
    finally{setDocumentLoading(false)}
  };
  if(!blocks.length)return null;

  const italianVoices=voices.filter(voice=>voice.lang.toLowerCase().startsWith('it'));
  const englishVoices=voices.filter(voice=>voice.lang.toLowerCase().startsWith('en'));
  return <details className={`reading-experience reading-${mode}`}>
    <summary><span>{modeLabel}</span><small>{mode==='preview'?'Anteprima autorizzata dall’autore':'Riservato al tuo acquisto'}</small></summary>
    <div className="reading-toolbar">
      <label>Inizia l’ascolto da<select value={chapter} onChange={event=>{stop();setChapter(event.target.value)}}>{chapters.map((item,index)=><option key={`${item.title}-${index}`} value={index}>{item.title}</option>)}</select></label>
      <label>Voce<select value={voiceUri} onChange={event=>setVoiceUri(event.target.value)} disabled={!voices.length}>{italianVoices.length>0&&<optgroup label="Italiano">{italianVoices.map(voice=><option key={voice.voiceURI} value={voice.voiceURI}>{voice.name} ({voice.lang})</option>)}</optgroup>}{englishVoices.length>0&&<optgroup label="English">{englishVoices.map(voice=><option key={voice.voiceURI} value={voice.voiceURI}>{voice.name} ({voice.lang})</option>)}</optgroup>}{!italianVoices.length&&!englishVoices.length&&<option value="">Voce del dispositivo</option>}</select></label>
      <label>Velocità<select value={rate} onChange={event=>setRate(event.target.value)}><option value="0.8">Lenta</option><option value="1">Normale</option><option value="1.15">Rapida</option></select></label>
      <div className="reading-controls"><button type="button" onClick={()=>speakFromBlock(selectedBlock)}>Ascolta da qui</button><button type="button" className="button alt" onClick={togglePause} disabled={activeBlock===null&&!playing}>{playing?'Pausa':'Riprendi'}</button><button type="button" className="button alt" onClick={stop}>Ferma</button></div>
    </div>
    {mode==='preview'&&previewPdfUrl&&<section className="original-document preview-document"><div><strong>Le pagine originali dell’estratto</strong><p>Le pagine 20–30 del libro, con immagini e impaginazione come nell’edizione originale.</p></div><a className="button alt" href={previewPdfUrl} target="_blank" rel="noopener noreferrer">Apri a schermo intero</a><div className="pdf-reader"><iframe title={`Estratto impaginato di ${title}`} src={`${previewPdfUrl}#toolbar=0&navpanes=0&view=FitH`}/></div></section>}
    {hasOriginalPdf&&<section className="original-document"><div><strong>Edizione impaginata</strong><p>Leggi il PDF originale con immagini, pagine e formattazione identiche al libro acquistato.</p></div>{!documentUrl?<button type="button" onClick={openOriginal} disabled={documentLoading}>{documentLoading?'Apertura in corso…':'Apri il libro impaginato'}</button>:<div className="pdf-reader"><label>Vai alla pagina<input type="number" min="1" inputMode="numeric" value={pdfPage} onChange={event=>setPdfPage(event.target.value.replace(/\D/g,'')||'1')}/></label><iframe title={`Documento originale di ${title}`} src={`${documentUrl}#page=${pdfPage}&view=FitH`}/></div>}{documentError&&<p className="notice">{documentError}</p>}</section>}
    {!showPdfOnly&&<p className="reading-help">Scegli prima un capitolo o un punto di partenza per la voce. Il testo accessibile è disponibile qui sotto; per i PDF l’edizione impaginata conserva pagine e immagini dell’originale.</p>}
    {!showPdfOnly&&<article className="reading-text" aria-label={`Testo di ${title}`}>{blocks.map((block,index)=>block.kind==='heading'?<h3 id={`reader-block-${mode}-${index}`} className={activeBlock===index?'is-reading':''} key={`${index}-${block.text}`}>{block.text}</h3>:<p id={`reader-block-${mode}-${index}`} className={activeBlock===index?'is-reading':''} key={`${index}-${block.text.slice(0,24)}`}>{block.text}</p>)}</article>}
  </details>;
}
