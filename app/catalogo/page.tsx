import Link from 'next/link';
import {createClient} from '@/lib/supabase/server';
import {eur} from '@/lib/money';
import {coverUrl} from '@/lib/covers';
import {BOOK_CATEGORIES} from '@/lib/categories';

export default async function Catalog({searchParams}:{searchParams:Promise<{categoria?:string}>}){
  const {categoria}=await searchParams;
  const supabase=await createClient();
  const {data:publishedBooks}=await supabase.from('books').select('id,title,subtitle,slug,description,category,categories,price_cents,cover_path,profiles!books_author_id_fkey(display_name)').eq('status','published').order('published_at',{ascending:false});
  const allBooks=publishedBooks??[];
  const books=categoria?allBooks.filter((b:any)=>b.category===categoria||(Array.isArray(b.categories)&&b.categories.includes(categoria))):allBooks;
  return <main className="wrap"><p className="eyebrow">Ebook indipendenti</p><h1>Trova la tua prossima lettura.</h1><div className="catalog-layout"><aside className="category-panel"><strong>Categorie</strong><Link className={!categoria?'active-category':''} href="/catalogo">Tutte le categorie <span>{allBooks.length}</span></Link>{BOOK_CATEGORIES.map(category=><Link className={categoria===category?'active-category':''} key={category} href={`/catalogo?categoria=${encodeURIComponent(category)}`}>{category}</Link>)}</aside><section><div className="catalog-result"><p>{categoria?`Categoria: ${categoria}`:'Tutti gli ebook pubblicati'}</p><span>{books.length} titoli</span></div><div className="grid catalogue">{books.map((b:any)=>{const image=coverUrl(b.cover_path);return <article className="card book-card" key={b.id}>{image?<img className="cover-image" src={image} alt={`Copertina di ${b.title}`}/>:<div className="cover">Copertina in arrivo</div>}<p className="eyebrow">{b.category||'Ebook'}</p><p className="muted">di {b.profiles?.display_name||'Autore'}</p><h2>{b.title}</h2>{b.subtitle&&<p className="subtitle">{b.subtitle}</p>}<p className="clamp">{b.description}</p><div className="card-footer"><span className="price">{eur(b.price_cents)}</span><Link className="button" href={`/ebook/${b.slug}`}>Scopri il libro</Link></div></article>})}</div>{!books.length&&<div className="empty"><h2>Nessun ebook in questa categoria</h2><p>Prova una categoria diversa o torna a vedere tutti i titoli.</p><Link className="button alt" href="/catalogo">Mostra tutti</Link></div>}</section></div></main>;
}
