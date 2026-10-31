import {NextRequest, NextResponse} from 'next/server';
import {rankBooksForQuery} from '@/lib/book-search';
import {coverUrl} from '@/lib/covers';
import {admin} from '@/lib/supabase/admin';
import {marketplaceLocale} from '@/lib/marketplace';

export async function GET(request:NextRequest){
  const query=request.nextUrl.searchParams.get('q')?.trim()??'';
  const locale=marketplaceLocale(request.nextUrl.searchParams.get('market'));
  if(query.length<2)return NextResponse.json({suggestions:[]});
  // L'endpoint restituisce esclusivamente metadati pubblici dei titoli e il
  // nome visualizzato dell'autore, anche ai visitatori non autenticati.
  const supabase=admin();
  const {data,error}=await supabase.from('books').select('id,title,slug,subtitle,description,category,categories,cover_path,profiles!books_author_id_fkey(display_name)').eq('status','published').eq('marketplace_locale',locale).limit(250);
  if(error)return NextResponse.json({suggestions:[]},{status:200});
  const suggestions=rankBooksForQuery(data??[],query).slice(0,6).map(({book})=>{
    // La relazione di Supabase non è tipizzata in questo progetto: la leggiamo in
    // modo difensivo così un autore mancante non può interrompere la ricerca.
    const relation=(book as any).profiles;
    const profile=(Array.isArray(relation)?relation[0]:relation) as {display_name?:string|null}|null|undefined;
    return {
      id:book.id,
      title:book.title,
      slug:book.slug,
      author:profile?.display_name??(locale==='en'?'Author':'Autore'),
      category:book.category??(locale==='en'?'Ebook':'Ebook'),
      coverUrl:coverUrl(book.cover_path),
    };
  });
  return NextResponse.json({suggestions});
}
