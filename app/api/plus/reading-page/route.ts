import { NextRequest, NextResponse } from 'next/server';
import { extractPdfPage } from '@/lib/reading-extraction';
import { createPreviewPdf } from '@/lib/preview-pdf';
import { isPlusActive } from '@/lib/plus';
import { admin } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const bookId = request.nextUrl.searchParams.get('bookId')?.trim();
  const pageNumber = Math.floor(Number(request.nextUrl.searchParams.get('page')));
  if (!bookId || !Number.isFinite(pageNumber) || pageNumber < 1) return NextResponse.json({ error: 'Pagina non valida.' }, { status: 400 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Accedi per continuare la lettura.' }, { status: 401 });
  const { data: subscription } = await supabase.from('plus_subscriptions').select('status').eq('reader_id', user.id).maybeSingle();
  if (!isPlusActive(subscription?.status)) return NextResponse.json({ error: 'È necessario un abbonamento Plus attivo.' }, { status: 403 });

  const db = admin();
  const { data: book } = await db.from('books').select('id,file_path,file_mime_type,page_count').eq('id', bookId).eq('status', 'published').eq('plus_enabled', true).maybeSingle();
  if (!book || !book.file_path || book.file_mime_type !== 'application/pdf') return NextResponse.json({ error: 'Il libro non è disponibile nella lettura protetta.' }, { status: 404 });
  const totalPages = Math.max(1, Number(book.page_count) || 1);
  if (pageNumber > totalPages) return NextResponse.json({ error: 'Pagina non disponibile.' }, { status: 400 });

  if (pageNumber > 1) {
    const { data: reads, error } = await db.from('plus_page_qualifications').select('page_number').eq('reader_id', user.id).eq('book_id', bookId).lt('page_number', pageNumber);
    if (error) return NextResponse.json({ error: 'Impossibile verificare la lettura.' }, { status: 500 });
    const confirmed = new Set((reads ?? []).map((read: { page_number: number }) => read.page_number));
    const missing = Array.from({ length: pageNumber - 1 }, (_, index) => index + 1).find((current) => !confirmed.has(current));
    if (missing) return NextResponse.json({ error: `Conferma prima la pagina ${missing} per proseguire.` }, { status: 409 });
  }

  const { data: file, error: fileError } = await db.storage.from('ebooks').download(book.file_path);
  if (fileError || !file) return NextResponse.json({ error: 'Impossibile caricare il contenuto protetto.' }, { status: 500 });
  const pdfBuffer = Buffer.from(await file.arrayBuffer());
  // ?format=pdf: la stessa pagina, ma presa dal PDF originale (immagini e caratteri corretti).
  if (request.nextUrl.searchParams.get('format') === 'pdf') {
    const pagePdf = await createPreviewPdf(pdfBuffer, pageNumber, pageNumber);
    if (!pagePdf) return NextResponse.json({ error: 'Impossibile preparare la pagina originale.' }, { status: 422 });
    return new NextResponse(Buffer.from(pagePdf), { headers: { 'Content-Type': 'application/pdf', 'Cache-Control': 'private, no-store' } });
  }
  const text = await extractPdfPage(pdfBuffer, pageNumber);
  if (!text) return NextResponse.json({ error: 'Questa pagina non contiene testo leggibile.' }, { status: 422 });
  return NextResponse.json({ pageNumber, totalPages, text }, { headers: { 'Cache-Control': 'private, no-store' } });
}
