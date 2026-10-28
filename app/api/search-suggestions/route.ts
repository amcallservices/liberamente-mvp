import {NextRequest, NextResponse} from 'next/server';
import {rankBooksForQuery} from '@/lib/book-search';
import {coverUrl} from '@/lib/covers';
import {createClient} from '@/lib/supabase/server';

export async function GET(request:NextRequest){
  const query=request.nextUrl.searchParams.get('q')?.trim()??'';
  if(query.length<2)return NextResponse.json({suggestions:[]});
  const supabase=await createClient();
  const {data,error}=await supabase.from('books').select('id,title,slug,subtitle,description,category,categories,cover_path,profiles!books_author_id_fkey(display_name)').eq('status','published').limit(250);
  if(error)return NextResponse.json({suggestions:[]},{status:200});
  const suggestions=rankBooksForQuery(data??[],query).slice(0,6).map(({book})=>({
    id:book.id,
    title:book.title,
    slug:book.slug,
    author:Array.isArray(book.profiles)?book.profiles[0]?.display_name??'Autore':book.profiles?.display_name??'Autore',
    category:book.category??'Ebook',
    coverUrl:coverUrl(book.cover_path),
  }));
  return NextResponse.json({suggestions});
}
