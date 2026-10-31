import Link from 'next/link';
import type {Metadata} from 'next';
import {rankBooksForQuery} from '@/lib/book-search';
import {coverUrl} from '@/lib/covers';
import {BOOK_CATEGORIES} from '@/lib/categories';
import {eur} from '@/lib/money';
import {admin} from '@/lib/supabase/admin';

export const metadata:Metadata={title:'Catalogo ebook italiani',description:'Esplora il catalogo di ebook indipendenti italiani: narrativa, saggi, thriller, romance, crescita personale e molto altro.',alternates:{canonical:'/catalogo'},openGraph:{title:'Catalogo ebook indipendenti | LIBERAMENTE.site',description:'Trova la tua prossima lettura tra gli ebook di autori indipendenti italiani.'}};

export default async function Catalog({searchParams}:{searchParams:Promise<{categoria?:string;q?:string;ordine?:string;plus?:string;prezzo?:string;valutazione?:string;autore?:string}>}){
  const {categoria,q:rawQuery,ordine:rawOrder,plus,prezzo,valutazione,autore:rawAuthor}=await searchParams;
  const query=rawQuery?.trim()||'';
  const onlyPlus=plus==='1';
  const order=['popolari','recensiti','novita','prezzo-crescente','prezzo-decrescente'].includes(rawOrder??'')?rawOrder!:'popolari';
  const authorQuery=rawAuthor?.trim().toLocaleLowerCase('it')||'';
  // Il catalogo viene letto anche senza login. Il client di servizio evita che
  // le policy del profilo nascondano il solo nome pubblico dell'autore.
  const supabase=admin();
  const [{data:publishedBooks},{data:statsRows}]=await Promise.all([
    supabase.from('books').select('id,title,subtitle,slug,description,category,categories,price_cents,cover_path,published_at,plus_enabled,profiles!books_author_id_fkey(display_name)').eq('status','published').order('published_at',{ascending:false}).limit(500),
    supabase.from('book_discovery_stats').select('book_id,sales_count,review_count,average_rating'),
  ]);
  const allBooks=publishedBooks??[];
  const stats=new Map((statsRows??[]).map((row:any)=>[row.book_id,row]));
  const ranked=query?rankBooksForQuery(allBooks,query):allBooks.map(book=>({book,score:0}));
  const relevance=new Map(ranked.map(({book,score})=>[book.id,score]));
  const searchedBooks=ranked.map(({book})=>book);
  const plusFilteredBooks=onlyPlus?searchedBooks.filter((book:any)=>book.plus_enabled):searchedBooks;
  const categoryCounts=new Map<string,number>();
  const categorySource=onlyPlus?allBooks.filter((book:any)=>book.plus_enabled):allBooks;
  categorySource.forEach((book:any)=>new Set([book.category,...(Array.isArray(book.categories)?book.categories:[])]).forEach((category:any)=>{if(category)categoryCounts.set(category,(categoryCounts.get(category)??0)+1)}));
  const availableCategories=BOOK_CATEGORIES.filter(category=>(categoryCounts.get(category)??0)>0);
  const bsr=new Map([...allBooks].sort((a:any,b:any)=>Number(stats.get(b.id)?.sales_count??0)-Number(stats.get(a.id)?.sales_count??0)||a.title.localeCompare(b.title,'it')).map((book:any,index)=>[book.id,index+1]));
  const matchingBooks=(categoria?plusFilteredBooks.filter((book:any)=>book.category===categoria||(Array.isArray(book.categories)&&book.categories.includes(categoria))):plusFilteredBooks).filter((book:any)=>{
    const profile=Array.isArray(book.profiles)?book.profiles[0]:book.profiles;
    const matchesAuthor=!authorQuery||String(profile?.display_name??'').toLocaleLowerCase('it').includes(authorQuery);
    const price=Number(book.price_cents??0);
    const matchesPrice=!prezzo||(prezzo==='fino-5'&&price<=500)||(prezzo==='5-10'&&price>500&&price<=1000)||(prezzo==='10-15'&&price>1000&&price<=1500)||(prezzo==='oltre-15'&&price>1500);
    const matchesRating=!valutazione||Number(stats.get(book.id)?.average_rating??0)>=Number(valutazione);
    return matchesAuthor&&matchesPrice&&matchesRating;
  });
  const books=[...matchingBooks].sort((a:any,b:any)=>{
    if(query){const difference=Number(relevance.get(b.id)??0)-Number(relevance.get(a.id)??0);if(difference)return difference;}
    const left=stats.get(a.id),right=stats.get(b.id);
    if(order==='novita')return String(b.published_at??'').localeCompare(String(a.published_at??''))||a.title.localeCompare(b.title,'it');
    if(order==='prezzo-crescente')return Number(a.price_cents??0)-Number(b.price_cents??0)||a.title.localeCompare(b.title,'it');
    if(order==='prezzo-decrescente')return Number(b.price_cents??0)-Number(a.price_cents??0)||a.title.localeCompare(b.title,'it');
    if(order==='recensiti')return Number(right?.review_count??0)-Number(left?.review_count??0)||Number(right?.average_rating??0)-Number(left?.average_rating??0)||Number(right?.sales_count??0)-Number(left?.sales_count??0)||a.title.localeCompare(b.title,'it');
    return Number(right?.sales_count??0)-Number(left?.sales_count??0)||Number(right?.review_count??0)-Number(left?.review_count??0)||Number(right?.average_rating??0)-Number(left?.average_rating??0)||a.title.localeCompare(b.title,'it');
  });
  const searchSuffix=query?` · risultati pertinenti per “${query}”`:'';
  return <main className="wrap">
    <p className="eyebrow">{onlyPlus?'LIBERAMENTE Plus':'Ebook indipendenti'}</p>
    <h1>{onlyPlus?'Titoli inclusi in LIBERAMENTE Plus.':'Trova la tua prossima lettura.'}</h1>
    <div className="catalog-layout">
      <aside className="category-panel" aria-label="Categorie del catalogo">
        <div className="category-panel-heading"><strong>Esplora per genere</strong><span>{onlyPlus?'Titoli Plus disponibili':'Generi disponibili'}</span></div>
        <Link className={`category-link ${!categoria?'active-category':''}`} href={`/catalogo?ordine=${order}${query?`&q=${encodeURIComponent(query)}`:''}${onlyPlus?'&plus=1':''}`}><span>Tutti gli ebook</span><em>{categorySource.length}</em></Link>
        <div className="category-list">{availableCategories.map(category=><Link className={`category-link ${categoria===category?'active-category':''}`} key={category} href={`/catalogo?categoria=${encodeURIComponent(category)}&ordine=${order}${query?`&q=${encodeURIComponent(query)}`:''}${onlyPlus?'&plus=1':''}`}><span>{category}</span><em>{categoryCounts.get(category)}</em></Link>)}</div>
        {!availableCategories.length&&<p className="category-empty">I nuovi generi appariranno qui con i primi ebook pubblicati.</p>}
      </aside>
      <section>
        <div className="catalog-result"><div><p>{onlyPlus?'Ebook inclusi nel programma Plus':categoria?`Categoria: ${categoria}`:'Tutti gli ebook pubblicati'}{searchSuffix}</p><span>{books.length} titoli disponibili</span></div><form className="catalog-sort catalog-advanced-filters" action="/catalogo"><input type="hidden" name="q" value={query}/>{categoria&&<input type="hidden" name="categoria" value={categoria}/>}{onlyPlus&&<input type="hidden" name="plus" value="1"/>}<label htmlFor="autore">Autore</label><input id="autore" name="autore" defaultValue={rawAuthor} placeholder="Cerca un autore"/><label htmlFor="prezzo">Prezzo</label><select id="prezzo" name="prezzo" defaultValue={prezzo??''}><option value="">Qualsiasi prezzo</option><option value="fino-5">Fino a 5 €</option><option value="5-10">Da 5 a 10 €</option><option value="10-15">Da 10 a 15 €</option><option value="oltre-15">Oltre 15 €</option></select><label htmlFor="valutazione">Valutazione</label><select id="valutazione" name="valutazione" defaultValue={valutazione??''}><option value="">Tutte</option><option value="4">4 stelle e oltre</option><option value="3">3 stelle e oltre</option></select><label htmlFor="ordine">Ordina per</label><select id="ordine" name="ordine" defaultValue={order}><option value="popolari">Più venduti</option><option value="recensiti">Più recensiti</option><option value="novita">Novità</option><option value="prezzo-crescente">Prezzo crescente</option><option value="prezzo-decrescente">Prezzo decrescente</option></select><button>Applica filtri</button></form></div>
        <div className="grid catalogue">{books.map((book:any)=>{const image=coverUrl(book.cover_path),stat=stats.get(book.id),reviews=Number(stat?.review_count??0),rating=Number(stat?.average_rating??0);const profile=Array.isArray(book.profiles)?book.profiles[0]:book.profiles;return <article className="card book-card" key={book.id}>{image?<img className="cover-image" src={image} alt={`Copertina di ${book.title}`}/>:<div className="cover">Copertina in arrivo</div>}<p className="eyebrow">{book.plus_enabled?'Incluso in Plus · ':''}{book.category||'Ebook'} · BSR #{bsr.get(book.id)}</p><p className="muted">di {profile?.display_name||'Autore'}</p><h2>{book.title}</h2>{book.subtitle&&<p className="subtitle">{book.subtitle}</p>}<p className="rating">{reviews?`★ ${rating.toLocaleString('it-IT',{minimumFractionDigits:1,maximumFractionDigits:1})} · ${reviews} recension${reviews===1?'e':'i'}`:'Nuovo · nessuna recensione'}</p><p className="clamp">{book.description}</p><div className="card-footer"><span className="price">{eur(book.price_cents)}</span><Link className="button" href={`/ebook/${book.slug}`}>Scopri il libro</Link></div></article>})}</div>
        {!books.length&&<div className="empty"><h2>{onlyPlus?'Nessun ebook Plus disponibile':'Nessun ebook trovato'}</h2><p>{onlyPlus?'Gli autori potranno includere nuovi titoli nel programma Plus a breve.':'Prova con un tema, un autore o una categoria diversa.'}</p><Link className="button alt" href="/catalogo">{onlyPlus?'Vai al catalogo completo':'Mostra tutti'}</Link></div>}
      </section>
    </div>
  </main>;
}
