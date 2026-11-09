'use client';

import {useState} from 'react';

/** On phones the filter form is folded behind one button; on wider screens it is always shown (see catalog.css). */
export function FiltersToggle({label,active=0,initiallyOpen=false,children}:{label:string;active?:number;initiallyOpen?:boolean;children:React.ReactNode}){
  const [open,setOpen]=useState(initiallyOpen);
  return <div className={`lm-filterwrap${open?' is-open':''}`}>
    <button type="button" className="lm-filtertoggle" aria-expanded={open} aria-controls="lm-filters" onClick={()=>setOpen(o=>!o)}>
      <span>{label}{active>0&&<em> · {active}</em>}</span><span aria-hidden="true">{open?'−':'+'}</span>
    </button>
    <div id="lm-filters" className="lm-filterwrap__body">{children}</div>
  </div>;
}
