import Link from 'next/link';
import {redirect} from 'next/navigation';
import {createClient} from '@/lib/supabase/server';
import {admin} from '@/lib/supabase/admin';
import {eur} from '@/lib/money';

const formatDate=new Intl.DateTimeFormat('it-IT',{dateStyle:'medium'});

export default async function AuthorReport(){
  const s=await createClient();
  const {data:{user}}=await s.auth.getUser();
  if(!user)redirect('/accedi');
  const {data:profile}=await s.from('profiles').select('role').eq('id',user.id).single();
  if(!profile||profile.role==='reader')redirect('/autore');
  const [{data:rows},{data:books},{data:allocations}]=await Promise.all([
    s.rpc('author_sales_report'),
    s.from('books').select('id,title,plus_enabled').eq('author_id',user.id).eq('status','published'),
    s.from('plus_author_allocations').select('id,period_start,qualified_reading_credits,author_share_cents,paid_out_at').eq('author_id',user.id).order('period_start',{ascending:false})
  ]);
  const sales=rows??[];
  const active=sales.filter((sale:any)=>!sale.reversed_at);
  const total=active.reduce((sum:number,sale:any)=>sum+sale.author_amount_cents,0);
  const eligible=active.filter((sale:any)=>!sale.paid_out_at&&Date.now()-new Date(sale.created_at).getTime()>=30*86400000).reduce((sum:number,sale:any)=>sum+sale.author_amount_cents,0);
  const bookIds=(books??[]).map((book:any)=>book.id);
  const plusBooks=(books??[]).filter((book:any)=>book.plus_enabled);
  const monthStart=new Date(new Date().getFullYear(),new Date().getMonth(),1).toISOString();
  const {data:events}=bookIds.length?await admin().from('plus_reading_events').select('book_id,seconds_spent').in('book_id',bookIds).gte('occurred_at',monthStart):{data:[]};
  const minutesByBook=new Map<string,number>();
  for(const event of events??[])minutesByBook.set(event.book_id,(minutesByBook.get(event.book_id)||0)+Number(event.seconds_spent||0)/60);
  const plusMinutes=Math.round(Array.from(minutesByBook.values()).reduce((sum,value)=>sum+value,0));
  const plusTotal=(allocations??[]).reduce((sum:number,row:any)=>sum+Number(row.author_share_cents||0),0);
  const plusEligible=(allocations??[]).filter((row:any)=>!row.paid_out_at&&Date.now()-new Date(row.period_start+'T00:00:00').getTime()<=Date.now()-30*86400000).reduce((sum:number,row:any)=>sum+Number(row.author_share_cents||0),0);
  return <main className="wrap author-report-page"><div className="section-head"><div><p className="eyebrow">Area autori · report completo</p><h1>Vendite, Plus e royalty</h1><p>Vendite dirette e andamento LIBERAMENTE Plus in un solo spazio. Le somme sono consolidate per 30 giorni; rimborsi e recessi non generano royalty.</p></div><div className="author-report-actions"><Link className="button alt" href="/autore/plus">Gestisci Plus</Link><Link className="button alt" href="/autore">I miei libri</Link></div></div><section className="author-report-section"><div className="author-report-title"><div><p className="eyebrow">Vendite singole</p><h2>Acquisti diretti</h2></div><span className="report-pill">Royalty 50%</span></div><section className="sales-report"><div><span>Vendite confermate</span><strong>{active.length}</strong></div><div><span>Royalty maturate</span><strong>{eur(total)}</strong></div><div><span>Liquidabili</span><strong>{eur(eligible)}</strong></div><div><span>Rimborsi / recesso</span><strong>{sales.filter((sale:any)=>sale.reversed_at).length}</strong><small>Royalty annullata</small></div></section><section className="card report-table-card"><h3>Dettaglio per vendita</h3>{sales.length?<table><thead><tr><th>Libro</th><th>Data vendita</th><th>Prezzo</th><th>Royalty</th><th>Stato</th></tr></thead><tbody>{sales.map((sale:any)=>{const state=sale.reversed_at?'Rimborsato / recesso':sale.paid_out_at?'Liquidata':Date.now()-new Date(sale.created_at).getTime()>=30*86400000?'Liquidabile':'In attesa 30 giorni';return <tr key={sale.id}><td><strong>{sale.book_title??'Titolo non disponibile'}</strong>{sale.book_slug&&<><br/><small className="muted">{'/'+sale.book_slug}</small></>}</td><td>{formatDate.format(new Date(sale.created_at))}</td><td>{eur(sale.gross_cents)}</td><td>{sale.reversed_at?eur(0):eur(sale.author_amount_cents)}</td><td>{state}</td></tr>})}</tbody></table>:<div className="empty"><h3>Ancora nessuna vendita</h3><p>Quando un lettore acquista uno dei tuoi ebook, il dettaglio apparirà qui.</p></div>}</section></section><section className="author-report-section plus-report-section"><div className="author-report-title"><div><p className="eyebrow">LIBERAMENTE Plus</p><h2>Letture e quote mensili</h2></div><span className="report-pill">Fondo autori 60%</span></div><p className="muted">Le letture qualificate determinano la quota del fondo Plus. Le quote diventano liquidabili dopo 30 giorni dalla chiusura del periodo.</p><section className="sales-report"><div><span>Titoli inclusi</span><strong>{plusBooks.length}</strong></div><div><span>Minuti letti questo mese</span><strong>{plusMinutes}</strong></div><div><span>Quote Plus maturate</span><strong>{eur(plusTotal)}</strong></div><div><span>Quote Plus liquidabili</span><strong>{eur(plusEligible)}</strong></div></section><div className="plus-report-grid"><section className="card report-table-card"><h3>Letture dei tuoi titoli · mese corrente</h3>{plusBooks.length?<div className="plus-reading-summary">{plusBooks.map((book:any)=><div key={book.id}><strong>{book.title}</strong><span>{Math.round(minutesByBook.get(book.id)||0)} min letti</span></div>)}</div>:<p className="empty">Nessun titolo è incluso in LIBERAMENTE Plus.</p>}</section><section className="card report-table-card"><h3>Quote mensili Plus</h3>{allocations?.length?<table><thead><tr><th>Periodo</th><th>Crediti di lettura</th><th>Quota</th><th>Stato</th></tr></thead><tbody>{allocations.map((row:any)=><tr key={row.id}><td>{formatDate.format(new Date(row.period_start+'T00:00:00'))}</td><td>{Number(row.qualified_reading_credits||0).toLocaleString('it-IT')}</td><td>{eur(row.author_share_cents)}</td><td>{row.paid_out_at?'Liquidata':'In consolidamento / da liquidare'}</td></tr>)}</tbody></table>:<p className="empty">Le prime quote Plus appariranno qui al calcolo del fondo mensile.</p>}</section></div></section></main>
}
