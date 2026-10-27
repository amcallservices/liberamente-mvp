'use client';


import {useEffect,useMemo,useRef,useState} from 'react';

type Props={title:string;text:string;mode:'preview'|'full'};
type Chapter={title:string;start:number};

function splitSentences(text:string){
  const normalized=text.replace(/\r/g,'').trim();
  if(typeof Intl!=='undefined'&&'Segmenter' in Intl){
    const Segmenter=(Intl as any).Segmenter;
    return Array.from(new Segmenter('it',{granularity:'sentence'}).segment(normalized) as Iterable<{segment:string}>,(part:{segment:string})=>part.segment.trim()).filter(Boolean);
  }
  return normalized.match(/[^.!?\n]+[.!?]+|[^\n]+$/g)?.map(part=>part.trim()).filter(Boolean)??[];
}

function chaptersFor(sentences:string[]):Chapter[]{
  const chapters:Chapter[]=[{title:'Inizio',start:0}];
  sentences.forEach((sentence,index)=>{
    const line=sentence.replace(/^#+\s*/,'').trim();
    if(/^(capitolo\s+\w+|chapter\s+\w+|(?:[0-9]+|[IVXLCDM]+)[.\s]+[A-ZÀ-Ý])/i.test(line))chapters.push({title:line.slice(0,80),start:index});
  });
  return chapters;
}

export function ReadingExperience({title,text,mode}:Props){
  const sentences=useMemo(()=>splitSentences(text),[text]);
  const chapters=useMemo(()=>chaptersFor(sentences),[sentences]);
  const [voices,setVoices]=useState<SpeechSynthesisVoice[]>([]),[voiceUri,setVoiceUri]=useState(''),[rate,setRate]=useState('1'),[chapter,setChapter]=useState('0'),[active,setActive]=useState<number|null>(null),[playing,setPlaying]=useState(false);
  const indexRef=useRef(0),stoppedRef=useRef(true),speechRef=useRef<SpeechSynthesis|null>(null);
  const modeLabel=mode==='preview'?'Leggi un estratto gratuito':'Leggi e ascolta nel sito';
  const selectedStart=chapters[Number(chapter)]?.start??0;

  useEffect(()=>{
    if(!('speechSynthesis' in window))return;
    const speech=window.speechSynthesis;speechRef.current=speech;
    const load=()=>{const available=speech.getVoices();setVoices(available);const italian=available.find(voice=>voice.lang.toLowerCase().startsWith('it'));setVoiceUri(current=>current||italian?.voiceURI||available[0]?.voiceURI||'')};
    load();speech.addEventListener('voiceschanged',load);
    return()=>{speech.removeEventListener('voiceschanged',load);speech.cancel()};
  },[]);

  useEffect(()=>{if(active!==null)document.getElementById(`reader-sentence-${mode}-${active}`)?.scrollIntoView({block:'nearest',behavior:'smooth'})},[active,mode]);

  const stop=()=>{stoppedRef.current=true;speechRef.current?.cancel();setPlaying(false);setActive(null)};
  const speakFrom=(start:number)=>{
    const speech=speechRef.current;
    if(!speech||!sentences.length)return;
    speech.cancel();stoppedRef.current=false;indexRef.current=start;setPlaying(true);
    const next=()=>{
      if(stoppedRef.current||indexRef.current>=sentences.length){setPlaying(false);if(!stoppedRef.current)setActive(null);return}
      const index=indexRef.current,utterance=new SpeechSynthesisUtterance(sentences[index]);
      utterance.lang='it-IT';utterance.rate=Number(rate);utterance.voice=voices.find(voice=>voice.voiceURI===voiceUri)||null;
      utterance.onstart=()=>setActive(index);
      utterance.onend=()=>{indexRef.current=index+1;next()};
      utterance.onerror=()=>{if(!stoppedRef.current){setPlaying(false);setActive(null)}};
      speech.speak(utterance);
    };
    next();
  };
  const togglePause=()=>{const speech=speechRef.current;if(!speech)return;if(speech.paused){speech.resume();setPlaying(true)}else{speech.pause();setPlaying(false)}};

  if(!sentences.length)return null;
  return <details className={`reading-experience reading-${mode}`}>
    <summary><span>{modeLabel}</span><small>{mode==='preview'?'Anteprima autorizzata dall’autore':'Riservato al tuo acquisto'}</small></summary>
    <div className="reading-toolbar">
      <label>Capitolo<select value={chapter} onChange={event=>{stop();setChapter(event.target.value)}}>{chapters.map((item,index)=><option key={`${item.title}-${index}`} value={index}>{item.title}</option>)}</select></label>
      <label>Voce<select value={voiceUri} onChange={event=>setVoiceUri(event.target.value)} disabled={!voices.length}>{voices.filter(voice=>voice.lang.toLowerCase().startsWith('it')).map(voice=><option key={voice.voiceURI} value={voice.voiceURI}>{voice.name}</option>)}{!voices.some(voice=>voice.lang.toLowerCase().startsWith('it'))&&<option value="">Voce italiana del dispositivo</option>}</select></label>
      <label>Velocità<select value={rate} onChange={event=>setRate(event.target.value)}><option value="0.8">Lenta</option><option value="1">Normale</option><option value="1.15">Rapida</option></select></label>
      <div className="reading-controls"><button type="button" onClick={()=>speakFrom(active??selectedStart)}>{playing?'Ricomincia qui':'Ascolta'}</button><button type="button" className="button alt" onClick={togglePause} disabled={active===null&&!playing}>{playing?'Pausa':'Riprendi'}</button><button type="button" className="button alt" onClick={stop}>Ferma</button></div>
    </div>
    <p className="reading-help">La voce è gratuita e utilizza il sintetizzatore italiano disponibile sul dispositivo. Il testo evidenziato indica il punto di lettura.</p>
    <div className="reading-text" aria-live="polite">{sentences.map((sentence,index)=><span id={`reader-sentence-${mode}-${index}`} className={active===index?'is-reading':''} key={`${index}-${sentence.slice(0,12)}`}>{sentence} </span>)}</div>
  </details>;
}
