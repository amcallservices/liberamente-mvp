'use client';

import {useCallback,useEffect,useMemo,useRef,useState} from 'react';
import {usePathname,useRouter,useSearchParams} from 'next/navigation';

type Step={target?:string;title:string;body:string};
type Tour={id:string;autoStart:boolean;steps:{it:Step[];en:Step[]}};

const TOURS:Record<string,Tour>={
  home:{id:'home',autoStart:true,steps:{
    it:[
      {title:'Benvenuto su LIBERAMENTE',body:'Qui trovi ebook di autori italiani indipendenti. In un minuto ti mostriamo come trovare, provare e comprare il tuo prossimo libro.'},
      {target:'.site-header form[role="search"]',title:'Cerca un libro',body:'Scrivi un titolo, un autore o un tema: la ricerca guarda in tutto il catalogo.'},
      {target:'.lm-tabs',title:'Scegli la classifica',body:'Passa tra più venduti, più recensiti, novità e titoli inclusi in Plus.'},
      {target:'.lm-stagepanel',title:'Sfoglia il libro',body:'Muovi il mouse sopra il libro per girarlo. Scorrendo la pagina, o con "Sfoglia il libro", si apre e mostra la quarta di copertina.'},
      {target:'.lm-thumbs',title:'Cambia titolo',body:'Tocca o passa sopra una copertina per vederne i dettagli, il prezzo e il pulsante per scoprirlo.'},
      {target:'.lm-calc',title:'LIBERAMENTE Plus',body:'Con un solo abbonamento leggi tutti i titoli aderenti. Sposta il cursore per vedere quanto risparmi.'},
      {target:'.lm-authors__copy',title:'Scrivi anche tu?',body:'Pubblica il tuo ebook: ricevi il 50% su ogni vendita, con pagamenti ogni 30 giorni.'},
      {target:'.site-header nav a[href$="/catalogo"]',title:'Esplora il catalogo',body:'Da qui vedi tutti gli ebook, con filtri per genere, prezzo e valutazione. Buona lettura!'}
    ],
    en:[
      {title:'Welcome to LIBERAMENTE',body:'Ebooks by independent authors. In one minute we’ll show you how to find, try and buy your next book.'},
      {target:'.site-header form[role="search"]',title:'Search for a book',body:'Type a title, an author or a topic: the search covers the whole catalogue.'},
      {target:'.lm-tabs',title:'Pick a list',body:'Switch between best sellers, top reviewed, new releases and titles included in Plus.'},
      {target:'.lm-stagepanel',title:'Leaf through the book',body:'Move your mouse over the book to turn it. Scroll down, or tap "Leaf through", and it opens to show the blurb.'},
      {target:'.lm-thumbs',title:'Switch title',body:'Tap or hover a cover to see its details, price and a button to discover it.'},
      {target:'.lm-calc',title:'LIBERAMENTE Plus',body:'One subscription for every included title. Move the slider to see how much you save.'},
      {target:'.lm-authors__copy',title:'Do you write?',body:'Publish your ebook and earn 50% on every sale, paid every 30 days.'},
      {target:'.site-header nav a[href$="/catalogo"]',title:'Browse the catalogue',body:'See every ebook, with filters by genre, price and rating. Happy reading!'}
    ]
  }},
  catalog:{id:'catalog',autoStart:false,steps:{
    it:[
      {target:'.lm-filterwrap',title:'Filtra e ordina',body:'Cerca per autore, scegli una fascia di prezzo o una valutazione minima e ordina come preferisci.'},
      {target:'.lm-cat__genres',title:'Scegli un genere',body:'Il numero accanto a ogni genere indica quanti ebook trovi.'},
      {target:'.lm-card',title:'Ogni libro',body:'Copertina, autore, valutazione e prezzo. Clicca per aprire la scheda, leggere l’estratto e acquistare.'}
    ],
    en:[
      {target:'.lm-filterwrap',title:'Filter and sort',body:'Search by author, pick a price range or a minimum rating, and sort the way you like.'},
      {target:'.lm-cat__genres',title:'Pick a genre',body:'The number next to each genre shows how many ebooks it has.'},
      {target:'.lm-card',title:'Every book',body:'Cover, author, rating and price. Click to open the book page, read the excerpt and buy.'}
    ]
  }},
  book:{id:'book',autoStart:false,steps:{
    it:[
      {target:'.lm-bp__facts',title:'Il libro in breve',body:'Pagine, lettori, recensioni e formato: tutto a colpo d’occhio.'},
      {target:'.lm-bp__buy',title:'Acquista in sicurezza',body:'Paghi con carta o PayPal. Il PDF resta per sempre nella tua Area lettore, da leggere online o scaricare.'},
      {target:'.lm-bp__actions',title:'Prova prima di comprare',body:'Se l’autore l’ha attivato, leggi un estratto gratuito. Puoi anche condividere il libro.'},
      {target:'.lm-bp__reviews',title:'Recensioni verificate',body:'Recensisce solo chi ha acquistato il libro.'}
    ],
    en:[
      {target:'.lm-bp__facts',title:'The book at a glance',body:'Pages, readers, reviews and format at a glance.'},
      {target:'.lm-bp__buy',title:'Buy safely',body:'Pay by card or PayPal. The PDF stays in your Reader area for good, to read online or download.'},
      {target:'.lm-bp__actions',title:'Try before you buy',body:'If the author enabled it, read a free excerpt. You can also share the book.'},
      {target:'.lm-bp__reviews',title:'Verified reviews',body:'Only people who bought the book can review it.'}
    ]
  }},
  plus:{id:'plus',autoStart:false,steps:{
    it:[
      {target:'.plus-hero',title:'Come funziona Plus',body:'Un abbonamento mensile per leggere online tutti i titoli aderenti. Annulli quando vuoi.'},
      {target:'.plus-grid',title:'Lettori, autori e trasparenza',body:'Il 60% del fondo distribuibile va agli autori, in base alle pagine lette davvero.'}
    ],
    en:[
      {target:'.plus-hero',title:'How Plus works',body:'A monthly subscription to read every included title online. Cancel anytime.'},
      {target:'.plus-grid',title:'Readers, authors, transparency',body:'60% of the distributable fund goes to authors, based on the pages actually read.'}
    ]
  }},
  author:{id:'author',autoStart:true,steps:{
    it:[
      {title:'Benvenuto nell’Area autori',body:'Ecco come pubblicare il tuo ebook su LIBERAMENTE, in quattro passaggi.'},
      {target:'.author-grid form.card',title:'1. Crea la scheda',body:'Titolo, sottotitolo, categoria e una descrizione che faccia venire voglia di leggere.'},
      {target:'.titles',title:'2. Carica PDF e copertina',body:'Per ogni titolo carichi il manoscritto in PDF e la copertina, imposti il prezzo e lo invii in revisione.'},
      {target:'.royalty-card',title:'3. Segui vendite e royalty',body:'Ricevi il 50% su ogni vendita singola; le royalty si liquidano dopo 30 giorni.'},
      {target:'.author-grid section.card',title:'4. Scegli come essere pagato',body:'Stripe Connect, PayPal o bonifico: imposta qui la tua preferenza.'}
    ],
    en:[
      {title:'Welcome to the Author area',body:'Here’s how to publish your ebook on LIBERAMENTE, in four steps.'},
      {target:'.author-grid form.card',title:'1. Create the book page',body:'Title, subtitle, category and a description that makes people want to read.'},
      {target:'.titles',title:'2. Upload PDF and cover',body:'For each title upload the PDF manuscript and the cover, set the price and submit it for review.'},
      {target:'.royalty-card',title:'3. Track sales and royalties',body:'You earn 50% on every single sale; royalties are paid out after 30 days.'},
      {target:'.author-grid section.card',title:'4. Choose how you’re paid',body:'Stripe Connect, PayPal or bank transfer: set your preference here.'}
    ]
  }}
};

