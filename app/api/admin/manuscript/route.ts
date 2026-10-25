import {NextResponse} from 'next/server';
import {createClient} from '@/lib/supabase/server';
import {admin} from '@/lib/supabase/admin';

export async function GET(req:Request){
  const bookId=new URL(req.url).searchParams.get('bookId');
  if(!bookId)return NextResponse.json({error:'Libro non indicato.'},{status:400});
  const s=await createClient();
  const {data:{user}}=await s.auth.getUser();
  if(!user)return NextResponse.redirect(new URL('/accedi',req.url));
  const {data:profile}=await s.from('profiles').select('role').eq('id',user.id).maybeSingle();
  if(profile?.role!=='admin')return NextResponse.json({error:'Accesso non autorizzato.'},{status:403});
  const db=admin();
  const {data:book}=await db.from('books').select('file_path').eq('id',bookId).maybeSingle();
  if(!book?.file_path)return NextResponse.json({error:'Manoscritto non disponibile.'},{status:404});
  const {data,error}=await db.storage.from('ebooks').createSignedUrl(book.file_path,300);
  if(error||!data?.signedUrl)return NextResponse.json({error:'Impossibile aprire il manoscritto.'},{status:500});
  return NextResponse.redirect(data.signedUrl,302);
}
