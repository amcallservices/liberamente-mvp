import {notFound} from 'next/navigation';
import Link from 'next/link';
import type {Metadata} from 'next';
import {admin} from '@/lib/supabase/admin';
import {eur} from '@/lib/money';
import {coverUrl} from '@/lib/covers';
import {ShareBook} from '../share-book';
import {ReadingExperience} from '@/app/lettore/reading-experience';
import {getPdfPageCount} from '@/lib/reading-extraction';
import {marketplaceLocale,marketplacePath} from '@/lib/marketplace';

const siteUrl='https://liberamente.site';

export async function generateMetadata({params,searchParams}:{params:Promise<{slug:string}>;searchParams:Promise<{market?:string}>}):Promise<Metadata>{
  const {slug}=await params,query=await searchParams,locale=marketplaceLocale(query.market),prefix=marketplacePath(locale,'/'),s=admin();
  const {data:book}=await s.from('books').select('title,subtitle,description,slug,cover_path,category,profiles!books_author_id_fkey(display_name)').eq('slug',slug).eq('status','published').eq('marketplace_locale',locale).maybeSingle();
  if(!book)return {title:locale==='en'?'Ebook not found':'Ebook non trovato',robots:{index:false,follow:false}};
  const author=Array.isArray((book as any).profiles)?(book as any).profiles[0]:(book as any).profiles;
  const description=String(book.description).replace(/\s+/g,' ').trim().slice(0,155),image=coverUrl(book.cover_path),authorName=author?.display_name||'Autore indipendente';
  const path=`${prefix === '/' ? '' : prefix}/ebook/${book.slug}`;
  return {title:book.title,description,keywords:[book.title,authorName,book.category||'ebook',locale==='en'?'independent ebooks':'ebook indipendenti'],alternates:{canonical:path},openGraph:{type:'book',url:`${siteUrl}${path}`,title:book.title,description,images:image?[{url:image,alt:`Copertina di ${book.title}`}]:undefined},twitter:{card:'summary_large_image',title:book.title,description,images:image?[image]:undefined},other:{'book:author':authorName}};
}