export function tourFor(path:string):Tour|null{
  const p=path.replace(/^\/en(?=\/|$)/,'')||'/';
  if(p==='/') return TOURS.home;
  if(p==='/catalogo') return TOURS.catalog;
  if(p.startsWith('/ebook/')) return TOURS.book;
  if(p==='/plus') return TOURS.plus;
  if(p==='/autore') return TOURS.author;
  return null;
}
const seenKey=(id:string)=>`lm-tour-${id}-seen`;
const readSeen=(id:string)=>{try{return localStorage.getItem(seenKey(id))==='1';}catch{return false;}};
const writeSeen=(id:string)=>{try{localStorage.setItem(seenKey(id),'1');}catch{}};

type Box={top:number;left:number;width:number;height:number}|null;

export function GuidedTour(){
  const pathname=usePathname()||'/';
  const params=useSearchParams();
  const router=useRouter();
  const english=pathname==='/en'||pathname.startsWith('/en/');
  const tour=useMemo(()=>tourFor(pathname),[pathname]);
  const [open,setOpen]=useState(false);
  const [index,setIndex]=useState(0);
  const [box,setBox]=useState<Box>(null);
  const [seen,setSeen]=useState(true);
  const card=useRef<HTMLDivElement>(null);

  // Only steps whose element is on this page (e.g. the author tour needs the author dashboard).
  const steps=useMemo(()=>{
    if(!tour||!open) return [] as Step[];
    return tour.steps[english?'en':'it'].filter(step=>!step.target||document.querySelector(step.target));
  },[tour,open,english]);
  const step=steps[index];

  const start=useCallback(()=>{setIndex(0);setOpen(true);},[]);
  const finish=useCallback(()=>{setOpen(false);setBox(null);if(tour){writeSeen(tour.id);setSeen(true);}},[tour]);

  useEffect(()=>{
    setOpen(false);setBox(null);
    if(!tour) return;
    const already=readSeen(tour.id);
    setSeen(already);
    const forced=params?.get('tour')==='1';
    const ready=tour.id!=='author'||document.querySelector('.author-grid');
    if((forced||(!already&&tour.autoStart))&&ready){
      const timer=window.setTimeout(start,forced?300:900);
      if(forced){const url=new URL(window.location.href);url.searchParams.delete('tour');router.replace(url.pathname+url.search,{scroll:false});}
      return ()=>window.clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[tour,pathname]);

  // Highlight the current element and keep the box in place while scrolling or resizing.
  useEffect(()=>{
    if(!open||!step) return;
    const el=step.target?document.querySelector<HTMLElement>(step.target):null;
    if(!el){setBox(null);return;}
    el.scrollIntoView({block:'center',behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
    const place=()=>{const r=el.getBoundingClientRect();setBox({top:r.top-8,left:r.left-8,width:r.width+16,height:r.height+16});};
    place();
    const timer=window.setTimeout(place,450);
    window.addEventListener('scroll',place,{passive:true});window.addEventListener('resize',place);
    return ()=>{window.clearTimeout(timer);window.removeEventListener('scroll',place);window.removeEventListener('resize',place);};
  },[open,step]);

  // The footer link asks to start the tour of the current page.
  useEffect(()=>{
    const onStart=()=>{if(tour) start();};
    window.addEventListener('lm-tour-start',onStart);
    return ()=>window.removeEventListener('lm-tour-start',onStart);
  },[tour,start]);

  useEffect(()=>{
    if(!open) return;
    card.current?.focus();
    const onKey=(e:KeyboardEvent)=>{
      if(e.key==='Escape') finish();
      if(e.key==='ArrowRight') setIndex(i=>Math.min(i+1,steps.length-1));
      if(e.key==='ArrowLeft') setIndex(i=>Math.max(i-1,0));
    };
    window.addEventListener('keydown',onKey);
    return ()=>window.removeEventListener('keydown',onKey);
  },[open,steps.length,finish,index]);

  if(!tour) return null;
  const t=english?{next:'Next',back:'Back',done:'Got it',skip:'Close the tour',start:'Guided tour',again:'Watch the guided tour again',of:'of'}:{next:'Avanti',back:'Indietro',done:'Ho capito',skip:'Chiudi la visita',start:'Visita guidata',again:'Rivedi la visita guidata',of:'di'};

  // Tooltip below the element when there is room, otherwise above; centred when there is no element.
  let cardStyle:React.CSSProperties={};
  if(box&&typeof window!=='undefined'&&window.innerWidth>640){
    const width=360,cardHeight=300,vh=window.innerHeight,vw=window.innerWidth;
    const below=box.top+box.height+16,above=box.top-16-cardHeight;
    const left=Math.min(Math.max(16,box.left),vw-width-16);
    const sideTop=Math.min(Math.max(16,box.top),vh-cardHeight-16);
    if(below+cardHeight<vh) cardStyle={top:below,left,width};
    else if(above>=16) cardStyle={top:above,left,width};
    // Tall elements: beside them, on the side with more room.
    else if(box.left+box.width+16+width<vw) cardStyle={top:sideTop,left:box.left+box.width+16,width};
    else if(box.left-16-width>=16) cardStyle={top:sideTop,left:box.left-16-width,width};
    else cardStyle={bottom:16,left,width};
  }

  return <>
    {!open&&<button type="button" className="lm-tour-launch" onClick={start} aria-label={seen?t.again:t.start}><span aria-hidden="true">?</span>{seen?t.again:t.start}</button>}
    {open&&step&&<div className="lm-tour" role="dialog" aria-modal="true" aria-labelledby="lm-tour-title">
      <div className="lm-tour__veil" onClick={finish}/>
      {box?<div className="lm-tour__spot" style={{top:box.top,left:box.left,width:box.width,height:box.height}}/>:<div className="lm-tour__dim"/>}
      <div ref={card} tabIndex={-1} className={`lm-tour__card${box?'':' is-center'}`} style={cardStyle}>
        <p className="lm-tour__count">{index+1} {t.of} {steps.length}</p>
        <h2 id="lm-tour-title">{step.title}</h2>
        <p>{step.body}</p>
        <div className="lm-tour__dots" aria-hidden="true">{steps.map((_,i)=><span key={i} className={i===index?'is-on':''}/>)}</div>
        <div className="lm-tour__actions">
          <button type="button" className="lm-tour__skip" onClick={finish}>{t.skip}</button>
          <span>
            {index>0&&<button type="button" className="lm-tour__back" onClick={()=>setIndex(i=>i-1)}>{t.back}</button>}
            {index<steps.length-1?<button type="button" className="lm-tour__next" onClick={()=>setIndex(i=>i+1)}>{t.next} <span aria-hidden="true">→</span></button>:<button type="button" className="lm-tour__next" onClick={finish}>{t.done}</button>}
          </span>
        </div>
      </div>
    </div>}
  </>;
}
