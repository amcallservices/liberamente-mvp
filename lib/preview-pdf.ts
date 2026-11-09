import {PDFDocument} from 'pdf-lib';
import {admin} from '@/lib/supabase/admin';

/** Le pagine dell'estratto gratuito: le stesse usate per il testo dell'anteprima. */
export const PREVIEW_FIRST_PAGE=20;
export const PREVIEW_LAST_PAGE=30;

const PREVIEW_FILE='preview.pdf';

/** Il file vive accanto al manoscritto, nello stesso bucket privato `ebooks`. */
export const previewPdfFolder=(authorId:string,bookId:string)=>`${authorId}/${bookId}`;
export const previewPdfPath=(authorId:string,bookId:string)=>`${previewPdfFolder(authorId,bookId)}/${PREVIEW_FILE}`;

/**
 * Ritaglia dal PDF originale le sole pagine dell'estratto. Le pagine vengono
 * copiate così come sono (font, immagini e impaginazione), quindi l'anteprima
 * mostra esattamente il libro e non una ricostruzione dal testo.
 * Restituisce null se il libro non arriva alla prima pagina dell'estratto.
 */
export async function createPreviewPdf(source:Buffer,firstPage=PREVIEW_FIRST_PAGE,lastPage=PREVIEW_LAST_PAGE):Promise<Uint8Array|null>{
  try{
    const original=await PDFDocument.load(source,{updateMetadata:false});
    const total=original.getPageCount();
    if(total<firstPage)return null;
    const end=Math.min(lastPage,total);
    const indices=Array.from({length:end-firstPage+1},(_,offset)=>firstPage-1+offset);
    const preview=await PDFDocument.create();
    const pages=await preview.copyPages(original,indices);
    pages.forEach(page=>preview.addPage(page));
    preview.setTitle('Anteprima');
    preview.setProducer('LIBERAMENTE.site');
    preview.setCreator('LIBERAMENTE.site');
    return await preview.save();
  }catch(error){
    console.error('Creazione dell’anteprima PDF non riuscita',error);
    return null;
  }
}

/**
 * Crea e salva l'anteprima impaginata. Non deve mai interrompere il flusso
 * chiamante: in caso di errore l'anteprima di testo continua a funzionare.
 */
export async function storePreviewPdf(authorId:string,bookId:string,source:Buffer):Promise<boolean>{
  try{
    const storage=admin().storage.from('ebooks'),path=previewPdfPath(authorId,bookId);
    const bytes=await createPreviewPdf(source);
    if(!bytes){await storage.remove([path]);return false;}
    const {error}=await storage.upload(path,Buffer.from(bytes),{contentType:'application/pdf',upsert:true});
    if(error){console.error('Salvataggio dell’anteprima PDF non riuscito',error);return false;}
    return true;
  }catch(error){
    console.error('Salvataggio dell’anteprima PDF non riuscito',error);
    return false;
  }
}

/** Link temporaneo all'anteprima, oppure null se non esiste (libri più vecchi). */
export async function previewPdfUrl(authorId:string,bookId:string):Promise<string|null>{
  try{
    const storage=admin().storage.from('ebooks');
    const {data:files}=await storage.list(previewPdfFolder(authorId,bookId),{limit:20,search:PREVIEW_FILE});
    if(!files?.some(file=>file.name===PREVIEW_FILE))return null;
    const {data,error}=await storage.createSignedUrl(previewPdfPath(authorId,bookId),3600);
    return error||!data?.signedUrl?null:data.signedUrl;
  }catch{
    return null;
  }
}

const failedAttempts=new Map<string,number>();
const RETRY_AFTER_MS=10*60*1000;

/**
 * Restituisce il link all'anteprima impaginata e, per i libri pubblicati prima
 * di questa funzione, la crea alla prima visita: così non serve nessuna azione
 * dell'autore. Se non è possibile crearla, restituisce null e la pagina mostra
 * l'anteprima di testo come prima.
 */
export async function ensurePreviewPdfUrl(book:{id:string;author_id:string;file_path?:string|null;file_mime_type?:string|null;pageCount?:number|null}):Promise<string|null>{
  const existing=await previewPdfUrl(book.author_id,book.id);
  if(existing)return existing;
  if(!book.file_path||book.file_mime_type!=='application/pdf')return null;
  if(book.pageCount&&book.pageCount<PREVIEW_FIRST_PAGE)return null;
  const lastFailure=failedAttempts.get(book.id);
  if(lastFailure&&Date.now()-lastFailure<RETRY_AFTER_MS)return null;
  try{
    const {data:file}=await admin().storage.from('ebooks').download(book.file_path);
    const created=file?await storePreviewPdf(book.author_id,book.id,Buffer.from(await file.arrayBuffer())):false;
    if(!created){failedAttempts.set(book.id,Date.now());return null;}
  }catch(error){
    console.error('Creazione automatica dell’anteprima PDF non riuscita',error);
    failedAttempts.set(book.id,Date.now());
    return null;
  }
  return previewPdfUrl(book.author_id,book.id);
}
