import Link from 'next/link';
import {createClient} from '@/lib/supabase/server';
import {eur} from '@/lib/money';
import {coverUrl} from '@/lib/covers';
import {BOOK_CATEGORIES} from '@/lib/categories';

export default async function Catalog({searchParams}:{searchParams:Promise<{categoria?:string;q?:string}>}){
  const {categoria,q:rawQuery}=await searchParams,query=rawQuery?.trim()||'';
  const supabase=await createClient();
  let request=supabase.from('books').select('id,title,subtitle,slug,description,category,categories,price_cents,cover_path,profiles!books_author_id_fkey(display_name)').eq('status','published').order('published_at',{ascending:false});
  if(query){const term=query.replace(/[,%()]/g,' ');request=request.or(`title.ilike.%${term}%,subtitle.ilike.%${term}%,description.ilike.%${term}%`)}
  const [{data:publishedBooks},{data:statsRows}]=await Promise.all([request,supabase.from('book_discovery_stats').select('book_id,sales_count,review_count,average_rating')]);
  const allBooks=publishedBooks??[],stats=new Map((statsRows??[]).map((row:any)=>[row.book_id,row]));
  const bsr=new Map([...allBooks].sort((a:any,b:any)=>Number(stats.get(b.id)?.sales_count??0)-Number(stats.get(a.id)?.sales_count??0)||a.title.localeCompare(b.title,'it')).map((book:any,index)=>[book.id,index+1]));
  const matchingBooks=categoria?allBooks.filter((b:any)=>b.category===categoria||(Array.isArray(b.categories)&&b.categories.includes(categoria))):allBooks;
  // Il catalogo non deve seguire l'ordine di pubblicazione: prima i libri che
  // incontrano più lettori, poi quelli con più recensioni (e, a parità, la media).
  const books=[...matchingBooks].sort((a:any,b:any)=>{
    const left=stats.get(a.id),right=stats.get(b.id);
    return Number(right?.sales_count??0)-Number(left?.sales_count??0)
      || Number(right?.review_count??0)-Number(left?.review_count??0)
      || Number(right?.average_rating??0)-Number(left?.average_rating??0)
      || a.title.localeCompare(b.title,'it');
  });
  const searchSuffix=query?` · ricerca: “${query}”`:'';
  return <main className="wrap"><p className="eyebrow">Ebook indipendenti</p><h1>Trova la tua prossima lettura.</h1><form className="catalog-search" action="/catalogo"><input name="q" defaultValue={query} placeholder="Cerca per titolo, autore o descrizione…" aria-label="Cerca ebook"/><button>Cerca</button></form><div className="catalog-layout"><aside className="category-panel"><strong>Categorie</strong><Link className={!categoria?'active-category':''} href={query?`/catalogo?q=${encodeURIComponent(query)}`:'/catalogo'}>Tutte le categorie <span>{allBooks.length}</span></Link>{BOOK_CATEGORIES.map(category=><Link className={categoria===category?'active-category':''} key={category} href={`/catalogo?categoria=${encodeURIComponent(category)}${query?`&q=${encodeURIComponent(query)}`:''}`}>{category}</Link>)}</aside><section><div className="catalog-result"><p>{categoria?`Categoria: ${categoria}`:'Tutti gli ebook pubblicati'}{searchSuffix}</p><span>In ordine di vendite e recensioni · {books.length} titoli</span></div><div className="grid catalogue">{books.map((b:any)=>{const image=coverUrl(b.cover_path),stat=stats.get(b.id),reviews=Number(stat?.review_count??0),rating=Number(stat?.average_rating??0);return <article className="card book-card" key={b.id}>{image?<img className="cover-image" src={image} alt={`Copertina di ${b.title}`}/>:<div className="cover">Copertina in arrivo</div>}<p className="eyebrow">{b.category||'Ebook'} · BSR #{bsr.get(b.id)}</p><p className="muted">di {b.profiles?.display_name||'Autore'}</p><h2>{b.title}</h2>{b.subtitle&&<p className="subtitle">{b.subtitle}</p>}<p className="rating">{reviews?`★ ${rating.toLocaleString('it-IT',{minimumFractionDigits:1,maximumFractionDigits:1})} · ${reviews} recension${reviews===1?'e':'i'}`:'Nuovo · nessuna recensione'}</p><p className="clamp">{b.description}</p><div className="card-footer"><span className="price">{eur(b.price_cents)}</span><Link className="button" href={`/ebook/${b.slug}`}>Scopri il libro</Link></div></article>})}</div>{!books.length&&<div className="empty"><h2>Nessun ebook trovato</h2><p>Prova con un’altra ricerca o una categoria diversa.</p><Link className="button alt" href="/catalogo">Mostra tutti</Link></div>}</section></div></main>;
}
