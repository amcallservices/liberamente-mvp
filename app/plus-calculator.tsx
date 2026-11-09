'use client';

import {useState} from 'react';
import {eur} from '@/lib/money';

export function PlusCalculator({averageCents,english=false}:{averageCents:number;english?:boolean}){
  const [count,setCount]=useState(3);
  return <div className="lm-calc">
    <label htmlFor="lm-books-per-month">{english?'How many books do you read a month?':'Quanti libri leggi al mese?'} <span className="lm-calc__n">{count}</span></label>
    <input id="lm-books-per-month" type="range" min={1} max={8} step={1} value={count} onChange={e=>setCount(Number(e.target.value))}/>
    <div className="lm-calc__grid">
      <div><p>{english?'Buying them one by one':'Comprandoli uno a uno'}</p><p className="lm-calc__fig">{eur(count*averageCents)}</p></div>
      <div><p>{english?'With Plus':'Con Plus'}</p><p className="lm-calc__fig lm-calc__fig--gold">4,99 €</p></div>
    </div>
    <p className="lm-calc__note">{english?`Estimate based on the average price of the best sellers (${eur(averageCents)}), for titles included in Plus.`:`Stima sul prezzo medio dei più venduti (${eur(averageCents)}), per i titoli aderenti a Plus.`}</p>
  </div>;
}
