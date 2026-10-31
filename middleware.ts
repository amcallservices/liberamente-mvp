import {createServerClient} from '@supabase/ssr';import {NextResponse,type NextRequest} from 'next/server';
export async function middleware(request:NextRequest){
  const english=request.nextUrl.pathname==='/en'||request.nextUrl.pathname.startsWith('/en/');
  const destination=english?request.nextUrl.clone():null;
  if(destination){destination.pathname=request.nextUrl.pathname==='/en'?'/' : request.nextUrl.pathname.replace(/^\/en/,'');destination.searchParams.set('market','en');}
  const createResponse=()=>destination?NextResponse.rewrite(destination):NextResponse.next({request});
  let response=createResponse();
  const s=createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,{cookies:{getAll:()=>request.cookies.getAll(),setAll:(items:Array<{name:string;value:string;options:any}>)=>{items.forEach(({name,value})=>request.cookies.set(name,value));response=createResponse();items.forEach(({name,value,options})=>response.cookies.set(name,value,options))}}});await s.auth.getUser();return response
}
export const config={matcher:['/((?!_next/static|_next/image|favicon.ico).*)']};
