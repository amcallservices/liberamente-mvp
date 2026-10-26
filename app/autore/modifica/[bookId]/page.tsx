import Link from 'next/link';
import {notFound,redirect} from 'next/navigation';
import {createClient} from '@/lib/supabase/server';
import {BookAssets} from '@/app/autore/book-assets';
import {CategoryPicker} from '@/app/autore/category-picker';
import {RoyaltyPreview} from '@/app/autore/royalty-preview';
import {updateBook} from '@/app/autore/actions';
import {APlusEditor} from '@/app/autore/a-plus-editor';

type Props={params:Promise<{bookId:string}>,searchParams:Promise<{errore?:string}>};
export default async function EditBook({params,searchParams}:Props){
  const {bookId}=await params,{errore}=await searchParams,s=await createClient(),{data:{user}}=await s.auth.getUser();
  if(!user)redirect('/accedi');
  const {data:book}=await s.from('books').select('id,title,subtitle,description,category,categories,price_cents,file_path,cover_path,status,rights_confirmed').eq('id',bookId).eq('author_id',user.id).maybeSingle();
  if(!book)notFound();
  if(!['draft','rejected','blocked','published'].includes(book.status))redirect('/autore?errore=modifica');
  const [{data:reviewNotes},{data:aPlusBlocks}]=await Promise.all([s.from('book_review_notes').select('id,actor,message,created_at').eq('book_id',book.id).order('created_at',{ascending:false}),s.from('book_a_plus_blocks').select('id,heading,status,moderation_note,created_at').eq('book_id',book.id).order('created_at',{ascending:false})]);
  const categories:string[]=book.categories?.length?book.categories:[book.category].filter((value):value is string=>Boolean(value));
  return <main className="wrap author"><p className="eyebrow">Area autori · modifica</p><div className="section-head"><div><h1>Modifica “{book.title}”</h1><p>Puoi aggiornare scheda e materiali. Quando salvi, il libro torna automaticamente in revisione.</p></div><Link className="button alt" href="/autore">Torna ai miei libri</Link></div>{errore&&<p className="notice">Completa tutti i campi obbligatori prima di inviare le modifiche.</p>}{Boolean(reviewNotes?.length)&&<section className="card revision-history"><h2>Storico revisioni</h2>{reviewNotes?.map((note:any)=><article key={note.id}><strong>{note.actor==='admin'?'Amministrazione':'Tu'}</strong><p>{note.message}</p><small className="muted">{new Intl.DateTimeFormat('it-IT',{dateStyle:'medium',timeStyle:'short'}).format(new Date(note.created_at))}</small></article>)}</section>}<div className="edit-grid"><form action={updateBook} className="card"><input type="hidden" name="bookId" value={book.id}/><h2>Dettagli del libro</h2><label>Titolo</label><input name="title" required maxLength={180} defaultValue={book.title}/><label>Sottotitolo <span className="muted">(facoltativo)</span></label><input name="subtitle" maxLength={220} defaultValue={book.subtitle??''}/><CategoryPicker initialValues={categories}/><label>Descrizione del libro</label><textarea name="description" required minLength={80} maxLength={4000} defaultValue={book.description}/><RoyaltyPreview initialPrice={(book.price_cents/100).toFixed(2)}/><label>Nota per la revisione <span className="muted">(facoltativa)</span></label><textarea name="authorNote" maxLength={1000} placeholder="Indica cosa hai corretto o eventuali informazioni per l’amministrazione."/><label className="check"><input name="rights" type="checkbox" required defaultChecked={book.rights_confirmed}/> Confermo di possedere i diritti per pubblicare e vendere questo ebook.</label><button>Salva e invia alla revisione</button></form><section className="card"><h2>Materiali editoriali</h2><p className="muted">Sostituisci qui, se necessario, manoscritto e copertina prima di inviare nuovamente il libro alla revisione.</p><BookAssets bookId={book.id} hasManuscript={Boolean(book.file_path)} hasCover={Boolean(book.cover_path)} status={book.status}/></section></div><APlusEditor bookId={book.id} blocks={aPlusBlocks??[]}/></main>;
}
