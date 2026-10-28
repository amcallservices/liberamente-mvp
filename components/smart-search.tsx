'use client';

import Link from 'next/link';
import {useEffect, useId, useState} from 'react';

type Suggestion={id:string;title:string;slug:string;author:string;category:string;coverUrl:string|null};

export function SmartSearch({className,defaultValue='',category}:{className?:string;defaultValue?:string;category?:string}){
  const [query,setQuery]=useState(defaultValue);
  const [suggestions,setSuggestions]=useState<Suggestion[]>([]);
  const [open,setOpen]=useState(false);
  const inputId=useId();

  useEffect(()=>{
    const value=query.trim();
    if(value.length<2){setSuggestions([]);setOpen(false);return;}
    const controller=new AbortController();
    const timer=window.setTimeout(async()=>{
      try{
        const response=await fetch(`/api/search-suggestions?q=${encodeURIComponent(value)}`,{signal:controller.signal});
        if(!response.ok)return;
        const data=await response.json() as {suggestions?:Suggestion[]};
        setSuggestions(data.suggestions??[]);
        setOpen(true);
      }catch(error){
        if((error as Error).name!=='AbortError')setSuggestions([]);
      }
    },180);
    return()=>{window.clearTimeout(timer);controller.abort();};
  },[query]);

  return <form className={className} action="/catalogo" role="search" onSubmit={()=>setOpen(false)}>
    <label className="sr-only" htmlFor={inputId}>Cerca nel catalogo</label>
    <input id={inputId} name="q" value={query} onChange={event=>setQuery(event.target.value)} onFocus={()=>query.trim().length>=2&&setOpen(true)} placeholder="Cerca per tema, autore o titolo" autoComplete="off" aria-autocomplete="list" aria-expanded={open}/>
    {category&&<input type="hidden" name="categoria" value={category}/>} 
    <button type="submit">Cerca</button>
    {open&&suggestions.length>0&&<div className="search-suggestions" aria-label="Ebook suggeriti">
      <p>Libri pertinenti</p>
      {suggestions.map(book=><Link key={book.id} href={`/ebook/${book.slug}`} onClick={()=>setOpen(false)}>
        {book.coverUrl?<img src={book.coverUrl} alt=""/>:<span className="search-cover-placeholder"/>}
        <span><strong>{book.title}</strong><small>di {book.author} · {book.category}</small></span>
      </Link>)}
      <button type="submit" className="show-all-results">Vedi tutti i risultati per “{query}”</button>
    </div>}
  </form>;
}
