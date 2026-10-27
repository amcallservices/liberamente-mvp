import {NextResponse} from 'next/server';
import {createClient} from '@/lib/supabase/server';
import {admin} from '@/lib/supabase/admin';
import {extractEbookText} from '@/lib/reading-extraction';

export async function POST(req:Request,{params}:{params:Promise<{bookId:string}>}){
  const {bookId}=await params;const body=await req.json().catch(()=>null) as {kind?:string;path?:string;fileName?:string;contentType?:string;size?:number}|null;
  if(!body||!['manuscript','cover'].includes(body.kind??''))return NextResponse.json({error:'Richiesta non valida'},{status:400});
  const s=await createClient();const {data:{user}}=await s.auth.getUser();if(!user)return NextResponse.json({error:'Accesso richiesto'},{status:401});
  const prefix=`${user.id}/${bookId}/`;if(!body.path?.startsWith(prefix))return NextResponse.json({error:'Percorso non autorizzato'},{status:403});
  const changes=body.kind==='cover'?{cover_path:body.path,cover_alt_text:'Copertina di ebook'}:{file_path:body.path,file_name:body.fileName?.slice(0,180)??'ebook',file_mime_type:body.contentType,file_size_bytes:body.size};
  const {error}=await s.from('books').update(changes).eq('id',bookId).eq('author_id',user.id);if(error)return NextResponse.json({error:'Caricamento non registrato.'},{status:500});
  let readingReady=false;
  if(body.kind==='manuscript'){
    const {data:file}=await admin().storage.from('ebooks').download(body.path);
    if(file){
      const extracted=await extractEbookText(Buffer.from(await file.arrayBuffer()),body.contentType);
      if(extracted){
        const {error:readingError}=await s.from('book_reading_content').upsert({book_id:bookId,author_id:user.id,full_text:extracted.fullText,preview_text:extracted.previewText},{onConflict:'book_id'});
        readingReady=!readingError;
      }
    }
  }
  return NextResponse.json({ok:true,readingReady});
}
