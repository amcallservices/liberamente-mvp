'use client';
import {useState} from 'react';
import {BOOK_CATEGORIES} from '@/lib/categories';
export function CategoryPicker(){const [values,setValues]=useState(['','','']);return <fieldset className="category-picker"><legend>Categorie <span className="muted">(scegline da 1 a 3)</span></legend>{values.map((value,index)=><select key={index} name="categories" value={value} onChange={e=>setValues(values.map((v,i)=>i===index?e.target.value:v))} required={index===0}><option value="">{index===0?'Scegli la categoria principale':'Categoria aggiuntiva (facoltativa)'}</option>{BOOK_CATEGORIES.filter(category=>category===value||!values.includes(category)).map(category=><option key={category} value={category}>{category}</option>)}</select>)}</fieldset>}
