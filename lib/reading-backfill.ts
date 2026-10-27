import {admin} from '@/lib/supabase/admin';
import {extractEbookText} from '@/lib/reading-extraction';

export async function preparePurchasedBookReading(book:{id?:string;author_id?:string;file_path?:string|null;file_mime_type?:string|null}){
  if(!book.id||!book.author_id||!book.file_path)return;
  const client=admin();
  const {data:existing}=await client.from('book_reading_content').select('book_id').eq('book_id',book.id).maybeSingle();
  if(existing)return;
  const {data:file}=await client.storage.from('ebooks').download(book.file_path);
  if(!file)return;
  const extracted=await extractEbookText(Buffer.from(await file.arrayBuffer()),book.file_mime_type);
  if(!extracted)return;
  await client.from('book_reading_content').insert({book_id:book.id,author_id:book.author_id,full_text:extracted.fullText,preview_text:extracted.previewText});
}
