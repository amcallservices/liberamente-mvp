import Link from 'next/link';
import {redirect} from 'next/navigation';
import {createClient} from '@/lib/supabase/server';
import {eur} from '@/lib/money';

export default async function AuthorReport(){
  const s=await createClient();
  const {data:{user}}=await s.auth.getUser();
  if(!user)redirect('/accedi');
  const {data:profile}=await s.from('profiles').select('role').eq('id',user.id).single();
  if(!profile||profile.role==='reader')redirect('/autore');
  const {data:rows}=await s.rpc('author_sales_report');
  const sales=rows??[];
  const active=sales.filter((sale:any)=>!sale.reversed_at);
  const total=active.reduce((sum:number,sale:any)=>sum+sale.author_amount_cents,0);
  const eligible=active.filter((sale:any)=>!sale.paid_out_at&&Date.now()-new Date(sale.created_at).getTime()>=30*86400000).reduce((sum:number,sale:any)=>sum+sale.author_amount_cents,0);
  return <main className="wrap"><div className="section-head"><div><p className="eyebrow">Area autori · report</p><h1>Vendite e royalty</h1><p>Ogni royalty è pari al 50% del prezzo di vendita ed è liquidabile dopo 30 giorni, salvo rimborsi o recesso.</p></div><Link className="button alt" href="/autore">Torna ai miei libri</Link></div><section className="sales-report"><div><span>Vendite confermate</span><strong>{active.length}</strong></div><div><span>Royalty maturate</span><strong>{eur(total)}</strong></div><div><span>Liquidabili</span><strong>{eur(eligible)}</strong></div><div><span>Rimborsi / recesso</span><strong>{sales.filter((sale:any)=>sale.reversed_at).length}</strong><small>Royalty annullata</small></div></section><section className="card"><h2>Dettaglio per vendita</h2>{sales.length?<table><thead><tr><th>Libro</th><th>Data vendita</th><th>Prezzo</th><th>Royalty</th><th>Stato</th></tr></thead><tbody>{sales.map((sale:any)=>{const state=sale.reversed_at?'Rimborsato / recesso':sale.paid_out_at?'Liquidata':Date.now()-new Date(sale.created_at).getTime()>=30*86400000?'Liquidabile':'In attesa 30 giorni';return <tr key={sale.id}><td><strong>{sale.book_title??'Titolo non disponibile'}</strong>{sale.book_slug&&<><br/><small className="muted">/{sale.book_slug}</small></>}</td><td>{new Intl.DateTimeFormat('it-IT',{dateStyle:'medium'}).format(new Date(sale.created_at))}</td><td>{eur(sale.gross_cents)}</td><td>{sale.reversed_at?eur(0):eur(sale.author_amount_cents)}</td><td>{state}</td></tr>})}</tbody></table>:<div className="empty"><h3>Ancora nessuna vendita</h3><p>Quando un lettore acquista uno dei tuoi ebook, il dettaglio apparirà qui.</p></div>}</section></main>
}
