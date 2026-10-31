import Link from 'next/link';
import {redirect} from 'next/navigation';
import {createClient} from '@/lib/supabase/server';
import {setBookPlusEnabled} from '../actions';

export default async function AuthorPlusPage({searchParams}:{searchParams:Promise<{messaggio?:string;errore?:string}>}){
  const query=await searchParams;
  const s=await createClient();
  const {data:{user}}=await s.auth.getUser();
  if(!user)redirect('/accedi');
  const [{data:profile},{data:books}]=await Promise.all([
    s.from('profiles').select('role').eq('id',user.id).maybeSingle(),
    s.from('books').select('id,title,cover_path,plus_enabled').eq('author_id',user.id).eq('status','published').order('updated_at',{ascending:false})
  ]);
  if(profile?.role==='reader')redirect('/autore');
  return <main className="wrap plus-author-page">
    <p className="eyebrow">LIBERAMENTE Plus · area autori</p>
    <h1>I tuoi titoli nel programma Plus</h1>
    <p className="plus-lead">L’adesione è facoltativa: i libri restano in vendita singolarmente. Le letture qualificate concorrono al fondo autori mensile, pari al 60% del fondo distribuibile.</p>
    <p className="notice">Le somme Plus sono consolidate per 30 giorni; il report mensile indica letture, quota maturata e stato del pagamento.</p>
    {query.messaggio&&<p className="notice">{query.messaggio}</p>}
    {query.errore&&<p className="notice">Non è stato possibile aggiornare il titolo. Riprova tra qualche istante.</p>}
    <div className="plus-book-list">{(books??[]).map((book:any)=><article className="plus-book-row" key={book.id}><div><h2>{book.title}</h2><p>{book.plus_enabled?'Questo titolo è incluso in LIBERAMENTE Plus.':'Questo titolo non è incluso nel programma.'}</p></div><form action={setBookPlusEnabled}><input type="hidden" name="bookId" value={book.id}/><input type="hidden" name="enabled" value={String(!book.plus_enabled)}/><button className={book.plus_enabled?'button alt':'button'}>{book.plus_enabled?'Rimuovi dal programma':'Includi in Plus'}</button></form></article>)}</div>
    {!books?.length&&<section className="empty"><h2>Nessun libro pubblicato</h2><p>Potrai aderire a LIBERAMENTE Plus appena un tuo ebook sarà pubblicato.</p><Link className="button" href="/autore">Vai ai tuoi libri</Link></section>}
    <p><Link href="/autore">← Torna all’area autori</Link></p>
  </main>;
}
