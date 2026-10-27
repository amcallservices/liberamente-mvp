import {notFound} from 'next/navigation';
import {createClient} from '@/lib/supabase/server';
import {admin} from '@/lib/supabase/admin';
import {eur} from '@/lib/money';
import {coverUrl} from '@/lib/covers';
import {ShareBook} from '../share-book';
import {ReadingExperience} from '@/app/lettore/reading-experience';

export default async function BookPage({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params,s=await createClient();
  const {data:book}=await s.from('books').select('*,profiles!books_author_id_fkey(display_name)').eq('slug',slug).eq('status','published').maybeSingle();
  if(!book)return notFound();
  const [{data:stat},{data:reviews},{data:preview}]=await Promise.all([
    s.from('book_discovery_stats').select('review_count,average_rating,sales_count').eq('book_id',book.id).maybeSingle(),
    s.from('book_reviews').select('id,rating,body,created_at,profiles!book_reviews_buyer_id_fkey(display_name)').eq('book_id',book.id).order('created_at',{ascending:false}),
    admin().from('book_reading_content').select('preview_enabled,preview_text').eq('book_id',book.id).maybeSingle()
  ]);
  const author=Array.isArray((book as any).profiles)?(book as any).profiles[0]:(book as any).profiles;
  const authorName=author?.display_name||'Autore indipendente',image=coverUrl(book.cover_path),reviewRows=reviews??[],rating=Number(stat?.average_rating??0);
  return <main className="wrap"><article className="book-detail">{image?<img className="detail-cover" src={image} alt={`Copertina di ${book.title}`}/>:<div className="detail-cover cover">Copertina</div>}<div><p className="eyebrow">{book.category||'Ebook'} · BSR vendite: {Number(stat?.sales_count??0)}</p><h1>{book.title}</h1>{book.subtitle&&<p className="subtitle">{book.subtitle}</p>}<p className="book-author">Scritto da <strong>{authorName}</strong></p><p className="rating detail-rating">{reviewRows.length?`★ ${rating.toLocaleString('it-IT',{minimumFractionDigits:1,maximumFractionDigits:1})} · ${reviewRows.length} recension${reviewRows.length===1?'e':'i'}`:'Nuovo · nessuna recensione verificata'}</p><p className="description">{book.description}</p><div className="purchase-card"><p className="price">{eur(book.price_cents)}</p><form action="/api/checkout" method="POST"><input type="hidden" name="bookId" value={book.id}/><button>Acquista con carta o PayPal</button></form></div><ShareBook title={book.title}/><p className="muted">Download disponibile nella tua Area lettore dopo il pagamento.</p></div></article>{preview?.preview_enabled&&preview.preview_text&&<section className="reading-preview"><p className="eyebrow">Leggi prima di acquistare</p><h2>Anteprima autorizzata dall’autore</h2><ReadingExperience title={book.title} text={preview.preview_text} mode="preview"/></section>}<section className="reviews-section"><p className="eyebrow">Recensioni verificate</p><h2>Cosa ne pensano i lettori</h2>{reviewRows.length?<div className="review-list">{reviewRows.map((review:any)=>{const profile=Array.isArray(review.profiles)?review.profiles[0]:review.profiles;return <article className="review-card" key={review.id}><strong>{'★'.repeat(review.rating)}{'☆'.repeat(5-review.rating)}</strong><p>{review.body}</p><small className="muted">{profile?.display_name||'Lettore verificato'} · {new Intl.DateTimeFormat('it-IT',{dateStyle:'medium'}).format(new Date(review.created_at))}</small></article>})}</div>:<p className="muted">Le recensioni verranno pubblicate qui solo da lettori che hanno acquistato il libro.</p>}</section></main>;
}
