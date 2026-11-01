import Link from 'next/link';
import {redirect} from 'next/navigation';
import {createClient} from '@/lib/supabase/server';
import {admin} from '@/lib/supabase/admin';
import {deleteBookReview,moderateBookReview} from '../actions';

function first(value:any){return Array.isArray(value)?value[0]:value}

export default async function AdminReviews({searchParams}:{searchParams:Promise<{messaggio?:string;errore?:string}>}){
 const params=await searchParams,s=await createClient(),{data:{user}}=await s.auth.getUser();
 if(!user)redirect('/accedi');
 const {data:profile}=await s.from('profiles').select('role').eq('id',user.id).maybeSingle();
 if(profile?.role!=='admin')redirect('/');
 const {data}=await admin().from('book_reviews').select('id,rating,body,created_at,moderation_status,moderation_note,books!book_reviews_book_id_fkey(title,slug),profiles!book_reviews_buyer_id_fkey(display_name,email)').order('created_at',{ascending:false});
 const reviews=(data??[]) as any[];
 return <main className="wrap review-admin-page"><div className="section-head"><div><p className="eyebrow">Amministrazione</p><h1>Gestione recensioni</h1><p>Modifica, pubblica, nascondi o elimina definitivamente le recensioni dei lettori.</p></div><Link className="button alt" href="/admin">Torna al pannello</Link></div>{params.messaggio&&<p className="notice">{params.messaggio==='salvata'?'Recensione aggiornata.':'Recensione eliminata definitivamente.'}</p>}{params.errore&&<p className="notice">Controlla valutazione e testo della recensione.</p>}<section className="review-admin-list">{reviews.length?reviews.map(review=>{const book=first(review.books),reader=first(review.profiles);return <article className="review-admin-card" key={review.id}><div><p className="eyebrow">{book?.title||'Libro non disponibile'}</p><h2>{'★'.repeat(review.rating)}{'☆'.repeat(5-review.rating)}</h2><p className="muted">Recensione di {reader?.display_name||reader?.email||'Lettore'} · {new Date(review.created_at).toLocaleDateString('it-IT')}</p><form action={moderateBookReview.bind(null,review.id)}><label>Valutazione<select name="rating" defaultValue={String(review.rating)}>{[5,4,3,2,1].map(value=><option key={value} value={value}>{value} stelle</option>)}</select></label><label>Testo recensione<textarea name="body" defaultValue={review.body} minLength={20} maxLength={2000} required/></label><label>Nota amministratore<textarea name="note" defaultValue={review.moderation_note||''} maxLength={500} placeholder="Nota interna o motivazione per il lettore"/></label><div className="review-admin-actions"><button name="status" value="approved">Pubblica / salva</button><button className="button alt" name="status" value="hidden">Nascondi</button></div></form><form className="review-admin-delete" action={deleteBookReview.bind(null,review.id)}><button className="button danger">Elimina definitivamente</button></form></div><aside className="review-admin-meta"><p><b>Stato:</b> {review.moderation_status==='approved'?'Pubblicata':review.moderation_status==='hidden'?'Nascosta':'In revisione'}</p><p><b>Lettore:</b><br/>{reader?.email||'—'}</p>{book?.slug&&<Link href={`/ebook/${book.slug}`}>Apri pagina libro</Link>}</aside></article>}):<p className="notice">Non ci sono recensioni da gestire.</p>}</section></main>;
}
