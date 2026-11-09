import React from 'react';
import {beforeEach,describe,expect,it,vi} from 'vitest';
import {renderToString} from 'react-dom/server';
import {markReaderText} from '@/lib/reader-format';

(globalThis as any).React=React;

const book={id:'b1',title:'Professione cuoco',slug:'professione-cuoco',cover_path:null,author_id:'a1',file_path:'a1/b1/manuscript.pdf',file_mime_type:'application/pdf'};
const purchase={id:'p1',book_id:'b1',status:'paid',gross_cents:999,created_at:'2026-11-01T10:00:00Z'};
const reading=markReaderText('Capitolo uno\n\nTesto di prova del libro acquistato.');
const state=vi.hoisted(()=>({rows:[] as any[],hidden:[] as any[]}));

const chain=(result:any)=>{const o:any=new Proxy(function(){},{get:(_t,p)=>p==='then'?(res:any)=>res(result):()=>o});return o};

vi.mock('@/lib/supabase/server',()=>({createClient:async()=>({
  auth:{getUser:async()=>({data:{user:{id:'u1'}}})},
  from:(table:string)=>chain(table==='purchases'?{data:state.rows}:table==='book_reading_content'?{data:[{book_id:'b1',full_text:reading}]}:{data:[]}),
})}));
vi.mock('@/lib/supabase/admin',()=>({admin:()=>({
  from:(table:string)=>chain(table==='books'?{data:state.hidden}:{data:{book_id:'b1',full_text:reading}}),
  storage:{from:()=>({download:async()=>({data:null})})},
})}));

async function renderLibrary(){
  const {default:Reader}=await import('@/app/lettore/page');
  return renderToString(await Reader({searchParams:Promise.resolve({})}) as any);
}

beforeEach(()=>{state.rows=[];state.hidden=[]});

describe('Area lettori: libreria degli acquisti',()=>{
  it('mostra il libro acquistato',async()=>{
    state.rows=[{...purchase,books:book}];
    const html=await renderLibrary();
    expect(html).toContain('Professione cuoco');
  });

  it('non va in errore se il libro non è più leggibile dal compratore e lo mostra comunque',async()=>{
    state.rows=[{...purchase,books:null}];
    state.hidden=[book];
    const html=await renderLibrary();
    expect(html).toContain('Professione cuoco');
  });

  it('non va in errore nemmeno se i dati del libro non sono recuperabili',async()=>{
    state.rows=[{...purchase,books:null}];
    const html=await renderLibrary();
    expect(html).toContain('Acquistato');
  });

  it('un acquisto problematico non nasconde gli altri libri',async()=>{
    state.rows=[{...purchase,id:'p0',book_id:'b0',books:null},{...purchase,books:book}];
    const html=await renderLibrary();
    expect(html).toContain('Professione cuoco');
  });
});
