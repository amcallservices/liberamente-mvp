import {NextResponse} from 'next/server';
import {createClient} from '@/lib/supabase/server';

/** Returns a short-lived URL only to the reader who owns this paid purchase. */
export async function GET(req:Request){
  const purchaseId=new URL(req.url).searchParams.get('purchaseId');
  if(!purchaseId)return NextResponse.json({error:'Acquisto mancante.'},{status:400});

  const supabase=await createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user)return NextResponse.json({error:'Accesso richiesto.'},{status:401});

  const {data:purchase}=await supabase.from('purchases').select('books(file_path,file_mime_type)').eq('id',purchaseId).eq('buyer_id',user.id).eq('status','paid').maybeSingle();
  const rawBook=(purchase as any)?.books;
  const book=(Array.isArray(rawBook)?rawBook[0]:rawBook) as {file_path?:string|null;file_mime_type?:string|null}|null;
  if(!book?.file_path)return NextResponse.json({error:'Il file dell’ebook non è disponibile.'},{status:404});

  const {data,error}=await supabase.storage.from('ebooks').createSignedUrl(book.file_path,300);
  if(error||!data?.signedUrl)return NextResponse.json({error:'Impossibile aprire il file ora.'},{status:500});
  return NextResponse.json({url:data.signedUrl,mimeType:book.file_mime_type??''});
}
