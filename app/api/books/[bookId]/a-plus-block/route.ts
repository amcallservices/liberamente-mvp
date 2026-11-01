import {NextResponse} from 'next/server';
import {createClient} from '@/lib/supabase/server';
import {admin} from '@/lib/supabase/admin';

export async function DELETE(req:Request,{params}:{params:Promise<{bookId:string}>}){
 const {bookId}=await params;
 const body=await req.json().catch(()=>null) as {blockId?:string;imagePath?:string}|null;
 if(!body?.blockId)return NextResponse.json({error:'Modulo A+ non valido.'},{status:400});
 const s=await createClient(),{data:{user}}=await s.auth.getUser();
 if(!user)return NextResponse.json({error:'Accesso richiesto.'},{status:401});
 const {data:book}=await s.from('books').select('id').eq('id',bookId).eq('author_id',user.id).maybeSingle();
 if(!book)return NextResponse.json({error:'Libro non autorizzato.'},{status:403});
 const db=admin();
 const {data:block}=await db.from('book_a_plus_blocks').select('id,status,image_paths,image_titles').eq('id',body.blockId).eq('book_id',bookId).eq('author_id',user.id).maybeSingle();
 if(!block||!['draft','rejected'].includes(block.status))return NextResponse.json({error:'Puoi eliminare soltanto contenuti A+ in bozza o da correggere.'},{status:400});
 if(body.imagePath){
  const imageIndex=block.image_paths?.indexOf(body.imagePath)??-1;
  if(imageIndex<0)return NextResponse.json({error:'Immagine A+ non trovata.'},{status:404});
  const remainingPaths=(block.image_paths??[]).filter((_,index)=>index!==imageIndex);
  if(remainingPaths.length){
   const remainingTitles=(block.image_titles??[]).filter((_,index)=>index!==imageIndex);
   const {error}=await db.from('book_a_plus_blocks').update({image_paths:remainingPaths,image_titles:remainingTitles}).eq('id',block.id);
   if(error)return NextResponse.json({error:'Impossibile eliminare l’immagine A+.'},{status:500});
  }else{
   const {error}=await db.from('book_a_plus_blocks').delete().eq('id',block.id);
   if(error)return NextResponse.json({error:'Impossibile eliminare la galleria A+.'},{status:500});
  }
  await db.storage.from('a-plus').remove([body.imagePath]);
  return NextResponse.json({ok:true});
 }
 const {error}=await db.from('book_a_plus_blocks').delete().eq('id',block.id);
 if(error)return NextResponse.json({error:'Impossibile eliminare il contenuto A+.'},{status:500});
 if(block.image_paths?.length)await db.storage.from('a-plus').remove(block.image_paths);
 return NextResponse.json({ok:true});
}
