import { NextResponse } from 'next/server';
import { admin } from '@/lib/supabase/admin';
import { isPlusActive } from '@/lib/plus';
import { createClient } from '@/lib/supabase/server';

type PageReadRequest = { bookId?: string; pageNumber?: number };

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });

  const body = (await request.json().catch(() => null)) as PageReadRequest | null;
  const pageNumber = Math.round(Number(body?.pageNumber));
  if (!body?.bookId || !Number.isFinite(pageNumber) || pageNumber < 1) {
    return NextResponse.json({ error: 'Pagina o libro non validi' }, { status: 400 });
  }

  const { data: subscription } = await supabase
    .from('plus_subscriptions')
    .select('id,status')
    .eq('reader_id', user.id)
    .maybeSingle();
  if (!subscription || !isPlusActive(subscription.status)) {
    return NextResponse.json({ error: 'Abbonamento Plus non attivo' }, { status: 403 });
  }

  const db = admin();
  const { data: book } = await db
    .from('books')
    .select('id,page_count')
    .eq('id', body.bookId)
    .eq('status', 'published')
    .eq('plus_enabled', true)
    .maybeSingle();
  if (!book) return NextResponse.json({ error: 'Titolo non incluso in Plus' }, { status: 404 });

  const totalPages = Math.max(1, Number(book.page_count) || 1);
  if (pageNumber > totalPages) return NextResponse.json({ error: 'Pagina non disponibile' }, { status: 400 });

  const now = new Date();
  const periodStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString().slice(0, 10);
  // La sequenza è verificata anche lato server: l'interfaccia non basta a
  // impedire richieste manuali per pagine non ancora lette.
  if (pageNumber > 1) {
    const { data: previousReads, error: previousReadsError } = await db
      .from('plus_page_reads')
      .select('page_number')
      .eq('reader_id', user.id)
      .eq('book_id', book.id)
      .eq('period_start', periodStart)
      .lt('page_number', pageNumber);
    if (previousReadsError) {
      console.error('Impossibile verificare la sequenza Plus', previousReadsError);
      return NextResponse.json({ error: 'Impossibile verificare la lettura' }, { status: 500 });
    }
    const readPages = new Set(
      ((previousReads ?? []) as Array<{ page_number: number }>).map((read) => read.page_number),
    );
    const missingPage = Array.from({ length: pageNumber - 1 }, (_, index) => index + 1)
      .find((currentPage) => !readPages.has(currentPage));
    if (missingPage) {
      return NextResponse.json(
        { error: `Conferma prima la pagina ${missingPage} per proseguire.` },
        { status: 409 },
      );
    }
  }
  const { error } = await db.from('plus_page_reads').upsert(
    {
      reader_id: user.id,
      book_id: book.id,
      subscription_id: subscription.id,
      page_number: pageNumber,
      period_start: periodStart,
    },
    { onConflict: 'reader_id,book_id,page_number,period_start', ignoreDuplicates: true },
  );
  if (error) {
    console.error('Impossibile registrare la pagina Plus', error);
    return NextResponse.json({ error: 'Impossibile salvare la lettura' }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
