'use client';

import {useState} from 'react';

/** On phones only the first genres are shown; this button reveals the rest (see catalog.css). */
export function GenresToggle({total,label,closeLabel,children}:{total:number;label:string;closeLabel:string;children:React.ReactNode}){
  const [open,setOpen]=useState(false);
  return <div className={`lm-genrewrap${open?' is-open':''}`}>
    {children}
    {total>6&&<button type="button" className="lm-genretoggle" aria-expanded={open} onClick={()=>setOpen(o=>!o)}>{open?closeLabel:`${label} (${total})`} <span aria-hidden="true">{open?'−':'+'}</span></button>}
  </div>;
}
