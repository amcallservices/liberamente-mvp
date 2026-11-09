import {admin} from '@/lib/supabase/admin';
import {extractEbookText} from '@/lib/reading-extraction';
import {isCurrentReaderText} from '@/lib/reader-format';

export async function preparePurchasedBookReading(book?:{id?:string;author_id?:string;file_path?:string|null;file_mime_type?:string|null}|null){
  // Un acquisto può avere il libro non leggibile (per esempio tornato in revisione): non deve mai rompere la libreria.
  if(!book?.id||!book.author_id||!book.file_path)return;
  const client=admin();
  const {data:existing}=await client.from('book_reading_content').select('book_id,full_text').eq('book_id',book.id).maybeSingle();
  if(existing&&isCurrentReaderText(existing.full_text))return;
  const {data:file}=await client.storage.from('ebooks').download(book.file_path);
  if(!file)return;
  const extracted=await extractEbookText(Buffer.from(await file.arrayBuffer()),book.file_mime_type);
  if(!extracted)return;
  await client.from('book_reading_content').upsert({book_id:book.id,author_id:book.author_id,full_text:extracted.fullText,preview_text:extracted.previewText},{onConflict:'book_id'});
}
