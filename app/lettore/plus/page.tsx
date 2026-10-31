import Link from 'next/link';
import { redirect } from 'next/navigation';
import { admin } from '@/lib/supabase/admin';
import { coverUrl } from '@/lib/covers';
import { isPlusActive } from '@/lib/plus';
import { createClient } from '@/lib/supabase/server';
import { PdfPageReader } from './pdf-page-reader';
import {marketplaceLocale,marketplacePath} from '@/lib/marketplace';
import {categoryLabel} from '@/lib/categories';

export default async function PlusLibrary({ searchParams }: { searchParams: Promise<{ libro?: string; categoria?: string; market?:string }> }) {
  const query = await searchParams;
  const locale=marketplaceLocale(query.market),english=locale==='en',local=(path:string)=>marketplacePath(locale,path);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(local('/accedi'));
  const { data: subscription } = await supabase.from('plus_subscriptions').select('id,status,current_period_end').eq('reader_id', user.id).maybeSingle();
  if (!isPlusActive(subscription?.status)) return <main className="wrap plus-library"><p className="eyebrow">{english?'Reader area':'Area lettori'}</p><h1>LIBERAMENTE Plus</h1><p>{english?'An active Plus subscription is required to read included titles.':'Per leggere i titoli inclusi serve un abbonamento Plus attivo.'}</p><Link className="button" href={local('/plus')}>{english?'Discover LIBERAMENTE Plus':'Scopri LIBERAMENTE Plus'}</Link></main>;

  const db = admin();
  const { data: books } = await db.from('books').select('id,title,subtitle,slug,category,cover_path,file_path,file_mime_type,page_count').eq('status', 'published').eq('plus_enabled', true).eq('marketplace_locale',locale).order('updated_at', { ascending: false });
  const bookIds = (books ?? []).map((book: any) => book.id);
  const now = new Date();
  const periodStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString().slice(0, 10);
  const [{ data: reads }] = await Promise.all([
    bookIds.length ? db.from('plus_page_reads').select('book_id,page_number').eq('reader_id', user.id).in('book_id', bookIds).eq('period_start', periodStart) : Promise.resolve({ data: [] as any[] }),
  ]);
  const readsByBook = new Map<string, number[]>();
  (reads ?? []).forEach((read: any) => { const pages = readsByBook.get(read.book_id) ?? []; pages.push(read.page_number); readsByBook.set(read.book_id, pages); });
  const categories = Array.from(new Set((books ?? []).map((book: any) => String(book.category ?? '').trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b, english ? 'en' : 'it'));
  const categoryQuery = query.categoria?.trim();
  const selectedCategory = categories.includes(categoryQuery ?? '') ? categoryQuery : undefined;
  const visibleBooks = selectedCategory ? (books ?? []).filter((book: any) => book.category === selectedCategory) : (books ?? []);
  const selectedBook = (books ?? []).find((book: any) => book.id === query.libro);
  return <main className="wrap plus-library">
    <p className="eyebrow">{english?'Your Plus library':'La tua libreria Plus'}</p><h1>{english?'Read included titles':'Leggi i titoli inclusi'}</h1>
    <p className="muted">{english?'Active subscription. Your next renewal date is ':'Abbonamento attivo. La prossima scadenza è '}{subscription?.current_period_end ? new Intl.DateTimeFormat(english?'en-US':'it-IT', { dateStyle: 'long' }).format(new Date(subscription.current_period_end)) : (english?'being updated':'in aggiornamento')}.</p>
    <p className="notice">{english?'For a fair Plus fund distribution, confirm every page after reading it. You will always resume from the first unconfirmed page. Each page is counted only once per title, reader and month; downloading and printing are unavailable.':'Per una ripartizione corretta del fondo Plus, conferma ogni pagina dopo averla letta. Riprenderai sempre dalla prima pagina non confermata. Ogni pagina viene conteggiata una sola volta per titolo, lettore e mese; download e stampa non sono disponibili.'}</p>
    {selectedBook ? (() => {
      const cover = coverUrl(selectedBook.cover_path);
      const hasProtectedPdf = Boolean(selectedBook.file_path && selectedBook.file_mime_type === 'application/pdf');
      return <article className="plus-reading-book plus-reading-book--active">
        <div className="plus-reader-heading"><Link className="button alt" href={selectedCategory ? local(`/lettore/plus?categoria=${encodeURIComponent(selectedCategory)}`) : local('/lettore/plus')}>← {english?'Choose another book':'Cambia libro'}</Link><Link className="text-link" href={local(`/ebook/${selectedBook.slug}`)}>{english?'View book page':'Vedi la scheda del libro'}</Link></div>
        <div className="plus-book-intro">{cover ? <img className="plus-book-cover" src={cover} alt={`Copertina di ${selectedBook.title}`} /> : <div className="plus-book-cover placeholder-cover">Copertina</div>}<div><p className="status">Stai leggendo</p><h2>{selectedBook.title}</h2>{selectedBook.subtitle && <p>{selectedBook.subtitle}</p>}</div></div>
        {hasProtectedPdf ? <PdfPageReader bookId={selectedBook.id} title={selectedBook.title} totalPages={Math.max(1, Number(selectedBook.page_count) || 1)} confirmedPages={readsByBook.get(selectedBook.id) ?? []} /> : <p className="muted">Il file di lettura protetta sarà disponibile a breve.</p>}
      </article>;
    })() : <section className="plus-title-picker" aria-label="Scegli un titolo Plus">
      <div className="plus-title-picker__heading"><div><h2>{english?'Choose a book to read':'Scegli un libro da leggere'}</h2><p>{english?'Open one title at a time: you can always return here and continue another ebook.':'Apri un solo titolo alla volta: potrai sempre tornare qui e continuare un altro ebook.'}</p></div><span>{books?.length ?? 0} {english?'titles available':'titoli disponibili'}</span></div>
      {categories.length > 0 && <nav className="plus-category-filter" aria-label={english?'Filter Plus titles by category':'Filtra i titoli Plus per categoria'}><span>{english?'Browse by category':'Esplora per categoria'}</span><div><Link className={`plus-category-filter__link${!selectedCategory ? ' is-active' : ''}`} href={local('/lettore/plus')}>{english?'All':'Tutti'}</Link>{categories.map((category) => <Link key={category} className={`plus-category-filter__link${selectedCategory === category ? ' is-active' : ''}`} href={local(`/lettore/plus?categoria=${encodeURIComponent(category)}`)}>{categoryLabel(category,locale)}</Link>)}</div></nav>}
      <div className="plus-title-picker__grid">{visibleBooks.map((book: any) => {
        const cover = coverUrl(book.cover_path);
        const pagesRead = readsByBook.get(book.id)?.length ?? 0;
        const totalPages = Math.max(1, Number(book.page_count) || 1);
        return <article className="plus-title-card" key={book.id}>
          {cover ? <img className="plus-title-card__cover" src={cover} alt={`Copertina di ${book.title}`} /> : <div className="plus-title-card__cover placeholder-cover">Copertina</div>}
          <div className="plus-title-card__body"><p className="status">{english?'Included in Plus':'Incluso in Plus'}</p><h3>{book.title}</h3>{book.category && <p className="plus-title-card__category">{categoryLabel(book.category,locale)}</p>}{book.subtitle && <p className="muted">{book.subtitle}</p>}<p className="plus-title-card__progress">{pagesRead > 0 ? (english?`${pagesRead} of ${totalPages} pages confirmed`:`${pagesRead} di ${totalPages} pagine confermate`) : (english?`Ready to read · ${totalPages} pages`:`Pronto da leggere · ${totalPages} pagine`)}</p><Link className="button" href={local(`/lettore/plus?libro=${encodeURIComponent(book.id)}`)}>{pagesRead > 0 ? (english?'Resume reading':'Riprendi la lettura') : (english?'Start reading':'Inizia a leggere')}</Link></div>
        </article>;
      })}</div>
      {!visibleBooks.length && books?.length ? <div className="empty plus-filter-empty"><h3>{english?'No titles in this category':'Nessun titolo in questa categoria'}</h3><p>{english?'Try another category to find an ebook included in Plus.':'Prova a scegliere un&apos;altra categoria per trovare un ebook incluso in Plus.'}</p><Link className="button alt" href={local('/lettore/plus')}>{english?'Show all titles':'Mostra tutti i titoli'}</Link></div> : null}
    </section>}
    {!books?.length && <div className="empty"><h2>{english?'No Plus titles available':'Nessun titolo Plus disponibile'}</h2><p>{english?'Included ebooks will appear here as soon as an author joins and the editorial team publishes them.':'Gli ebook inclusi nel programma appariranno qui non appena un autore aderisce e la redazione li pubblica.'}</p><Link className="button alt" href={local('/catalogo')}>{english?'Go to catalogue':'Vai al catalogo'}</Link></div>}
  </main>;
}
