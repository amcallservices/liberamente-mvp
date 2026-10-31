'use server';
import {redirect} from 'next/navigation';
import {z} from 'zod';
import {createClient} from '@/lib/supabase/server';
import {notifyAdminBookSubmitted} from '@/lib/notifications';
import {admin} from '@/lib/supabase/admin';
import {extractEbookText} from '@/lib/reading-extraction';
import {formatIban,isValidIban,normalizeIban} from '@/lib/iban';

const schema=z.object({title:z.string().trim().min(2).max(180),subtitle:z.string().trim().max(220),description:z.string().trim().min(80).max(4000),categories:z.array(z.string().trim().min(2).max(80)).min(1).max(3),price:z.coerce.number().min(.99).max(99.99),rights:z.literal('on')});

export async function createBook(form:FormData){const selected=form.getAll('categories').map(String).map(x=>x.trim()).filter(Boolean),legacy=String(form.get('category')??'').trim(),categories=selected.length?selected:legacy?[legacy]:[];const result=schema.safeParse({...Object.fromEntries(form),categories});if(!result.success)redirect('/autore?errore=campi');const s=await createClient(),{data:{user}}=await s.auth.getUser();if(!user)redirect('/accedi');const slug=result.data.title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'')+'-'+crypto.randomUUID().slice(0,6);const {error}=await s.from('books').insert({author_id:user.id,slug,title:result.data.title,subtitle:result.data.subtitle||null,description:result.data.description,category:result.data.categories[0],categories:result.data.categories,price_cents:Math.round(result.data.price*100),rights_confirmed:true});if(error)redirect('/autore?errore=salvataggio');redirect('/autore?messaggio=Scheda+creata.+Carica+ora+il+file+del+libro+e+la+copertina.')}
export async function requestReview(form:FormData){const bookId=String(form.get('bookId')),authorNote=String(form.get('authorNote')??'').trim(),s=await createClient(),{data:{user}}=await s.auth.getUser();if(!user)redirect('/accedi');if(authorNote.length>1000)redirect('/autore?errore=campi');const {data:book}=await s.from('books').select('title,file_path,cover_path,rights_confirmed,status').eq('id',bookId).eq('author_id',user.id).maybeSingle();if(!book?.file_path||!book.cover_path||!book.rights_confirmed)redirect('/autore?errore=materiali');if(book.status==='pending_review')redirect('/autore?messaggio=Il+libro+%C3%A8+gi%C3%A0+in+revisione.');const {error}=await s.from('books').update({status:'pending_review',moderation_note:null}).eq('id',bookId).eq('author_id',user.id);if(error)redirect('/autore?errore=salvataggio');const message=authorNote||'Materiali verificati e libro inviato nuovamente alla revisione.';const {error:noteError}=await s.from('book_review_notes').insert({book_id:bookId,author_id:user.id,actor:'author',message});if(noteError)redirect('/autore?errore=salvataggio');const {data:profile}=await s.from('profiles').select('display_name').eq('id',user.id).maybeSingle();await notifyAdminBookSubmitted({title:book.title,authorName:profile?.display_name,authorEmail:user.email,bookId});redirect('/autore?messaggio=Titolo+inviato+alla+moderazione.')}
export async function beginBookEdit(form:FormData){const bookId=String(form.get('bookId')),s=await createClient(),{data:{user}}=await s.auth.getUser();if(!user)redirect('/accedi');const {error}=await s.from('books').update({status:'draft',moderation_note:null,published_at:null}).eq('id',bookId).eq('author_id',user.id);if(error)redirect('/autore?errore=modifica');redirect(`/autore/modifica/${bookId}`)}
export async function updateBook(form:FormData){const bookId=String(form.get('bookId')),authorNote=String(form.get('authorNote')??'').trim(),selected=form.getAll('categories').map(String).map(x=>x.trim()).filter(Boolean),categories=selected.length?selected:[String(form.get('category')??'').trim()].filter(Boolean),result=schema.safeParse({title:String(form.get('title')??''),subtitle:String(form.get('subtitle')??''),description:String(form.get('description')??''),price:String(form.get('price')??''),rights:String(form.get('rights')??''),categories});if(!result.success||authorNote.length>1000)redirect(`/autore/modifica/${bookId}?errore=campi`);const s=await createClient(),{data:{user}}=await s.auth.getUser();if(!user)redirect('/accedi');const {data:current}=await s.from('books').select('file_path,cover_path').eq('id',bookId).eq('author_id',user.id).maybeSingle();if(!current)redirect(`/autore/modifica/${bookId}?errore=salvataggio`);const readyForReview=Boolean(current.file_path&&current.cover_path);const {error}=await s.from('books').update({title:result.data.title,subtitle:result.data.subtitle||null,description:result.data.description,category:result.data.categories[0],categories:result.data.categories,price_cents:Math.round(result.data.price*100),rights_confirmed:true,status:readyForReview?'pending_review':'draft',moderation_note:null,published_at:null}).eq('id',bookId).eq('author_id',user.id);if(error)redirect(`/autore/modifica/${bookId}?errore=salvataggio`);if(readyForReview){const message=authorNote||'Correzioni completate e libro inviato nuovamente alla revisione.';const {error:noteError}=await s.from('book_review_notes').insert({book_id:bookId,author_id:user.id,actor:'author',message});if(noteError)redirect(`/autore/modifica/${bookId}?errore=salvataggio`);const {data:profile}=await s.from('profiles').select('display_name').eq('id',user.id).maybeSingle();await notifyAdminBookSubmitted({title:result.data.title,authorName:profile?.display_name,authorEmail:user.email,bookId});}redirect(readyForReview?'/autore?messaggio=Modifiche+salvate+e+inviate+nuovamente+alla+revisione.':`/autore/modifica/${bookId}?errore=materiali`)}
export async function deleteBook(form:FormData){
 const bookId=String(form.get('bookId')),s=await createClient(),{data:{user}}=await s.auth.getUser();
 if(!user)redirect('/accedi');
 // Il controllo dell'autore avviene sempre con la sessione dell'utente;
 // il client di servizio viene usato solo per completare una cancellazione autorizzata
 // anche quando il titolo era già pubblicato.
 const {data:ownedBook}=await s.from('books').select('id').eq('id',bookId).eq('author_id',user.id).maybeSingle();
 if(!ownedBook)redirect('/autore?errore=eliminazione');
 const db=admin();
 const {count:purchases,error:purchaseError}=await db.from('purchases').select('id',{count:'exact',head:true}).eq('book_id',bookId);
 if(purchaseError)redirect('/autore?errore=eliminazione');
 if((purchases??0)>0)redirect('/autore?errore=eliminazione_vendite');
 const {data:book,error:bookError}=await db.from('books').select('file_path,cover_path').eq('id',bookId).eq('author_id',user.id).maybeSingle();
 if(bookError||!book)redirect('/autore?errore=eliminazione');
 const {data:aPlusBlocks}=await db.from('book_a_plus_blocks').select('image_paths').eq('book_id',bookId);
 const aPlusPaths=(aPlusBlocks??[]).flatMap((block:any)=>block.image_paths??[]);
 if(aPlusPaths.length)await db.storage.from('a-plus').remove(aPlusPaths);
 if(book.file_path)await db.storage.from('ebooks').remove([book.file_path]);
 if(book.cover_path)await db.storage.from('covers').remove([book.cover_path]);
 const {error}=await db.from('books').delete().eq('id',bookId).eq('author_id',user.id);
 if(error)redirect('/autore?errore=eliminazione');
 redirect('/autore?messaggio=Titolo+e+materiali+eliminati+definitivamente.');
}
export async function setBookPreview(form:FormData){
  const bookId=String(form.get('bookId')),enabled=String(form.get('enabled'))==='true',s=await createClient(),{data:{user}}=await s.auth.getUser();
  if(!user)redirect('/accedi');
  const {data:content}=await s.from('book_reading_content').select('book_id').eq('book_id',bookId).eq('author_id',user.id).maybeSingle();
  // L'attivazione rigenera sempre il testo: così anche i titoli già caricati
  // ricevono l'estratto aggiornato dalle pagine 20–30.
  if(enabled){
    const {data:book}=await s.from('books').select('file_path,file_mime_type').eq('id',bookId).eq('author_id',user.id).maybeSingle();
    if(!book?.file_path)redirect('/autore?errore=anteprima');
    const {data:file}=await admin().storage.from('ebooks').download(book.file_path);
    if(!file)redirect('/autore?errore=anteprima');
    const extracted=await extractEbookText(Buffer.from(await file.arrayBuffer()),book.file_mime_type);
    if(!extracted)redirect('/autore?errore=anteprima');
    const {error:creationError}=await s.from('book_reading_content').upsert({book_id:bookId,author_id:user.id,full_text:extracted.fullText,preview_text:extracted.previewText,preview_enabled:true},{onConflict:'book_id'});
    if(creationError)redirect('/autore?errore=anteprima');
  }
  const {error}=await s.from('book_reading_content').update({preview_enabled:enabled}).eq('book_id',bookId).eq('author_id',user.id);
  if(error||(!content&&!enabled))redirect('/autore?errore=anteprima');
  redirect(`/autore?messaggio=${enabled?'Anteprima+gratuita+attivata+con+le+pagine+20-30.':'Anteprima+gratuita+disattivata.'}`);
}
export async function savePayoutSettings(form:FormData){
 const preference=String(form.get('payoutPreference')),
  paypal=String(form.get('paypalEmail')).trim(),
  iban=normalizeIban(String(form.get('iban')).trim()),
  accountHolder=String(form.get('accountHolder')).trim(),
  bankName=String(form.get('bankName')).trim(),
  whatsapp=String(form.get('whatsapp')).trim(),
  s=await createClient(),{data:{user}}=await s.auth.getUser();
 if(!user)redirect('/accedi');
 const paypalValid=z.string().email().safeParse(paypal).success;
 const bankDetailsValid=isValidIban(iban)&&accountHolder.length>=3&&accountHolder.length<=160&&bankName.length>=2&&bankName.length<=160&&/^[+0-9][0-9 ()-]{6,24}$/.test(whatsapp);
 if(!['stripe','paypal','bank_transfer'].includes(preference)||(preference==='paypal'&&!paypalValid)||(preference==='bank_transfer'&&!bankDetailsValid))redirect('/autore?errore=pagamento');
 const {error}=await s.from('profiles').update({
  payout_preference:preference,
  paypal_email:preference==='paypal'?paypal:null,
  payout_iban:preference==='bank_transfer'?formatIban(iban):null,
  payout_account_holder:preference==='bank_transfer'?accountHolder:null,
  payout_bank_name:preference==='bank_transfer'?bankName:null,
  payout_whatsapp:preference==='bank_transfer'?whatsapp:null,
 }).eq('id',user.id);
 if(error)redirect('/autore?errore=pagamento');
 redirect('/autore?messaggio=Preferenza+di+accredito+salvata.');
}

export async function setBookPlusEnabled(form:FormData){
 const bookId=String(form.get('bookId')??''),enabled=String(form.get('enabled')??'')==='true';
 const s=await createClient(),{data:{user}}=await s.auth.getUser();
 if(!user)redirect('/accedi');
 const {data:book}=await s.from('books').select('id,status').eq('id',bookId).eq('author_id',user.id).maybeSingle();
 if(!book||book.status!=='published')redirect('/autore/plus?errore=plus');
 // Un libro pubblicato non può essere aggiornato direttamente dall'autore per RLS:
 // la proprietà e lo stato sono verificati sopra con la sua sessione, poi il server
 // aggiorna esclusivamente l'adesione facoltativa al programma Plus.
 const {error}=await admin().from('books').update({plus_enabled:enabled,plus_enabled_at:enabled?new Date().toISOString():null}).eq('id',bookId).eq('author_id',user.id).eq('status','published');
 if(error)redirect('/autore/plus?errore=plus');
 redirect(`/autore/plus?messaggio=${encodeURIComponent(enabled?'Libro incluso in LIBERAMENTE Plus.':'Libro rimosso da LIBERAMENTE Plus.')}`);
}
