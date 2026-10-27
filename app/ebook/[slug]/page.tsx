import {notFound} from 'next/navigation';
import type {Metadata} from 'next';
import {createClient} from '@/lib/supabase/server';
import {admin} from '@/lib/supabase/admin';
import {eur} from '@/lib/money';
import {coverUrl} from '@/lib/covers';
import {ShareBook} from '../share-book';
import {ReadingExperience} from '@/app/lettore/reading-experience';

const siteUrl='https://liberamente.site';

export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
  const {slug}=await params,s=await createClient();
  const {data:book}=await s.from('books').select('title,subtitle,description,slug,cover_path,profiles!books_author_id_fkey(display_name)').eq('slug',slug).eq('status','published').maybeSingle();
  if(!book)return {title:'Ebook non trovato',robots:{index:false,follow:false}};
  const author=Array.isArray((book as any).profiles)?(book as any).profiles[0]:(book as any).profiles;
  const description=String(book.description).slice(0,155),image=coverUrl(book.cover_path);
  return {title:book.title,description,alternates:{canonical:`/ebook/${book.slug}`},openGraph:{type:'book',url:`${siteUrl}/ebook/${book.slug}`,title:book.title,description,images:image?[{url:image,alt:`Copertina di ${book.title}`}]:undefined},twitter:{card:'summary_large_image',title:book.title,description,images:image?[image]:undefined},other:{'book:author':author?.display_name||'Autore indipendente'}};
}

export default async function BookPage({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params,s=await createClient();
  const {data:book}=await s.from('books').select('*,profiles!books_author_id_fkey(display_name)').eq('slug',slug).eq('status','published').maybeSingle();
  if(!book)return notFound();
  const [{data:reviews},{data:stat},{data:aPlusBlocks},{data:preview}]=await Promise.all([
    s.from('book_reviews').select('id,rating,body,created_at,profiles!book_reviews_buyer_id_fkey(display_name)').eq('book_id',book.id).order('created_at',{ascending:false}),
    s.from('book_discovery_stats').select('review_count,average_rating,sales_count').eq('book_id',book.id).maybeSingle(),
    s.from('book_a_plus_blocks').select('id,image_paths,image_alt,image_titles,sort_order').eq('book_id',book.id).eq('status','approved').order('sort_order').order('created_at'),
    admin().from('book_reading_content').select('preview_enabled,preview_text').eq('book_id',book.id).maybeSingle()
  ]);
  const blocks=aPlusBlocks??[],paths=blocks.flatMap((block:any)=>block.image_paths??[]);
  const {data:signed}=paths.length?await admin().storage.from('a-plus').createSignedUrls(paths,3600):{data:[]};
  const signedUrls=new Map((signed??[]).map((row:any)=>[row.path,row.signedUrl]));
  const image=coverUrl(book.cover_path),reviewRows=reviews??[],rating=Number(stat?.average_rating??0),author=Array.isArray((book as any).profiles)?(book as any).profiles[0]:(book as any).profiles,authorName=author?.display_name||'Autore indipendente';
  const bookSchema={'@context':'https://schema.org','@type':'Book',name:book.title,description:book.description,inLanguage:'it',author:{'@type':'Person',name:authorName},image:image||undefined,url:`${siteUrl}/ebook/${book.slug}`,aggregateRating:reviewRows.length?{'@type':'AggregateRating',ratingValue:rating,reviewCount:reviewRows.length,bestRating:5,worstRating:1}:undefined,offers:{'@type':'Offer',price:(book.price_cents/100).toFixed(2),priceCurrency:'EUR',availability:'https://schema.org/InStock',url:`${siteUrl}/ebook/${book.slug}`,category:'Ebook'}};
  return <main className="wrap"><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(bookSchema)}}/><article className="book-detail">{image?<img className="detail-cover" src={image} alt={`Copertina di ${book.title}`}/>:<div className="detail-cover cover">Copertina</div>}<div><p className="eyebrow">{book.category||'Ebook'} · BSR vendite: {Number(stat?.sales_count??0)}</p><h1>{book.title}</h1>{book.subtitle&&<p className="subtitle">{book.subtitle}</p>}<p className="book-author">Scritto da <strong>{authorName}</strong></p><p className="rating detail-rating">{reviewRows.length?`★ ${rating.toLocaleString('it-IT',{minimumFractionDigits:1,maximumFractionDigits:1})} · ${reviewRows.length} recension${reviewRows.length===1?'e':'i'}`:'Nuovo · nessuna recensione verificata'}</p><p className="description">{book.description}</p><div className="purchase-card"><p className="price">{eur(book.price_cents)}</p><form action="/api/checkout" method="POST"><input type="hidden" name="bookId" value={book.id}/><button>Acquista con carta o PayPal</button></form></div><ShareBook title={book.title}/><p className="muted">Download disponibile nella tua Area lettore dopo il pagamento.</p></div></article>{preview?.preview_enabled&&preview.preview_text&&<section className="reading-preview"><p className="eyebrow">Leggi prima di acquistare</p><h2>Un estratto dal libro</h2><ReadingExperience title={book.title} text={preview.preview_text} mode="preview"/></section>}{blocks.length>0&&<section className="a-plus-public"><p className="eyebrow">Scopri di più</p>{blocks.map((block:any)=><article className="a-plus-block" key={block.id}><div className={`a-plus-images images-${block.image_paths.length}`}>{block.image_paths.map((path:string,index:number)=>{const url=signedUrls.get(path),title=block.image_titles?.[index]||`Immagine ${index+1}`;return url?<figure key={path}><img src={url} alt={`${block.image_alt} — ${title}`}/><figcaption>{title}</figcaption></figure>:null})}</div></article>)}</section>}<section className="reviews-section"><p className="eyebrow">Recensioni verificate</p><h2>Cosa ne pensano i lettori</h2>{reviewRows.length?<div className="review-list">{reviewRows.map((review:any)=>{const profile=Array.isArray(review.profiles)?review.profiles[0]:review.profiles;return <article className="review-card" key={review.id}><strong>{'★'.repeat(review.rating)}{'☆'.repeat(5-review.rating)}</strong><p>{review.body}</p><small className="muted">{profile?.display_name||'Lettore verificato'} · {new Intl.DateTimeFormat('it-IT',{dateStyle:'medium'}).format(new Date(review.created_at))}</small></article>})}</div>:<p className="muted">Le recensioni verranno pubblicate qui solo da lettori che hanno acquistato il libro.</p>}</section></main>;
}
