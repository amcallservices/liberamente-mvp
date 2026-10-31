'use client';

import {useMemo,useRef,useState} from 'react';
import Link from 'next/link';
import {eur} from '@/lib/money';
import {marketplacePath,type MarketplaceLocale} from '@/lib/marketplace';

type ShowcaseBook={id:string;title:string;slug:string;description:string;category:string|null;price_cents:number;cover:string|null;author:string;sales:number;reviews:number;rating:number};

export function HomeDiscovery({bestSellers,mostReviewed,newReleases,plusPicks,locale='it'}:{bestSellers:ShowcaseBook[];mostReviewed:ShowcaseBook[];newReleases:ShowcaseBook[];plusPicks:ShowcaseBook[];locale?:MarketplaceLocale}){
  const [view,setView]=useState<'sales'|'reviews'|'new'|'plus'>('sales');
  const rail=useRef<HTMLDivElement>(null);
  const books=useMemo(()=>({sales:bestSellers,reviews:mostReviewed,new:newReleases,plus:plusPicks}[view]),[view,bestSellers,mostReviewed,newReleases,plusPicks]);
  const move=(direction:-1|1)=>rail.current?.scrollBy({left:direction*330,behavior:'smooth'});
  const label=locale==='en'?{sales:'Best sellers',reviews:'Top reviewed',new:'New releases',plus:'Read with Plus'}[view]:{sales:'I più venduti',reviews:'I più recensiti',new:'Novità da scoprire',plus:'Leggi con Plus'}[view];
  const description=locale==='en'?{sales:'The titles readers are choosing most.',reviews:'Stories that sparked the most reader conversations.',new:'The latest stories in the catalogue.',plus:'A selection included with LIBERAMENTE Plus.'}[view]:{sales:'I titoli che i lettori stanno scegliendo di più.',reviews:'Le storie che hanno acceso più conversazioni tra i lettori.',new:'Le ultime storie entrate nel catalogo.',plus:'Una selezione inclusa nell’abbonamento LIBERAMENTE Plus.'}[view];
  return <section className="discovery-showcase" aria-labelledby="discovery-title">
    <div className="discovery-header"><div><p className="featured-label">{locale==='en'?'Discover without losing your place':'Scopri senza perdere il filo'}</p><h2 id="discovery-title">{label}</h2><p>{description}</p></div><div className="discovery-actions"><div className="discovery-tabs" aria-label={locale==='en'?'Sort the showcase':'Ordina la vetrina'}><button type="button" className={view==='sales'?'active':''} aria-pressed={view==='sales'} onClick={()=>setView('sales')}>{locale==='en'?'Best sellers':'Più venduti'}</button><button type="button" className={view==='reviews'?'active':''} aria-pressed={view==='reviews'} onClick={()=>setView('reviews')}>{locale==='en'?'Top reviewed':'Più recensiti'}</button><button type="button" className={view==='new'?'active':''} aria-pressed={view==='new'} onClick={()=>setView('new')}>{locale==='en'?'New':'Novità'}</button>{plusPicks.length>0&&<button type="button" className={view==='plus'?'active':''} aria-pressed={view==='plus'} onClick={()=>setView('plus')}>Plus</button>}</div><div className="rail-arrows"><button type="button" aria-label={locale==='en'?'Scroll books back':'Scorri i libri indietro'} onClick={()=>move(-1)}>←</button><button type="button" aria-label={locale==='en'?'Scroll books forward':'Scorri i libri avanti'} onClick={()=>move(1)}>→</button></div></div></div>
    <div className="discovery-rail" ref={rail} tabIndex={0} aria-label={`${label}: scorri i libri disponibili`}>
      {books.map((book,index)=><article className="discovery-book" key={`${view}-${book.id}`}>
        <Link className="discovery-cover" href={marketplacePath(locale,`/ebook/${book.slug}`)} aria-label={`Apri ${book.title}`}>{book.cover?<img src={book.cover} alt={`Copertina di ${book.title}`}/>:<span>Copertina in arrivo</span>}</Link>
        <div className="discovery-copy"><p className="discovery-rank">{view==='sales'?`#${index+1} ${locale==='en'?'best seller':'tra i più venduti'}`:view==='reviews'?`★ ${book.reviews?book.rating.toLocaleString(locale==='en'?'en-US':'it-IT',{minimumFractionDigits:1,maximumFractionDigits:1}):'—'} · ${book.reviews} ${locale==='en'?'reviews':'recensioni'}`:view==='plus'?'Included in LIBERAMENTE Plus':'Nuovo nel catalogo'}</p><p className="muted">{locale==='en'?'by':'di'} {book.author}</p><h3>{book.title}</h3><p className="discovery-description">{book.description}</p><div className="discovery-footer"><span className="price">{eur(book.price_cents)}</span><Link className="button book-discover" href={marketplacePath(locale,`/ebook/${book.slug}`)}>{locale==='en'?'Discover book':'Scopri il libro'} <span aria-hidden="true">→</span></Link></div></div>
      </article>)}
    </div>
    <Link className="showcase-link" href={marketplacePath(locale,'/catalogo')}>{locale==='en'?'View all ebooks':'Vedi tutti gli ebook'} <span aria-hidden="true">→</span></Link>
  </section>;
}
