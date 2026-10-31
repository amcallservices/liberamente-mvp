'use client';

import {useMemo,useRef,useState} from 'react';
import Link from 'next/link';
import {eur} from '@/lib/money';

type ShowcaseBook={id:string;title:string;slug:string;description:string;category:string|null;price_cents:number;cover:string|null;author:string;sales:number;reviews:number;rating:number};

export function HomeDiscovery({bestSellers,mostReviewed,newReleases,plusPicks}:{bestSellers:ShowcaseBook[];mostReviewed:ShowcaseBook[];newReleases:ShowcaseBook[];plusPicks:ShowcaseBook[]}){
  const [view,setView]=useState<'sales'|'reviews'|'new'|'plus'>('sales');
  const rail=useRef<HTMLDivElement>(null);
  const books=useMemo(()=>({sales:bestSellers,reviews:mostReviewed,new:newReleases,plus:plusPicks}[view]),[view,bestSellers,mostReviewed,newReleases,plusPicks]);
  const move=(direction:-1|1)=>rail.current?.scrollBy({left:direction*330,behavior:'smooth'});
  const label={sales:'I più venduti',reviews:'I più recensiti',new:'Novità da scoprire',plus:'Leggi con Plus'}[view];
  const description={sales:'I titoli che i lettori stanno scegliendo di più.',reviews:'Le storie che hanno acceso più conversazioni tra i lettori.',new:'Le ultime storie entrate nel catalogo.',plus:'Una selezione inclusa nell’abbonamento LIBERAMENTE Plus.'}[view];
  return <section className="discovery-showcase" aria-labelledby="discovery-title">
    <div className="discovery-header"><div><p className="featured-label">Scopri senza perdere il filo</p><h2 id="discovery-title">{label}</h2><p>{description}</p></div><div className="discovery-actions"><div className="discovery-tabs" aria-label="Ordina la vetrina"><button type="button" className={view==='sales'?'active':''} aria-pressed={view==='sales'} onClick={()=>setView('sales')}>Più venduti</button><button type="button" className={view==='reviews'?'active':''} aria-pressed={view==='reviews'} onClick={()=>setView('reviews')}>Più recensiti</button><button type="button" className={view==='new'?'active':''} aria-pressed={view==='new'} onClick={()=>setView('new')}>Novità</button>{plusPicks.length>0&&<button type="button" className={view==='plus'?'active':''} aria-pressed={view==='plus'} onClick={()=>setView('plus')}>Plus</button>}</div><div className="rail-arrows"><button type="button" aria-label="Scorri i libri indietro" onClick={()=>move(-1)}>←</button><button type="button" aria-label="Scorri i libri avanti" onClick={()=>move(1)}>→</button></div></div></div>
    <div className="discovery-rail" ref={rail} tabIndex={0} aria-label={`${label}: scorri i libri disponibili`}>
      {books.map((book,index)=><article className="discovery-book" key={`${view}-${book.id}`}>
        <Link className="discovery-cover" href={`/ebook/${book.slug}`} aria-label={`Apri ${book.title}`}>{book.cover?<img src={book.cover} alt={`Copertina di ${book.title}`}/>:<span>Copertina in arrivo</span>}</Link>
        <div className="discovery-copy"><p className="discovery-rank">{view==='sales'?`#${index+1} tra i più venduti`:view==='reviews'?`★ ${book.reviews?book.rating.toLocaleString('it-IT',{minimumFractionDigits:1,maximumFractionDigits:1}):'—'} · ${book.reviews} recension${book.reviews===1?'e':'i'}`:view==='plus'?'Incluso in LIBERAMENTE Plus':'Nuovo nel catalogo'}</p><p className="muted">di {book.author}</p><h3>{book.title}</h3><p className="discovery-description">{book.description}</p><div className="discovery-footer"><span className="price">{eur(book.price_cents)}</span><Link className="button book-discover" href={`/ebook/${book.slug}`}>Scopri il libro <span aria-hidden="true">→</span></Link></div></div>
      </article>)}
    </div>
    <Link className="showcase-link" href="/catalogo">Vedi tutti gli ebook <span aria-hidden="true">→</span></Link>
  </section>;
}
