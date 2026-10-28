'use client';

import {useEffect,useMemo,useRef,useState} from 'react';
import {readerBlocksFromText,speechChunksFromBlocks,type ReaderBlock} from '@/lib/reader-format';

type Props={title:string;text:string;mode:'preview'|'full'};
type Chapter={title:string;blockIndex:number};

function chaptersFor(blocks:ReaderBlock[]):Chapter[]{
  const chapters:Chapter[]=[{title:'Inizio del libro',blockIndex:0}];
  blocks.forEach((block,index)=>{if(block.kind==='heading'&&index>0)chapters.push({title:block.text.slice(0,80),blockIndex:index});});
  return chapters;
}

export function ReadingExperience({title,text,mode}:Props){
  const blocks=useMemo(()=>readerBlocksFromText(text),[text]);
  const chunks=useMemo(()=>speechChunksFromBlocks(blocks),[blocks]);
  const chapters=useMemo(()=>chaptersFor(blocks),[blocks]);
  const [voices,setVoices]=useState<SpeechSynthesisVoice[]>([]),[voiceUri,setVoiceUri]=useState(''),[rate,setRate]=useState('1'),[chapter,setChapter]=useState('0'),[activeBlock,setActiveBlock]=useState<number|null>(null),[playing,setPlaying]=useState(false);
  const chunkIndexRef=useRef(0),stoppedRef=useRef(true),speechRef=useRef<SpeechSynthesis|null>(null);
  const modeLabel=mode==='preview'?'Apri e leggi l’estratto':'Apri il lettore';
  const selectedBlock=chapters[Number(chapter)]?.blockIndex??0;

  useEffect(()=>{
    if(!('speechSynthesis' in window))return;
    const speech=window.speechSynthesis;speechRef.current=speech;
    const load=()=>{const available=speech.getVoices();setVoices(available);const italian=available.find(voice=>voice.lang.toLowerCase().startsWith('it'));setVoiceUri(current=>current||italian?.voiceURI||available[0]?.voiceURI||'')};
    load();speech.addEventListener('voiceschanged',load);
    return()=>{speech.removeEventListener('voiceschanged',load);speech.cancel()};
  },[]);

  useEffect(()=>{if(activeBlock!==null)document.getElementById(`reader-block-${mode}-${activeBlock}`)?.scrollIntoView({block:'nearest',behavior:'smooth'})},[activeBlock,mode]);

  const stop=()=>{stoppedRef.current=true;speechRef.current?.cancel();setPlaying(false);setActiveBlock(null)};
  const speakFromBlock=(blockIndex:number)=>{
    const speech=speechRef.current,start=chunks.findIndex(chunk=>chunk.blockIndex>=blockIndex);
    if(!speech||start<0)return;
    speech.cancel();stoppedRef.current=false;chunkIndexRef.current=start;setPlaying(true);
    const next=()=>{
      if(stoppedRef.current||chunkIndexRef.current>=chunks.length){setPlaying(false);if(!stoppedRef.current)setActiveBlock(null);return;}
      const chunk=chunks[chunkIndexRef.current],utterance=new SpeechSynthesisUtterance(chunk.text);
      utterance.lang='it-IT';utterance.rate=Number(rate);utterance.voice=voices.find(voice=>voice.voiceURI===voiceUri)||null;
      utterance.onstart=()=>setActiveBlock(chunk.blockIndex);
      utterance.onend=()=>{chunkIndexRef.current+=1;next()};
      utterance.onerror=()=>{if(!stoppedRef.current){setPlaying(false);setActiveBlock(null)}};
      speech.speak(utterance);
    };
    next();
  };
  const togglePause=()=>{const speech=speechRef.current;if(!speech)return;if(speech.paused){speech.resume();setPlaying(true)}else{speech.pause();setPlaying(false)}};
  if(!blocks.length)return null;

  const italianVoices=voices.filter(voice=>voice.lang.toLowerCase().startsWith('it'));
  return <details className={`reading-experience reading-${mode}`}>
    <summary><span>{modeLabel}</span><small>{mode==='preview'?'Anteprima autorizzata dall’autore':'Riservato al tuo acquisto'}</small></summary>
    <div className="reading-toolbar">
      <label>Inizia da<select value={chapter} onChange={event=>{stop();setChapter(event.target.value)}}>{chapters.map((item,index)=><option key={`${item.title}-${index}`} value={index}>{item.title}</option>)}</select></label>
      <label>Voce<select value={voiceUri} onChange={event=>setVoiceUri(event.target.value)} disabled={!voices.length}>{italianVoices.map(voice=><option key={voice.voiceURI} value={voice.voiceURI}>{voice.name}</option>)}{!italianVoices.length&&<option value="">Voce italiana del dispositivo</option>}</select></label>
      <label>Velocità<select value={rate} onChange={event=>setRate(event.target.value)}><option value="0.8">Lenta</option><option value="1">Normale</option><option value="1.15">Rapida</option></select></label>
      <div className="reading-controls"><button type="button" onClick={()=>speakFromBlock(activeBlock??selectedBlock)}>{playing?'Ricomincia qui':'Ascolta'}</button><button type="button" className="button alt" onClick={togglePause} disabled={activeBlock===null&&!playing}>{playing?'Pausa':'Riprendi'}</button><button type="button" className="button alt" onClick={stop}>Ferma</button></div>
    </div>
    <p className="reading-help">Il testo è organizzato in titoli e paragrafi. La voce legge blocchi naturali, mantenendo il punto evidenziato sul testo.</p>
    <article className="reading-text" aria-label={`Testo di ${title}`}>{blocks.map((block,index)=>block.kind==='heading'?<h3 id={`reader-block-${mode}-${index}`} className={activeBlock===index?'is-reading':''} key={`${index}-${block.text}`}>{block.text}</h3>:<p id={`reader-block-${mode}-${index}`} className={activeBlock===index?'is-reading':''} key={`${index}-${block.text.slice(0,24)}`}>{block.text}</p>)}</article>
  </details>;
}
