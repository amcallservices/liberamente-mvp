import {NextResponse} from 'next/server';
import {createClient} from '@/lib/supabase/server';

const manuscriptTypes=new Set(['application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document']);
const coverTypes=new Set(['image/jpeg','image/png']);
function extension(type:string){return type==='application/pdf'?'pdf':type==='image/png'?'png':type==='image/jpeg'?'jpg':'docx'}

export async function POST(req:Request,{params}:{params:Promise<{bookId:string}>}){
  const {bookId}=await params;
  const body=await req.json().catch(()=>null) as {kind?:string;contentType?:string}|null;
  if(!body||!['manuscript','cover'].includes(body.kind??''))return NextResponse.json({error:'Richiesta non valida'},{status:400});
  const allowed=body.kind==='manuscript'?manuscriptTypes:coverTypes;
  if(!body.contentType||!allowed.has(body.contentType))return NextResponse.json({error:body.kind==='manuscript'?'Carica un PDF o un documento Word (.docx).':'Carica una copertina PNG o JPEG.'},{status:415});
  const s=await createClient();const {data:{user}}=await s.auth.getUser();
  if(!user)return NextResponse.json({error:'Accesso richiesto'},{status:401});
  const {data:book}=await s.from('books').select('id,status').eq('id',bookId).eq('author_id',user.id).maybeSingle();
  if(!book||!['draft','rejected'].includes(book.status))return NextResponse.json({error:'Questo titolo non è modificabile.'},{status:403});
  const bucket=body.kind==='manuscript'?'ebooks':'covers',path=`${user.id}/${bookId}/${body.kind}.${extension(body.contentType)}`;
  const {data,error}=await s.storage.from(bucket).createSignedUploadUrl(path,{upsert:true});
  if(error)return NextResponse.json({error:'Impossibile preparare il caricamento.'},{status:500});
  return NextResponse.json({path,signedUrl:data.signedUrl});
}
