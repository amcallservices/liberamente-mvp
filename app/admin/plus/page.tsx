import Link from 'next/link';
import { redirect } from 'next/navigation';
import { setBookPlusEnabledAsAdmin } from '../actions';
import { coverUrl } from '@/lib/covers';
import { admin } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

function subscriptionLabel(status: string) { return ({ active: 'Attivo', trialing: 'In prova', past_due: 'Pagamento da verificare', canceled: 'Annullato', unpaid: 'Non pagato', incomplete: 'Incompleto', inactive: 'Non attivo' } as Record<string, string>)[status] || status; }
const messages: Record<string, string> = { solo_pubblicati: 'Solo un libro già pubblicato può essere incluso in LIBERAMENTE Plus.', salvataggio: 'Non siamo riusciti a salvare la modifica. Riprova tra qualche secondo.' };

export default async function AdminPlusPage({ searchParams }: { searchParams: Promise<{ errore?: string; messaggio?: string }> }) {
  const query = await searchParams;
  const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) redirect('/accedi');
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle(); if (profile?.role !== 'admin') redirect('/');
  const db = admin(); const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
  const [{ data: books }, { data: subscriptions }, { data: pageReads }] = await Promise.all([
    db.from('books').select('id,title,cover_path,plus_enabled,plus_enabled_at,profiles!books_author_id_fkey(display_name,email)').eq('status', 'published').order('updated_at', { ascending: false }),
    db.from('plus_subscriptions').select('id,reader_id,status,current_period_end,cancel_at_period_end').order('updated_at', { ascending: false }),
    db.from('plus_page_reads').select('book_id,reader_id,page_number').gte('confirmed_at', monthStart),
  ]);
  const readerIds = [...new Set((subscriptions ?? []).map((subscription: any) => subscription.reader_id).filter(Boolean))];
  const { data: readers } = readerIds.length ? await db.from('profiles').select('id,email,display_name').in('id', readerIds) : { data: [] as any[] };
  const readersById = new Map((readers ?? []).map((reader: any) => [reader.id, reader]));
  const pagesByBook = new Map<string, number>();
  (pageReads ?? []).forEach((read: any) => pagesByBook.set(read.book_id, (pagesByBook.get(read.book_id) ?? 0) + 1));
  const active = (subscriptions ?? []).filter((item: any) => item.status === 'active' || item.status === 'trialing').length;
  const included = (books ?? []).filter((book: any) => book.plus_enabled).length;
  const verifiedPages = Array.from(pagesByBook.values()).reduce((sum, value) => sum + value, 0);
  return <main className="wrap plus-admin-page">
    <div className="plus-admin-head"><div><p className="eyebrow">Amministrazione · LIBERAMENTE Plus</p><h1>Catalogo e abbonamenti Plus</h1><p className="plus-lead">Decidi quali ebook pubblicati entrano nel programma. Le vendite singole restano sempre attive.</p></div><Link className="button alt" href="/admin">← Pannello editoriale</Link></div>
    {query.messaggio && <p className="notice">{query.messaggio.replaceAll('+', ' ')}</p>}{query.errore && <p className="notice error-notice">{messages[query.errore] || 'Qualcosa non ha funzionato. Riprova.'}</p>}
    <section className="plus-admin-metrics" aria-label="Riepilogo Plus"><article><strong>{active}</strong><span>abbonamenti attivi</span></article><article><strong>{included}</strong><span>titoli inclusi</span></article><article><strong>{verifiedPages}</strong><span>pagine confermate nel mese</span></article></section>
    <section className="plus-admin-section"><div><h2>Libri pubblicati</h2><p>Usa il pulsante per includere o rimuovere un titolo da LIBERAMENTE Plus.</p></div><div className="plus-admin-book-list">{(books ?? []).map((book: any) => { const author = Array.isArray(book.profiles) ? book.profiles[0] : book.profiles; const pages = pagesByBook.get(book.id) ?? 0; return <article className="plus-admin-book" key={book.id}>{book.cover_path ? <img src={coverUrl(book.cover_path) || ''} alt="" /> : <div className="plus-admin-cover" />}<div className="plus-admin-book-copy"><h3>{book.title}</h3><p>{author?.display_name || author?.email || 'Autore non disponibile'}</p><small>{book.plus_enabled ? 'Incluso in Plus' : 'Non incluso'} · {pages} pagine confermate questo mese</small></div><form action={setBookPlusEnabledAsAdmin.bind(null, book.id, !book.plus_enabled)}><button className={book.plus_enabled ? 'button alt' : 'button'}>{book.plus_enabled ? 'Rimuovi da Plus' : 'Includi in Plus'}</button></form></article>; })}</div>{!books?.length && <p className="empty">Non ci sono ancora libri pubblicati.</p>}</section>
    <section className="plus-admin-section"><h2>Abbonamenti e lettori iscritti</h2><p>Qui trovi anche l’email dell’utente, così puoi verificare immediatamente chi ha un abbonamento attivo.</p><div className="plus-subscription-list">{(subscriptions ?? []).map((subscription: any) => { const reader = readersById.get(subscription.reader_id) as { email?: string; display_name?: string } | undefined; return <div key={subscription.id}><div className="subscription-reader"><strong>{subscriptionLabel(subscription.status)}</strong><span className="subscription-email">{reader?.email || 'Email non disponibile'}</span>{reader?.display_name && <small>{reader.display_name}</small>}</div><span>{subscription.current_period_end ? `Rinnovo/fine periodo: ${new Date(subscription.current_period_end).toLocaleDateString('it-IT')}` : 'Periodo non ancora disponibile'}{subscription.cancel_at_period_end ? ' · annullamento previsto' : ''}</span></div>; })}</div>{!subscriptions?.length && <p className="empty">Nessun abbonamento Plus registrato.</p>}</section>
  </main>;
}
