import Link from 'next/link';
import { redirect } from 'next/navigation';
import { admin } from '@/lib/supabase/admin';
import { coverUrl } from '@/lib/covers';
import { isPlusActive } from '@/lib/plus';
import { createClient } from '@/lib/supabase/server';
import { ReadingExperience } from '../reading-experience';
import { PdfPageReader } from './pdf-page-reader';

export default async function PlusLibrary() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/accedi');
  const { data: subscription } = await supabase.from('plus_subscriptions').select('id,status,current_period_end').eq('reader_id', user.id).maybeSingle();
  if (!isPlusActive(subscription?.status)) return <main className="wrap plus-library"><p className="eyebrow">Area lettori</p><h1>LIBERAMENTE Plus</h1><p>Per leggere i titoli inclusi serve un abbonamento Plus attivo.</p><Link className="button" href="/plus">Scopri LIBERAMENTE Plus</Link></main>;

  const db = admin();
  const { data: books } = await db.from('books').select('id,title,subtitle,slug,cover_path,file_path,file_mime_type,page_count').eq('status', 'published').eq('plus_enabled', true).order('updated_at', { ascending: false });
  const bookIds = (books ?? []).map((book: any) => book.id);
  const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
  const [{ data: contents }, { data: reads }] = await Promise.all([
    bookIds.length ? db.from('book_reading_content').select('book_id,full_text').in('book_id', bookIds) : Promise.resolve({ data: [] as any[] }),
    bookIds.length ? db.from('plus_page_reads').select('book_id,page_number').eq('reader_id', user.id).in('book_id', bookIds).gte('confirmed_at', monthStart.toISOString()) : Promise.resolve({ data: [] as any[] }),
  ]);
  const contentByBook = new Map((contents ?? []).map((content: any) => [content.book_id, content.full_text]));
  const readsByBook = new Map<string, number[]>();
  (reads ?? []).forEach((read: any) => { const pages = readsByBook.get(read.book_id) ?? []; pages.push(read.page_number); readsByBook.set(read.book_id, pages); });
  const signed = await Promise.all((books ?? []).map(async (book: any) => {
    if (!book.file_path || book.file_mime_type !== 'application/pdf') return [book.id, null] as const;
    const { data } = await db.storage.from('ebooks').createSignedUrl(book.file_path, 3600);
    return [book.id, data?.signedUrl ?? null] as const;
  }));
  const pdfByBook = new Map(signed);

  return <main className="wrap plus-library">
    <p className="eyebrow">La tua libreria Plus</p><h1>Leggi i titoli inclusi</h1>
    <p className="muted">Abbonamento attivo. La prossima scadenza è {subscription?.current_period_end ? new Intl.DateTimeFormat('it-IT', { dateStyle: 'long' }).format(new Date(subscription.current_period_end)) : 'in aggiornamento'}.</p>
    <p className="notice">Per una ripartizione corretta del fondo Plus, conferma ogni pagina dopo averla letta. Ogni pagina viene conteggiata una sola volta per titolo, lettore e mese.</p>
    <div className="plus-reading-list">{(books ?? []).map((book: any) => {
      const text = contentByBook.get(book.id); const cover = coverUrl(book.cover_path); const pdfUrl = pdfByBook.get(book.id);
      return <article className="plus-reading-book" key={book.id}>
        <div className="plus-book-intro">{cover ? <img className="plus-book-cover" src={cover} alt={`Copertina di ${book.title}`} /> : <div className="plus-book-cover placeholder-cover">Copertina</div>}<div><p className="status">Incluso in Plus</p><h2>{book.title}</h2>{book.subtitle && <p>{book.subtitle}</p>}<Link className="text-link" href={`/ebook/${book.slug}`}>Vedi la scheda del libro</Link></div></div>
        {pdfUrl ? <PdfPageReader bookId={book.id} title={book.title} pdfUrl={pdfUrl} totalPages={Math.max(1, Number(book.page_count) || 1)} confirmedPages={readsByBook.get(book.id) ?? []} /> : text ? <ReadingExperience title={book.title} text={text} mode="full" plusBookId={book.id} /> : <p className="muted">Il file di lettura sarà disponibile a breve.</p>}
      </article>;
    })}</div>
    {!books?.length && <div className="empty"><h2>Nessun titolo Plus disponibile</h2><p>Gli ebook inclusi nel programma appariranno qui non appena un autore aderisce e la redazione li pubblica.</p><Link className="button alt" href="/catalogo">Vai al catalogo</Link></div>}
  </main>;
}
