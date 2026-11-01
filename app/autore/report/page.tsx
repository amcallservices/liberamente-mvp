import Link from 'next/link';
import { redirect } from 'next/navigation';
import { admin } from '@/lib/supabase/admin';
import { eur } from '@/lib/money';
import { createClient } from '@/lib/supabase/server';

const formatDate = new Intl.DateTimeFormat('it-IT', { dateStyle: 'medium' });

export default async function AuthorReport() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/accedi');
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (!profile || profile.role === 'reader') redirect('/autore');

  const [{ data: rows }, { data: books }, { data: allocations }] = await Promise.all([
    supabase.rpc('author_sales_report'),
    supabase.from('books').select('id,title,plus_enabled').eq('author_id', user.id).eq('status', 'published'),
    supabase.from('plus_author_allocations').select('id,period_start,qualified_reading_credits,author_share_cents,paid_out_at').eq('author_id', user.id).order('period_start', { ascending: false }),
  ]);
  const sales = rows ?? [];
  const active = sales.filter((sale: any) => !sale.reversed_at);
  const total = active.reduce((sum: number, sale: any) => sum + sale.author_amount_cents, 0);
  const eligible = active.filter((sale: any) => !sale.paid_out_at && Date.now() - new Date(sale.created_at).getTime() >= 30 * 86400000).reduce((sum: number, sale: any) => sum + sale.author_amount_cents, 0);
  const bookIds = (books ?? []).map((book: any) => book.id);
  const plusBooks = (books ?? []).filter((book: any) => book.plus_enabled);
  const currentPlusPeriod = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1)).toISOString().slice(0, 10);
  const { data: pageReads } = bookIds.length ? await admin().from('plus_page_qualifications').select('book_id,reader_id,page_number').in('book_id', bookIds).eq('qualified_month', currentPlusPeriod) : { data: [] as any[] };
  const pagesByBook = new Map<string, number>();
  const readersByBook = new Map<string, Set<string>>();
  (pageReads ?? []).forEach((read: any) => { pagesByBook.set(read.book_id, (pagesByBook.get(read.book_id) ?? 0) + 1); const readers = readersByBook.get(read.book_id) ?? new Set<string>(); readers.add(read.reader_id); readersByBook.set(read.book_id, readers); });
  const confirmedPages = Array.from(pagesByBook.values()).reduce((sum, value) => sum + value, 0);
  const plusTotal = (allocations ?? []).reduce((sum: number, row: any) => sum + Number(row.author_share_cents || 0), 0);
  const plusEligible = (allocations ?? []).filter((row: any) => !row.paid_out_at && Date.now() - new Date(row.period_start + 'T00:00:00').getTime() >= 30 * 86400000).reduce((sum: number, row: any) => sum + Number(row.author_share_cents || 0), 0);

  return <main className="wrap author-report-page">
    <div className="section-head"><div><p className="eyebrow">Area autori · report completo</p><h1>Vendite, Plus e royalty</h1><p>Vendite dirette e andamento LIBERAMENTE Plus in un solo spazio. Le somme sono consolidate per 30 giorni; rimborsi e recessi non generano royalty.</p></div><div className="author-report-actions"><Link className="button alt" href="/autore/plus">Gestisci Plus</Link><Link className="button alt" href="/autore">I miei libri</Link></div></div>
    <section className="author-report-section"><div className="author-report-title"><div><p className="eyebrow">Vendite singole</p><h2>Acquisti diretti</h2></div><span className="report-pill">Royalty 50%</span></div><section className="sales-report"><div><span>Vendite confermate</span><strong>{active.length}</strong></div><div><span>Royalty maturate</span><strong>{eur(total)}</strong></div><div><span>Liquidabili</span><strong>{eur(eligible)}</strong></div><div><span>Rimborsi / recesso</span><strong>{sales.filter((sale: any) => sale.reversed_at).length}</strong><small>Royalty annullata</small></div></section>
      <section className="card report-table-card"><h3>Dettaglio per vendita</h3>{sales.length ? <table><thead><tr><th>Libro</th><th>Data vendita</th><th>Prezzo</th><th>Royalty</th><th>Stato</th></tr></thead><tbody>{sales.map((sale: any) => { const state = sale.reversed_at ? 'Rimborsato / recesso' : sale.paid_out_at ? 'Liquidata' : Date.now() - new Date(sale.created_at).getTime() >= 30 * 86400000 ? 'Liquidabile' : 'In attesa 30 giorni'; return <tr key={sale.id}><td><strong>{sale.book_title ?? 'Titolo non disponibile'}</strong>{sale.book_slug && <><br /><small className="muted">/{sale.book_slug}</small></>}</td><td>{formatDate.format(new Date(sale.created_at))}</td><td>{eur(sale.gross_cents)}</td><td>{sale.reversed_at ? eur(0) : eur(sale.author_amount_cents)}</td><td>{state}</td></tr>; })}</tbody></table> : <div className="empty"><h3>Ancora nessuna vendita</h3><p>Quando un lettore acquista uno dei tuoi ebook, il dettaglio apparirà qui.</p></div>}</section>
    </section>
    <section className="author-report-section plus-report-section"><div className="author-report-title"><div><p className="eyebrow">LIBERAMENTE Plus</p><h2>Letture e quote mensili</h2></div><span className="report-pill">Fondo autori 60%</span></div><p className="muted">Ogni pagina viene registrata soltanto dopo la conferma del lettore, una sola volta per lettore e titolo. Il credito resta associato al mese della prima conferma e alimenta la ripartizione del fondo Plus.</p><section className="sales-report"><div><span>Titoli inclusi</span><strong>{plusBooks.length}</strong></div><div><span>Pagine confermate questo mese</span><strong>{confirmedPages}</strong></div><div><span>Quote Plus maturate</span><strong>{eur(plusTotal)}</strong></div><div><span>Quote Plus liquidabili</span><strong>{eur(plusEligible)}</strong></div></section><p className="muted">Le letture si aggiornano subito dopo la conferma della pagina. Le quote in euro vengono registrate alla chiusura del fondo mensile.</p>
      <div className="plus-report-grid"><section className="card report-table-card"><h3>Letture verificate dei tuoi titoli · mese corrente</h3>{plusBooks.length ? <div className="plus-reading-summary">{plusBooks.map((book: any) => <div key={book.id}><strong>{book.title}</strong><span>{pagesByBook.get(book.id) ?? 0} pagine confermate · {readersByBook.get(book.id)?.size ?? 0} lettori</span></div>)}</div> : <p className="empty">Nessun titolo è incluso in LIBERAMENTE Plus.</p>}</section><section className="card report-table-card"><h3>Quote mensili Plus</h3>{allocations?.length ? <table><thead><tr><th>Periodo</th><th>Crediti di lettura</th><th>Quota</th><th>Stato</th></tr></thead><tbody>{allocations.map((row: any) => <tr key={row.id}><td>{formatDate.format(new Date(row.period_start + 'T00:00:00'))}</td><td>{Number(row.qualified_reading_credits || 0).toLocaleString('it-IT')}</td><td>{eur(row.author_share_cents)}</td><td>{row.paid_out_at ? 'Liquidata' : 'In consolidamento / da liquidare'}</td></tr>)}</tbody></table> : <p className="empty">Le prime quote Plus appariranno qui al calcolo del fondo mensile.</p>}</section></div>
    </section>
  </main>;
}
