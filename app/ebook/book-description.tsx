'use client';
import {useState} from 'react';

/** Long descriptions are folded after a few paragraphs so the purchase stays in view. */
export function BookDescription({text,english}:{text:string;english:boolean}){
  const [open,setOpen]=useState(false);
  const long=text.length>600;
  return <div className={`lm-bp__desc${long&&!open?' is-folded':''}`}>
    <p>{text}</p>
    {long&&<button type="button" className="lm-bp__more" aria-expanded={open} onClick={()=>setOpen(o=>!o)}>{open?(english?'Show less':'Mostra meno'):(english?'Read the full description':'Leggi tutta la descrizione')} <span aria-hidden="true">{open?'↑':'↓'}</span></button>}
  </div>;
}
