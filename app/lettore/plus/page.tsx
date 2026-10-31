import Link from 'next/link';
import {redirect} from 'next/navigation';
import {createClient} from '@/lib/supabase/server';
import {admin} from '@/lib/supabase/admin';
import {isPlusActive} from '@/lib/plus';
import {ReadingExperience} from '../reading-experience';

export default async function PlusLibrary(){
  const s=await createClient();
  const {data:{user}}=await s.auth.getUser();
  if(!user)redirect('/accedi');
  const {data:subscription}=await s.from('plus_subscriptions').select('status,current_period_end').eq('reader_id',user.id).maybeSingle();
  if(!isPlusActive(subscription?.status))return <main className="wrap plus-library"><p className="eyebrow">Area lettori</p><h1>LIBERAMENTE Plus</h1><p>Per leggere i titoli inclusi serve un abbonamento Plus attivo.</p><Link className="button" href="/plus">Scopri LIBERAMENTE Plus</Link></main>;
  const db=admin();
  const {data:books}=await db.from('books').select('id,title,subtitle,cover_path').eq('status','published').eq('plus_enabled',true).order('updated_at',{ascending:false});
  const ids=(books??[]).map((book:any)=>book.id);
  const {data:contents}=ids.length?await db.from('book_reading_content').select('book_id,full_text').in('book_id',ids):{data:[]};
  const contentByBook=new Map((contents??[]).map((content:any)=>[content.book_id,content.full_text]));
  return <main className="wrap plus-library"><p className="eyebrow">La tua libreria Plus</p><h1>Leggi i titoli inclusi</h1><p className="muted">Abbonamento attivo. La prossima scadenza è {subscription?.current_period_end?new Intl.DateTimeFormat('it-IT',{dateStyle:'long'}).format(new Date(subscription.current_period_end)):'in aggiornamento'}.</p><div className="plus-reading-list">{(books??[]).map((book:any)=>{const text=contentByBook.get(book.id);return <article className="plus-reading-book" key={book.id}><h2>{book.title}</h2>{book.subtitle&&<p>{book.subtitle}</p>}{text?<ReadingExperience title={book.title} text={text} mode="full"/>:<p className="muted">Il testo di lettura sarà disponibile a breve.</p>}</article>})}</div>{!books?.length&&<p className="empty">Stiamo preparando i primi titoli Plus.</p>}</main>;
}
