import Link from 'next/link';
import type {Metadata} from 'next';
import {rankBooksForQuery} from '@/lib/book-search';
import {coverUrl} from '@/lib/covers';
import {BOOK_CATEGORIES,categoryLabel} from '@/lib/categories';
import {eur} from '@/lib/money';
import {admin} from '@/lib/supabase/admin';
import {marketplaceLocale,marketplacePath} from '@/lib/marketplace';
import {seoLocale,storefrontMetadata} from '@/lib/seo';

export async function generateMetadata({searchParams}:{searchParams:Promise<{market?:string}>}):Promise<Metadata>{
  return storefrontMetadata(seoLocale((await searchParams).market),'catalogue');
}

export default async function Catalog({searchParams}:{searchParams:Promise<{categoria?:string;q?:string;ordine?:string;plus?:string;prezzo?:string;valutazione?:string;autore?:string;market?:string}>}){
  const {categoria,q:rawQuery,ordine:rawOrder,plus,prezzo,valutazione,autore:rawAuthor,market}=await searchParams;
  const locale=marketplaceLocale(market),local=(path:string)=>marketplacePath(locale,path);
  const english=locale==='en';
  const t=english?{plus:'LIBERAMENTE Plus',independent:'Independent ebooks',plusTitle:'Titles included in LIBERAMENTE Plus.',title:'Find your next read.',browse:'Browse by category',plusAvailable:'Available Plus titles',genres:'Available genres',all:'All ebooks',newGenres:'New genres will appear here when the first ebooks are published.',included:'Ebooks included in the Plus programme',category:'Category',published:'All published ebooks',available:'titles available',author:'Author',searchAuthor:'Search an author',price:'Price',anyPrice:'Any price',rating:'Rating',allRatings:'All ratings',sort:'Sort by',bestSelling:'Best selling',mostReviewed:'Most reviewed',newest:'Newest',lowPrice:'Price: low to high',highPrice:'Price: high to low',apply:'Apply filters',plusIncluded:'Included in Plus',book:'Ebook',by:'by',newReview:'New · no reviews yet',discover:'Discover this book',noPlus:'No Plus ebooks available',noBooks:'No ebooks found',noPlusCopy:'Authors will be able to add new titles to Plus soon.',noBooksCopy:'Try a different theme, author or category.',catalogue:'Go to full catalogue',showAll:'Show all'}:{plus:'LIBERAMENTE Plus',independent:'Ebook indipendenti',plusTitle:'Titoli inclusi in LIBERAMENTE Plus.',title:'Trova la tua prossima lettura.',browse:'Esplora per genere',plusAvailable:'Titoli Plus disponibili',genres:'Generi disponibili',all:'Tutti gli ebook',newGenres:'I nuovi generi appariranno qui con i primi ebook pubblicati.',included:'Ebook inclusi nel programma Plus',category:'Categoria',published:'Tutti gli ebook pubblicati',available:'titoli disponibili',author:'Autore',searchAuthor:'Cerca un autore',price:'Prezzo',anyPrice:'Qualsiasi prezzo',rating:'Valutazione',allRatings:'Tutte',sort:'Ordina per',bestSelling:'Più venduti',mostReviewed:'Più recensiti',newest:'Novità',lowPrice:'Prezzo crescente',highPrice:'Prezzo decrescente',apply:'Applica filtri',plusIncluded:'Incluso in Plus',book:'Ebook',by:'di',newReview:'Nuovo · nessuna recensione',discover:'Scopri il libro',noPlus:'Nessun ebook Plus disponibile',noBooks:'Nessun ebook trovato',noPlusCopy:'Gli autori potranno includere nuovi titoli nel programma Plus a breve.',noBooksCopy:'Prova con un tema, un autore o una categoria diversa.',catalogue:'Vai al catalogo completo',showAll:'Mostra tutti'};
  const query=rawQuery?.trim()||'';
  const onlyPlus=plus==='1';
  const order=['popolari','recensiti','novita','prezzo-crescente','prezzo-decrescente'].includes(rawOrder??'')?rawOrder!:'popolari';
  const authorQuery=rawAuthor?.trim().toLocaleLowerCase('it')||'';
  // Il catalogo viene letto anche senza login. Il client di servizio evita che
  // le policy del profilo nascondano il solo nome pubblico dell'autore.
  const supabase=admin();
  const [{data:publishedBooks},{data:statsRows}]=await Promise.all([
    supabase.from('books').select('id,title,subtitle,slug,description,category,categories,price_cents,cover_path,published_at,plus_enabled,profiles!books_author_id_fkey(display_name)').eq('status','published').eq('marketplace_locale',locale).order('published_at',{ascending:false}).limit(500),
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
    <p className="eyebrow">{onlyPlus?t.plus:t.independent}</p>
    <h1>{onlyPlus?t.plusTitle:t.title}</h1>
    <div className="catalog-layout">
      <aside className="category-panel" aria-label="Categorie del catalogo">
        <div className="category-panel-heading"><strong>{t.browse}</strong><span>{onlyPlus?t.plusAvailable:t.genres}</span></div>
        <Link className={`category-link ${!categoria?'active-category':''}`} href={local(`/catalogo?ordine=${order}${query?`&q=${encodeURIComponent(query)}`:''}${onlyPlus?'&plus=1':''}`)}><span>{t.all}</span><em>{categorySource.length}</em></Link>
        <div className="category-list">{availableCategories.map(category=><Link className={`category-link ${categoria===category?'active-category':''}`} key={category} href={local(`/catalogo?categoria=${encodeURIComponent(category)}&ordine=${order}${query?`&q=${encodeURIComponent(query)}`:''}${onlyPlus?'&plus=1':''}`)}><span>{categoryLabel(category,locale)}</span><em>{categoryCounts.get(category)}</em></Link>)}</div>
        {!availableCategories.length&&<p className="category-empty">{t.newGenres}</p>}
      </aside>
      <section>
        <div className="catalog-result"><div><p>{onlyPlus?t.included:categoria?`${t.category}: ${categoryLabel(categoria,locale)}`:t.published}{searchSuffix}</p><span>{books.length} {t.available}</span></div><form className="catalog-sort catalog-advanced-filters" action={local('/catalogo')}><input type="hidden" name="q" value={query}/>{categoria&&<input type="hidden" name="categoria" value={categoria}/>}{onlyPlus&&<input type="hidden" name="plus" value="1"/>}<label htmlFor="autore">{t.author}</label><input id="autore" name="autore" defaultValue={rawAuthor} placeholder={t.searchAuthor}/><label htmlFor="prezzo">{t.price}</label><select id="prezzo" name="prezzo" defaultValue={prezzo??''}><option value="">{t.anyPrice}</option><option value="fino-5">Up to €5</option><option value="5-10">€5 to €10</option><option value="10-15">€10 to €15</option><option value="oltre-15">Over €15</option></select><label htmlFor="valutazione">{t.rating}</label><select id="valutazione" name="valutazione" defaultValue={valutazione??''}><option value="">{t.allRatings}</option><option value="4">4 stars &amp; up</option><option value="3">3 stars &amp; up</option></select><label htmlFor="ordine">{t.sort}</label><select id="ordine" name="ordine" defaultValue={order}><option value="popolari">{t.bestSelling}</option><option value="recensiti">{t.mostReviewed}</option><option value="novita">{t.newest}</option><option value="prezzo-crescente">{t.lowPrice}</option><option value="prezzo-decrescente">{t.highPrice}</option></select><button>{t.apply}</button></form></div>
        <div className="grid catalogue">{books.map((book:any)=>{const image=coverUrl(book.cover_path),stat=stats.get(book.id),reviews=Number(stat?.review_count??0),rating=Number(stat?.average_rating??0);const profile=Array.isArray(book.profiles)?book.profiles[0]:book.profiles;return <article className="card book-card" key={book.id}>{image?<img className="cover-image" src={image} alt={`${english?'Cover of':'Copertina di'} ${book.title}`}/>:<div className="cover">{english?'Cover coming soon':'Copertina in arrivo'}</div>}<p className="eyebrow">{book.plus_enabled?`${t.plusIncluded} · `:''}{categoryLabel(book.category,locale)||t.book} · BSR #{bsr.get(book.id)}</p><p className="muted">{t.by} {profile?.display_name|| (english?'Author':'Autore')}</p><h2>{book.title}</h2>{book.subtitle&&<p className="subtitle">{book.subtitle}</p>}<p className="rating">{reviews?`★ ${rating.toLocaleString(english?'en-US':'it-IT',{minimumFractionDigits:1,maximumFractionDigits:1})} · ${reviews} ${english?(reviews===1?'review':'reviews'):`recension${reviews===1?'e':'i'}`}`:t.newReview}</p><p className="clamp">{book.description}</p><div className="card-footer"><span className="price">{eur(book.price_cents)}</span><Link className="button" href={local(`/ebook/${book.slug}`)}>{t.discover}</Link></div></article>})}</div>
        {!books.length&&<div className="empty"><h2>{onlyPlus?t.noPlus:t.noBooks}</h2><p>{onlyPlus?t.noPlusCopy:t.noBooksCopy}</p><Link className="button alt" href={local('/catalogo')}>{onlyPlus?t.catalogue:t.showAll}</Link></div>}
      </section>
    </div>
  </main>;
}
