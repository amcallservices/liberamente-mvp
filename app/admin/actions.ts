'use server';
import {redirect} from 'next/navigation';
import {createClient} from '@/lib/supabase/server';
import {admin} from '@/lib/supabase/admin';
import {notifyAuthorBookDecision} from '@/lib/notifications';
import {revalidatePath} from 'next/cache';
import {evaluateBookWithAi} from '@/lib/book-ai-review';
import {extractEbookText,getPdfPageCount} from '@/lib/reading-extraction';

async function verifiedAdmin(){const s=await createClient(),{data:{user}}=await s.auth.getUser();if(!user)redirect('/accedi');const {data:profile}=await s.from('profiles').select('role').eq('id',user.id).maybeSingle();if(profile?.role!=='admin')redirect('/');return admin()}
async function decideBook(bookId:string,status:'published'|'rejected'|'blocked',note:string){const db=await verifiedAdmin();const {data:book,error:bookError}=await db.from('books').select('author_id,title,file_path,file_mime_type,page_count').eq('id',bookId).maybeSingle();if(bookError||!book)throw new Error('Libro non trovato.');let pageCount=Number(book.page_count)||null;if(status==='published'&&!pageCount&&book.file_path&&book.file_mime_type==='application/pdf'){const {data:file}=await db.storage.from('ebooks').download(book.file_path);if(file)pageCount=await getPdfPageCount(Buffer.from(await file.arrayBuffer()));}const message=note.trim()||({published:'Libro approvato e pubblicato.',rejected:'Sono necessarie alcune correzioni prima della pubblicazione.',blocked:'Titolo bloccato dalla revisione editoriale.'}[status]);const {error}=await db.from('books').update({status,published_at:status==='published'?new Date().toISOString():null,moderation_note:status==='published'?null:message,...(pageCount?{page_count:pageCount}:{})}).eq('id',bookId);if(error)throw new Error('Aggiornamento editoriale non riuscito.');const {error:noteError}=await db.from('book_review_notes').insert({book_id:bookId,author_id:book.author_id,actor:'admin',message});if(noteError)throw new Error('Decisione salvata, ma non è stato possibile registrare la nota di revisione.');const {data:{user:authorUser}}=await db.auth.admin.getUserById(book.author_id);await notifyAuthorBookDecision({email:authorUser?.email,title:book.title,status,note:message});redirect('/admin')}
export async function publishBook(bookId:string){await decideBook(bookId,'published','')}
export async function rejectBook(bookId:string,form:FormData){await decideBook(bookId,'rejected',String(form.get('note')??''))}
export async function blockBook(bookId:string,form:FormData){await decideBook(bookId,'blocked',String(form.get('note')??''))}
async function decideAPlus(blockId:string,status:'approved'|'rejected',note:string){const db=await verifiedAdmin();const message=note.trim()||(status==='approved'?'Contenuto A+ approvato e pubblicato nella pagina del libro.':'Sono necessarie correzioni prima della pubblicazione del contenuto A+.');const {error}=await db.from('book_a_plus_blocks').update({status,moderation_note:status==='approved'?null:message}).eq('id',blockId);if(error)throw new Error('Aggiornamento del contenuto A+ non riuscito.');redirect('/admin')}
export async function approveAPlusBlock(blockId:string){await decideAPlus(blockId,'approved','')}
export async function rejectAPlusBlock(blockId:string,form:FormData){await decideAPlus(blockId,'rejected',String(form.get('note')??''))}
export async function deleteAPlusBlockAsAdmin(blockId:string){const db=await verifiedAdmin();const {data:block,error:readError}=await db.from('book_a_plus_blocks').select('image_paths').eq('id',blockId).maybeSingle();if(readError||!block)throw new Error('Contenuto A+ non trovato.');if(block.image_paths?.length)await db.storage.from('a-plus').remove(block.image_paths);const {error}=await db.from('book_a_plus_blocks').delete().eq('id',blockId);if(error)throw new Error('Eliminazione del contenuto A+ non riuscita.');redirect('/admin')}
export async function markAuthorRoyaltiesPaid(authorId:string,form:FormData){const date=String(form.get('paidOutDate')??'');if(!/^\d{4}-\d{2}-\d{2}$/.test(date))redirect('/admin');const db=await verifiedAdmin();const cutoff=new Date();cutoff.setUTCDate(cutoff.getUTCDate()-30);const {data:eligible,error:readError}=await db.from('royalty_ledger').select('id').eq('author_id',authorId).is('paid_out_at',null).is('reversed_at',null).lte('created_at',cutoff.toISOString());if(readError)throw new Error('Impossibile verificare le royalty.');const ids=(eligible??[]).map(row=>row.id);if(ids.length){const {error}=await db.from('royalty_ledger').update({paid_out_at:`${date}T12:00:00.000Z`}).in('id',ids);if(error)throw new Error('Impossibile registrare il pagamento.')}redirect('/admin')}
export async function analyzeBookWithAi(bookId:string){
 const db=await verifiedAdmin();
 try{
  const {data:book,error:bookError}=await db.from('books').select('id,author_id,title,subtitle,description,file_path,file_mime_type').eq('id',bookId).maybeSingle();
  if(bookError||!book)throw new Error('BOOK_NOT_FOUND');
  let {data:content,error:contentError}=await db.from('book_reading_content').select('full_text').eq('book_id',bookId).maybeSingle();
  if(contentError)throw new Error('READING_CONTENT_UNAVAILABLE');
  if(!content?.full_text){
   if(!book.file_path||book.file_mime_type!=='application/pdf')throw new Error('PDF_NOT_AVAILABLE');
   const {data:file,error:fileError}=await db.storage.from('ebooks').download(book.file_path);
   if(fileError||!file)throw new Error('PDF_DOWNLOAD_FAILED');
   const extracted=await extractEbookText(Buffer.from(await file.arrayBuffer()),book.file_mime_type);
   if(!extracted?.fullText)throw new Error('PDF_EXTRACTION_FAILED');
   const {error:saveError}=await db.from('book_reading_content').upsert({book_id:book.id,author_id:book.author_id,full_text:extracted.fullText,preview_text:extracted.previewText},{onConflict:'book_id'});
   if(saveError)throw new Error('TEXT_SAVE_FAILED');
   content={full_text:extracted.fullText};
  }
  const review=await evaluateBookWithAi({title:book.title,subtitle:book.subtitle,description:book.description,text:content.full_text});
  const {error:writeError}=await db.from('book_ai_reviews').upsert({book_id:book.id,...review,evaluated_at:new Date().toISOString()},{onConflict:'book_id'});
  if(writeError)throw writeError;
  revalidatePath('/admin');
 }catch(error){
  console.error('Analisi AI non disponibile',error);
  const code=error instanceof Error?error.message:'UNKNOWN';
  redirect(`/admin?ai=${encodeURIComponent(code)}`);
 }
 redirect('/admin');
}
export async function deleteBookAsAdmin(bookId:string){const db=await verifiedAdmin();const {data:book,error:bookReadError}=await db.from('books').select('file_path,cover_path').eq('id',bookId).maybeSingle();if(bookReadError||!book)throw new Error('Libro non trovato.');const {data:aPlusBlocks}=await db.from('book_a_plus_blocks').select('image_paths').eq('book_id',bookId);const aPlusPaths=(aPlusBlocks??[]).flatMap((block:any)=>block.image_paths??[]);if(aPlusPaths.length)await db.storage.from('a-plus').remove(aPlusPaths);const {data:purchases,error:purchaseReadError}=await db.from('purchases').select('id').eq('book_id',bookId);if(purchaseReadError)throw new Error('Impossibile verificare gli acquisti collegati.');const purchaseIds=(purchases??[]).map(purchase=>purchase.id);if(purchaseIds.length){const {error:royaltyError}=await db.from('royalty_ledger').delete().in('purchase_id',purchaseIds);if(royaltyError)throw new Error('Impossibile eliminare le royalty collegate.');const {error:purchaseError}=await db.from('purchases').delete().eq('book_id',bookId);if(purchaseError)throw new Error('Impossibile eliminare gli acquisti collegati.');}if(book.file_path)await db.storage.from('ebooks').remove([book.file_path]);if(book.cover_path)await db.storage.from('covers').remove([book.cover_path]);const {error}=await db.from('books').delete().eq('id',bookId);if(error)throw new Error('Eliminazione non riuscita');redirect('/admin')}