export default async function BookPage({params,searchParams}:{params:Promise<{slug:string}>;searchParams:Promise<{market?:string}>}){
  // La scheda prodotto deve mostrare sempre l'autore, anche ai visitatori:
  // tutte le query qui sotto selezionano solo dati destinati alla pagina pubblica.
  const {slug}=await params,query=await searchParams,locale=marketplaceLocale(query.market),local=(path:string)=>marketplacePath(locale,path),s=admin();
  const english=locale==='en';
  const {data:book}=await s.from('books').select('*,profiles!books_author_id_fkey(display_name)').eq('slug',slug).eq('status','published').eq('marketplace_locale',locale).maybeSingle();
  if(!book)return notFound();
  // Recupero trasparente per i titoli pubblicati prima dell'introduzione del campo.
  let pageCount=Number((book as any).page_count)||null;
  if(!pageCount&&book.file_path&&book.file_mime_type==='application/pdf'){
    const service=admin();
    const {data:file}=await service.storage.from('ebooks').download(book.file_path);
    if(file){
      pageCount=await getPdfPageCount(Buffer.from(await file.arrayBuffer()));
      if(pageCount)await service.from('books').update({page_count:pageCount}).eq('id',book.id).is('page_count',null);
    }
  }
  // I contenuti A+ approvati vengono letti dal server con il client di servizio:
  // la pagina resta pubblica anche se le policy del browser vengono aggiornate.
  const [{data:reviews},{data:stat},{data:aPlusBlocks},{data:preview},{data:relatedRows}]=await Promise.all([
    s.from('book_reviews').select('id,rating,body,created_at,profiles!book_reviews_buyer_id_fkey(display_name)').eq('book_id',book.id).order('created_at',{ascending:false}),
    s.from('book_discovery_stats').select('review_count,average_rating,sales_count').eq('book_id',book.id).maybeSingle(),
    admin().from('book_a_plus_blocks').select('id,image_paths,image_alt,image_titles,sort_order').eq('book_id',book.id).eq('status','approved').order('sort_order').order('created_at'),
    admin().from('book_reading_content').select('preview_enabled,preview_text').eq('book_id',book.id).maybeSingle(),
    admin().from('books').select('id,title,slug,cover_path,category,profiles!books_author_id_fkey(display_name)').eq('status','published').eq('marketplace_locale',locale).neq('id',book.id).limit(18)
  ]);
  const blocks=aPlusBlocks??[],paths=blocks.flatMap((block:any)=>block.image_paths??[]);
  const {data:signed}=paths.length?await admin().storage.from('a-plus').createSignedUrls(paths,3600):{data:[]};
  const signedUrls=new Map((signed??[]).map((row:any)=>[row.path,row.signedUrl]));
  const image=coverUrl(book.cover_path),reviewRows=reviews??[],rating=Number(stat?.average_rating??0),author=Array.isArray((book as any).profiles)?(book as any).profiles[0]:(book as any).profiles,authorName=author?.display_name||'Autore indipendente';
  const categories=Array.from(new Set([book.category,...(Array.isArray((book as any).categories)?(book as any).categories:[])].filter(Boolean))) as string[];
  const related=(relatedRows??[]).filter((candidate:any)=>categories.some(category=>candidate.category===category||(Array.isArray(candidate.categories)&&candidate.categories.includes(category)))).slice(0,3);
  const bookPath=local(`/ebook/${book.slug}`);
  const bookSchema={'@context':'https://schema.org','@type':'Book',name:book.title,description:book.description,inLanguage:english?'en':'it-IT',bookFormat:'EBook',isAccessibleForFree:false,author:{'@type':'Person',name:authorName},numberOfPages:pageCount||undefined,image:image||undefined,url:`${siteUrl}${bookPath}`,aggregateRating:reviewRows.length?{'@type':'AggregateRating',ratingValue:rating,reviewCount:reviewRows.length,bestRating:5,worstRating:1}:undefined,offers:{'@type':'Offer',price:(book.price_cents/100).toFixed(2),priceCurrency:'EUR',availability:'https://schema.org/InStock',url:`${siteUrl}${bookPath}`,category:book.category||'Ebook'}};
  return <main className="wrap book-page"><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(bookSchema)}}/><article className="book-detail book-product-hero"><div className="book-cover-column">{image?<img className="detail-cover" src={image} alt={`${english?'Cover':'Copertina'} di ${book.title}`}/>:<div className="detail-cover cover">{english?'Cover':'Copertina'}</div>}{book.plus_enabled&&<p className="plus-book-badge">{english?'Included in LIBERAMENTE Plus':'Incluso in LIBERAMENTE Plus'}</p>}</div><div className="book-product-copy"><p className="eyebrow">{categories.join(' · ')||'Ebook'}</p><h1>{book.title}</h1>{book.subtitle&&<p className="subtitle">{book.subtitle}</p>}<p className="book-author">{english?'Written by':'Scritto da'} <strong>{authorName}</strong></p><div className="book-at-a-glance">{pageCount&&<span><strong>{pageCount}</strong> {english?'pages':'pagine'}</span>}<span><strong>{Number(stat?.sales_count??0)}</strong> {english?'readers':'lettori'}</span><span>{reviewRows.length?`★ ${rating.toLocaleString(english?'en-US':'it-IT',{minimumFractionDigits:1,maximumFractionDigits:1})} · ${reviewRows.length} ${english?'review':'recension'}${english&&reviewRows.length!==1?'s':!english&&reviewRows.length===1?'e':'i'}`:english?'New to the catalogue':'Nuovo nel catalogo'}</span></div><p className="description">{book.description}</p><div className="purchase-panel"><div><span>{english?'PDF format · permanent access':'Formato PDF · accesso permanente'}</span><p className="price">{eur(book.price_cents)}</p></div><form action="/api/checkout" method="POST"><input type="hidden" name="bookId" value={book.id}/><button>{english?'Buy with card or PayPal':'Acquista con carta o PayPal'}</button></form></div><ShareBook title={book.title}/><p className="muted">{english?'Your download will be available in your Reader area after payment.':'Download disponibile nella tua Area lettore dopo il pagamento.'}</p></div></article>{preview?.preview_enabled&&preview.preview_text&&<section className="reading-preview"><p className="eyebrow">{english?'Read before buying':'Leggi prima di acquistare'}</p><h2>{english?'An excerpt from the book':'Un estratto dal libro'}</h2><ReadingExperience title={book.title} text={preview.preview_text} mode="preview"/></section>}{blocks.length>0&&<section className="a-plus-public"><p className="eyebrow">{english?'Discover more':'Scopri di più'}</p>{blocks.map((block:any)=><article className="a-plus-block" key={block.id}><div className={`a-plus-images images-${block.image_paths.length}`}>{block.image_paths.map((path:string,index:number)=>{const url=signedUrls.get(path),title=block.image_titles?.[index]||`${english?'Image':'Immagine'} ${index+1}`;return url?<figure key={path}><img src={url} alt={`${block.image_alt} — ${title}`}/><figcaption>{title}</figcaption></figure>:null})}</div></article>)}</section>}<section className="reviews-section"><p className="eyebrow">{english?'Verified reviews':'Recensioni verificate'}</p><h2>{english?'What readers think':'Cosa ne pensano i lettori'}</h2>{reviewRows.length?<div className="review-list">{reviewRows.map((review:any)=>{const profile=Array.isArray(review.profiles)?review.profiles[0]:review.profiles;return <article className="review-card" key={review.id}><strong>{'★'.repeat(review.rating)}{'☆'.repeat(5-review.rating)}</strong><p>{review.body}</p><small className="muted">{profile?.display_name||(english?'Verified reader':'Lettore verificato')} · {new Intl.DateTimeFormat(english?'en-GB':'it-IT',{dateStyle:'medium'}).format(new Date(review.created_at))}</small></article>})}</div>:<p className="muted">{english?'Reviews are published only by readers who have purchased the book.':'Le recensioni verranno pubblicate qui solo da lettori che hanno acquistato il libro.'}</p>}</section>{related.length>0&&<section className="related-titles"><div className="section-head"><div><p className="eyebrow">{english?'You may also like':'Potrebbe piacerti anche'}</p><h2>{english?'More stories to discover':'Altre storie da scoprire'}</h2></div><Link className="button alt" href={local('/catalogo')}>{english?'View catalogue':'Vai al catalogo'}</Link></div><div>{related.map((candidate:any)=>{const candidateProfile=Array.isArray(candidate.profiles)?candidate.profiles[0]:candidate.profiles;const candidateImage=coverUrl(candidate.cover_path);return <Link className="related-title" href={local(`/ebook/${candidate.slug}`)} key={candidate.id}>{candidateImage?<img src={candidateImage} alt={`${english?'Cover':'Copertina'} di ${candidate.title}`}/>:<span className="cover">{english?'Cover':'Copertina'}</span>}<span><strong>{candidate.title}</strong><small>{english?'by':'di'} {candidateProfile?.display_name||(english?'Independent author':'Autore indipendente')}</small></span></Link>})}</div></section>}</main>;
}
