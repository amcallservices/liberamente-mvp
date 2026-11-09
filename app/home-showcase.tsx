'use client';

import {useCallback,useEffect,useMemo,useRef,useState} from 'react';
import Link from 'next/link';
import {eur} from '@/lib/money';
import {marketplacePath,type MarketplaceLocale} from '@/lib/marketplace';

export type ShowcaseBook={id:string;title:string;slug:string;description:string;category:string|null;price_cents:number;cover:string|null;author:string;sales:number;reviews:number;rating:number};
type View='sales'|'reviews'|'new'|'plus';

const ORDINALS={it:['Il più venduto','Secondo tra i più venduti','Terzo tra i più venduti','Quarto tra i più venduti'],en:['The best seller','Second best seller','Third best seller','Fourth best seller']};

function shorten(text:string,max=320){
  const clean=(text||'').replace(/\s+/g,' ').trim();
  if(clean.length<=max) return clean;
  const cut=clean.slice(0,max);
  return cut.slice(0,cut.lastIndexOf(' '))+'…';
}

export function HomeShowcase({bestSellers,mostReviewed,newReleases,plusPicks,locale='it'}:{bestSellers:ShowcaseBook[];mostReviewed:ShowcaseBook[];newReleases:ShowcaseBook[];plusPicks:ShowcaseBook[];locale?:MarketplaceLocale}){
  const en=locale==='en';
  const [view,setView]=useState<View>('sales');
  const [sel,setSel]=useState(0);
  const [flips,setFlips]=useState(0);
  const [tilt,setTilt]=useState({rx:4,ry:24});
  const [scrollOpen,setScrollOpen]=useState(0);
  const [forced,setForced]=useState<number|null>(null);
  const [reduced,setReduced]=useState(false);
  const stage=useRef<HTMLDivElement>(null);
  const lastOpen=useRef(-1);

  const lists=useMemo(()=>({sales:bestSellers,reviews:mostReviewed,new:newReleases,plus:plusPicks}),[bestSellers,mostReviewed,newReleases,plusPicks]);
  const books=lists[view].length?lists[view]:bestSellers;
  const current=books[Math.min(sel,books.length-1)];

  useEffect(()=>{
    const media=window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(media.matches);
    const onScroll=()=>{
      const el=stage.current;if(!el) return;
      const r=el.getBoundingClientRect(),vh=window.innerHeight||900;
      const p=Math.max(0,Math.min(1,(vh*0.55-r.top)/(vh*0.4)));
      const stepped=Math.round(p*20)/20;
      if(stepped!==lastOpen.current){lastOpen.current=stepped;setScrollOpen(stepped);setForced(null);}
    };
    window.addEventListener('scroll',onScroll,{passive:true});
    onScroll();
    return ()=>window.removeEventListener('scroll',onScroll);
  },[]);

  const open=forced===null?scrollOpen:forced;
  const choose=useCallback((index:number)=>{if(index!==sel){setSel(index);setFlips(f=>f+1);}},[sel]);
  const switchView=(next:View)=>{if(next!==view){setView(next);setSel(0);setFlips(f=>f+1);}};
  const onMove=(e:React.MouseEvent<HTMLDivElement>)=>{
    if(reduced) return;
    const r=e.currentTarget.getBoundingClientRect();
    const x=(e.clientX-r.left)/r.width-0.5,y=(e.clientY-r.top)/r.height-0.5;
    setTilt({ry:Math.round(24+x*36),rx:Math.round(4-y*18)});
  };

  if(!current) return null;
  const tabs:{id:View;label:string}[]=[{id:'sales',label:en?'Best sellers':'Più venduti'},{id:'reviews',label:en?'Top reviewed':'Più recensiti'},{id:'new',label:en?'New':'Novità'},...(plusPicks.length?[{id:'plus' as View,label:'Plus'}]:[])];
  const heading=en?{sales:'Best sellers',reviews:'Top reviewed',new:'New releases',plus:'Read with Plus'}[view]:{sales:'I più venduti',reviews:'I più recensiti',new:'Novità da scoprire',plus:'Leggi con Plus'}[view];
  const index=Math.min(sel,books.length-1);
  const badge=view==='sales'
    ?(index===0?(en?'The best seller · a good place to start':'Il più venduto · scelto per iniziare'):(en?ORDINALS.en:ORDINALS.it)[index]??'')
    :view==='reviews'
      ?`★ ${current.reviews?current.rating.toLocaleString(en?'en-US':'it-IT',{minimumFractionDigits:1,maximumFractionDigits:1}):'—'} · ${current.reviews} ${en?'reviews':'recensioni'}`
      :view==='plus'?(en?'Included in LIBERAMENTE Plus':'Incluso in LIBERAMENTE Plus'):(en?'New in the catalogue':'Nuovo nel catalogo');
  const href=marketplacePath(locale,`/ebook/${current.slug}`);
  const bookStyle={transform:`translateX(${Math.round(open*50)}%) rotateX(${Math.round(tilt.rx*(1-open*0.7))}deg) rotateY(${Math.round(tilt.ry*(1-open*0.85))}deg)`};
  const lidStyle={transform:`translateZ(16px) rotateY(${Math.round(-165*open)}deg)`};
  const flipClass=flips===0?'':flips%2?'lm-flipA':'lm-flipB';

  return <section className="lm-showcase lm-rise lm-d3" aria-labelledby="lm-showcase-title">
    <div className="lm-grid">
      <div className="lm-stagepanel" ref={stage} onMouseMove={onMove} onMouseLeave={()=>setTilt({rx:4,ry:24})}>
        <div className="lm-stage">
          <div className={flipClass} key={`${view}-${current.id}`}>
            <Link href={href} aria-label={`${en?'Open':'Apri'} ${current.title}`} className="lm-booklink">
              <div className="lm-book" style={bookStyle}>
                <div className="lm-book__back"/>
                <div className="lm-book__spine"/>
                <div className="lm-book__pages"/>
                <div className="lm-book__top"/>
                <div className="lm-book__page" aria-hidden={open<0.5}>
                  <p className="lm-book__title">{current.title}</p>
                  <p className="lm-book__author">{current.author}</p>
                  <p className="lm-book__blurb">{shorten(current.description,240)}</p>
                  <p className="lm-book__price">{eur(current.price_cents)}</p>
                </div>
                <div className="lm-book__lid" style={lidStyle}>
                  {current.cover?<img src={current.cover} alt={`${en?'Cover of':'Copertina di'} ${current.title}`}/>:<span className="lm-book__nocover">{current.title}</span>}
                  <div className="lm-book__inside"/>
                </div>
              </div>
            </Link>
          </div>
        </div>
        <button type="button" className="lm-toggle" onClick={()=>setForced(open>0.5?0:1)}>{open>0.5?(en?'Close the book':'Chiudi il libro'):(en?'Leaf through':'Sfoglia il libro')}</button>
      </div>

      <div className="lm-info">
        <div className="lm-info__top">
          <h2 id="lm-showcase-title">{heading}</h2>
          <div className="lm-tabs" aria-label={en?'Sort the showcase':'Ordina la vetrina'}>
            {tabs.map(tab=><button key={tab.id} type="button" className={view===tab.id?'is-active':''} aria-pressed={view===tab.id} onClick={()=>switchView(tab.id)}>{tab.label}</button>)}
          </div>
        </div>
        <div className="lm-info__book" aria-live="polite">
          <p className="lm-badge">{badge}</p>
          <h3>{current.title}</h3>
          <p className="lm-author">{en?'by':'di'} {current.author}</p>
          <p className="lm-desc">{shorten(current.description)}</p>
          <div className="lm-buy"><span className="lm-price">{eur(current.price_cents)}</span><Link className="lm-btn lm-btn--gold" href={href}>{en?'Discover the book':'Scopri il libro'} <span aria-hidden="true">→</span></Link></div>
        </div>
        <div>
          <div className="lm-thumbs">
            {books.map((book,i)=><button key={`${view}-${book.id}`} type="button" className={`lm-thumb${i===index?' is-on':''}`} aria-pressed={i===index} aria-label={`${en?'Show':'Mostra'} ${book.title}`} onClick={()=>choose(i)} onMouseEnter={()=>choose(i)} onFocus={()=>choose(i)}>
              {book.cover?<img src={book.cover} alt=""/>:<span>{book.title}</span>}
            </button>)}
          </div>
          <div className="lm-ledge" aria-hidden="true"/>
        </div>
      </div>
    </div>
    <Link className="lm-alllink" href={marketplacePath(locale,'/catalogo')}>{en?'View all ebooks':'Vedi tutti gli ebook'} <span aria-hidden="true">→</span></Link>
  </section>;
}
