import {NextResponse} from 'next/server';
import {createClient} from '@/lib/supabase/server';
import {admin} from '@/lib/supabase/admin';

export async function POST(req:Request,{params}:{params:Promise<{bookId:string}>}){
 const {bookId}=await params;
 const body=await req.json().catch(()=>null) as {blockId?:string}|null;
 if(!body?.blockId)return NextResponse.json({error:'Modulo A+ non valido.'},{status:400});
 const s=await createClient(),{data:{user}}=await s.auth.getUser();
 if(!user)return NextResponse.json({error:'Accesso richiesto.'},{status:401});
 const {data:book}=await s.from('books').select('id').eq('id',bookId).eq('author_id',user.id).maybeSingle();
 if(!book)return NextResponse.json({error:'Libro non autorizzato.'},{status:403});
 const db=admin();
 const {data:block}=await db.from('book_a_plus_blocks').select('id,status').eq('id',body.blockId).eq('book_id',bookId).eq('author_id',user.id).maybeSingle();
 if(!block||!['draft','rejected'].includes(block.status))return NextResponse.json({error:'Questo contenuto non può essere inviato alla revisione.'},{status:400});
 const {error}=await db.from('book_a_plus_blocks').update({status:'pending_review',moderation_note:null}).eq('id',block.id);
 if(error)return NextResponse.json({error:'Impossibile inviare il contenuto alla revisione.'},{status:500});
 return NextResponse.json({ok:true});
}
