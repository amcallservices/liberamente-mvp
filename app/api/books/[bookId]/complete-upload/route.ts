import {NextResponse} from 'next/server';
import {createClient} from '@/lib/supabase/server';
import {admin} from '@/lib/supabase/admin';
import {analyzeEbookText,getPdfPageCount} from '@/lib/reading-extraction';

export async function POST(req:Request,{params}:{params:Promise<{bookId:string}>}){
  const {bookId}=await params;const body=await req.json().catch(()=>null) as {kind?:string;path?:string;fileName?:string;contentType?:string;size?:number}|null;
  if(!body||!['manuscript','cover'].includes(body.kind??''))return NextResponse.json({error:'Richiesta non valida'},{status:400});
  if(body.kind==='manuscript'&&body.contentType!=='application/pdf')return NextResponse.json({error:'Il libro deve essere un file PDF.'},{status:415});
  if(body.kind==='cover'&&!['image/jpeg','image/png'].includes(body.contentType??''))return NextResponse.json({error:'La copertina deve essere PNG o JPEG.'},{status:415});
  const s=await createClient();const {data:{user}}=await s.auth.getUser();if(!user)return NextResponse.json({error:'Accesso richiesto'},{status:401});
  const prefix=`${user.id}/${bookId}/`;if(!body.path?.startsWith(prefix))return NextResponse.json({error:'Percorso non autorizzato'},{status:403});
  let extracted:null|Extract<Awaited<ReturnType<typeof analyzeEbookText>>,{ok:true}>=null;
  let pageCount:number|null=null;
  let readingReady=false;
  let readingWarning:string|null=null;
  if(body.kind==='manuscript'){
    const {data:file}=await admin().storage.from('ebooks').download(body.path);
    if(file){
      const buffer=Buffer.from(await file.arrayBuffer());
      pageCount=await getPdfPageCount(buffer);
      const analysis=await analyzeEbookText(buffer,body.contentType);
      if(analysis.ok){
        extracted=analysis;
        readingReady=true;
      }else if(analysis.reason==='too_short'){
        readingWarning='il PDF contiene troppo poco testo per preparare la lettura online.';
      }else{
        readingWarning='il PDF non contiene testo leggibile. Se è una scansione, esporta il documento in PDF con testo selezionabile.';
      }
    }else readingWarning='non è stato possibile verificare il PDF appena caricato. Riprova il caricamento.';
  }
  const changes=body.kind==='cover'
    ?{cover_path:body.path,cover_alt_text:'Copertina di ebook'}
    :{file_path:body.path,file_name:body.fileName?.slice(0,180)??'ebook',file_mime_type:body.contentType,file_size_bytes:body.size,page_count:pageCount};
  const {error}=await s.from('books').update(changes).eq('id',bookId).eq('author_id',user.id);if(error)return NextResponse.json({error:'Caricamento non registrato.'},{status:500});
  if(body.kind==='manuscript'&&extracted){
    const {error:readingError}=await s.from('book_reading_content').upsert({book_id:bookId,author_id:user.id,full_text:extracted.fullText,preview_text:extracted.previewText},{onConflict:'book_id'});
    readingReady=!readingError;
    if(readingError)readingWarning='il testo è stato rilevato, ma non è stato possibile preparare la lettura online. Riprova il caricamento.';
  }else if(body.kind==='manuscript'){
    // Evita che una vecchia anteprima resti collegata a un PDF sostituito e non leggibile.
    await s.from('book_reading_content').delete().eq('book_id',bookId).eq('author_id',user.id);
  }
  return NextResponse.json({ok:true,readingReady,pageCount,readingWarning});
}
