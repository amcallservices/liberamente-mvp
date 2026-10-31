import Link from 'next/link';
import { redirect } from 'next/navigation';
import { admin } from '@/lib/supabase/admin';
import { coverUrl } from '@/lib/covers';
import { isPlusActive } from '@/lib/plus';
import { createClient } from '@/lib/supabase/server';
import { PdfPageReader } from './pdf-page-reader';

export default async function PlusLibrary({ searchParams }: { searchParams: Promise<{ libro?: string }> }) {
  const query = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/accedi');
  const { data: subscription } = await supabase.from('plus_subscriptions').select('id,status,current_period_end').eq('reader_id', user.id).maybeSingle();
  if (!isPlusActive(subscription?.status)) return <main className="wrap plus-library"><p className="eyebrow">Area lettori</p><h1>LIBERAMENTE Plus</h1><p>Per leggere i titoli inclusi serve un abbonamento Plus attivo.</p><Link className="button" href="/plus">Scopri LIBERAMENTE Plus</Link></main>;

  const db = admin();
  const { data: books } = await db.from('books').select('id,title,subtitle,slug,cover_path,file_path,file_mime_type,page_count').eq('status', 'published').eq('plus_enabled', true).order('updated_at', { ascending: false });
  const bookIds = (books ?? []).map((book: any) => book.id);
  const now = new Date();
  const periodStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString().slice(0, 10);
  const [{ data: reads }] = await Promise.all([
    bookIds.length ? db.from('plus_page_reads').select('book_id,page_number').eq('reader_id', user.id).in('book_id', bookIds).eq('period_start', periodStart) : Promise.resolve({ data: [] as any[] }),
  ]);
  const readsByBook = new Map<string, number[]>();
  (reads ?? []).forEach((read: any) => { const pages = readsByBook.get(read.book_id) ?? []; pages.push(read.page_number); readsByBook.set(read.book_id, pages); });
  const selectedBook = (books ?? []).find((book: any) => book.id === query.libro);
  return <main className="wrap plus-library">
    <p className="eyebrow">La tua libreria Plus</p><h1>Leggi i titoli inclusi</h1>
    <p className="muted">Abbonamento attivo. La prossima scadenza è {subscription?.current_period_end ? new Intl.DateTimeFormat('it-IT', { dateStyle: 'long' }).format(new Date(subscription.current_period_end)) : 'in aggiornamento'}.</p>
    <p className="notice">Per una ripartizione corretta del fondo Plus, conferma ogni pagina dopo averla letta. Riprenderai sempre dalla prima pagina non confermata. Ogni pagina viene conteggiata una sola volta per titolo, lettore e mese; download e stampa non sono disponibili.</p>
    {selectedBook ? (() => {
      const cover = coverUrl(selectedBook.cover_path);
      const hasProtectedPdf = Boolean(selectedBook.file_path && selectedBook.file_mime_type === 'application/pdf');
      return <article className="plus-reading-book plus-reading-book--active">
        <div className="plus-reader-heading"><Link className="button alt" href="/lettore/plus">← Cambia libro</Link><Link className="text-link" href={`/ebook/${selectedBook.slug}`}>Vedi la scheda del libro</Link></div>
        <div className="plus-book-intro">{cover ? <img className="plus-book-cover" src={cover} alt={`Copertina di ${selectedBook.title}`} /> : <div className="plus-book-cover placeholder-cover">Copertina</div>}<div><p className="status">Stai leggendo</p><h2>{selectedBook.title}</h2>{selectedBook.subtitle && <p>{selectedBook.subtitle}</p>}</div></div>
        {hasProtectedPdf ? <PdfPageReader bookId={selectedBook.id} title={selectedBook.title} totalPages={Math.max(1, Number(selectedBook.page_count) || 1)} confirmedPages={readsByBook.get(selectedBook.id) ?? []} /> : <p className="muted">Il file di lettura protetta sarà disponibile a breve.</p>}
      </article>;
    })() : <section className="plus-title-picker" aria-label="Scegli un titolo Plus">
      <div className="plus-title-picker__heading"><div><h2>Scegli un libro da leggere</h2><p>Apri un solo titolo alla volta: potrai sempre tornare qui e continuare un altro ebook.</p></div><span>{books?.length ?? 0} titoli disponibili</span></div>
      <div className="plus-title-picker__grid">{(books ?? []).map((book: any) => {
        const cover = coverUrl(book.cover_path);
        const pagesRead = readsByBook.get(book.id)?.length ?? 0;
        const totalPages = Math.max(1, Number(book.page_count) || 1);
        return <article className="plus-title-card" key={book.id}>
          {cover ? <img className="plus-title-card__cover" src={cover} alt={`Copertina di ${book.title}`} /> : <div className="plus-title-card__cover placeholder-cover">Copertina</div>}
          <div className="plus-title-card__body"><p className="status">Incluso in Plus</p><h3>{book.title}</h3>{book.subtitle && <p className="muted">{book.subtitle}</p>}<p className="plus-title-card__progress">{pagesRead > 0 ? `${pagesRead} di ${totalPages} pagine confermate` : `Pronto da leggere · ${totalPages} pagine`}</p><Link className="button" href={`/lettore/plus?libro=${encodeURIComponent(book.id)}`}>{pagesRead > 0 ? 'Riprendi la lettura' : 'Inizia a leggere'}</Link></div>
        </article>;
      })}</div>
    </section>}
    {!books?.length && <div className="empty"><h2>Nessun titolo Plus disponibile</h2><p>Gli ebook inclusi nel programma appariranno qui non appena un autore aderisce e la redazione li pubblica.</p><Link className="button alt" href="/catalogo">Vai al catalogo</Link></div>}
  </main>;
}
