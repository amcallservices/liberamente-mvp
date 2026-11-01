'use client';

import {FormEvent,useState} from 'react';
import {useRouter} from 'next/navigation';

const maxBytes=8*1024*1024;
type Block={id:string;heading:string;status:string;moderation_note?:string|null;created_at:string};
const labels:Record<string,string>={approved:'Approvato',pending_review:'In revisione',rejected:'Da correggere',draft:'Bozza'};

async function dimensions(file:File){
 const url=URL.createObjectURL(file);
 try{const image=new Image();await new Promise<void>((resolve,reject)=>{image.onload=()=>resolve();image.onerror=()=>reject(new Error('Immagine non leggibile.'));image.src=url});return {width:image.naturalWidth,height:image.naturalHeight}}finally{URL.revokeObjectURL(url)}
}

export function APlusEditor({bookId,blocks}:{bookId:string;blocks:Block[]}){
 const router=useRouter(),[message,setMessage]=useState(''),[busy,setBusy]=useState(false),[busyBlock,setBusyBlock]=useState<string|null>(null),[files,setFiles]=useState<File[]>([]),[previews,setPreviews]=useState<string[]>([]);
 function clearSelection(form?:HTMLFormElement){previews.forEach(url=>URL.revokeObjectURL(url));setFiles([]);setPreviews([]);form?.reset()}
 function selectImages(next:File[]){previews.forEach(url=>URL.revokeObjectURL(url));setFiles(next);setPreviews(next.map(file=>URL.createObjectURL(file)))}
 async function submit(event:FormEvent<HTMLFormElement>){
  event.preventDefault();const form=event.currentTarget,formData=new FormData(form),imageTitles=formData.getAll('imageTitles').map(String).map(title=>title.trim());
  if(files.length<1||files.length>4||imageTitles.length!==files.length||imageTitles.some(title=>title.length<2||title.length>140)){setMessage('Inserisci un titolo per ogni immagine caricata.');return}
  for(const file of files){if(!['image/jpeg','image/png'].includes(file.type)||file.size>maxBytes){setMessage('Ogni immagine deve essere PNG o JPEG e non superare 8 MB.');return}const size=await dimensions(file);if(size.width<970||size.height<600){setMessage('Ogni immagine A+ deve misurare almeno 970 × 600 pixel.');return}}
  setBusy(true);setMessage('Caricamento delle immagini A+…');
  try{const blockId=crypto.randomUUID(),paths:string[]=[];for(const [index,file] of files.entries()){const prepared=await fetch(`/api/books/${bookId}/a-plus-upload`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({blockId,index,contentType:file.type})}),target=await prepared.json();if(!prepared.ok)throw new Error(target.error||'Impossibile preparare il caricamento.');const sent=await fetch(target.signedUrl,{method:'PUT',headers:{'Content-Type':file.type},body:file});if(!sent.ok)throw new Error('Caricamento di una delle immagini non riuscito.');paths.push(target.path)}const completed=await fetch(`/api/books/${bookId}/a-plus-complete`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({blockId,heading:'Galleria immagini A+',body:'Galleria di immagini di approfondimento del libro.',imageAlt:'Immagine del contenuto A+',imageTitles,paths})}),result=await completed.json();if(!completed.ok)throw new Error(result.error||'Impossibile salvare il modulo A+.');setMessage('Galleria A+ salvata come bozza. Puoi inviarla alla revisione quando sei pronto.');clearSelection(form);router.refresh()}catch(error){setMessage(error instanceof Error?error.message:'Errore durante il caricamento.')}finally{setBusy(false)}
 }
 async function manageBlock(blockId:string,action:'submit'|'delete'){
  if(action==='delete'&&!window.confirm('Eliminare definitivamente questa galleria A+?'))return;
  setBusyBlock(blockId);try{const endpoint=action==='submit'?'a-plus-submit':'a-plus-block',response=await fetch(`/api/books/${bookId}/${endpoint}`,{method:action==='submit'?'POST':'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({blockId})}),result=await response.json();if(!response.ok)throw new Error(result.error||'Operazione non riuscita.');setMessage(action==='submit'?'Galleria A+ inviata alla revisione.':'Galleria A+ eliminata definitivamente.');router.refresh()}catch(error){setMessage(error instanceof Error?error.message:'Operazione non riuscita.')}finally{setBusyBlock(null)}
 }
 return <section className="card a-plus-editor"><p className="eyebrow">Contenuti A+</p><h2>Galleria della pagina libro</h2><p className="muted">Carica da 1 a 4 immagini PNG/JPEG. Salvale come bozza, controllale e inviale alla revisione solo quando sono pronte.</p><form onSubmit={submit}><label>Immagini A+ <span className="muted">(da 1 a 4, PNG/JPEG, min. 970×600, max 8 MB ciascuna)</span></label><input name="images" type="file" accept="image/png,image/jpeg" multiple required disabled={busy} onChange={event=>selectImages(Array.from(event.target.files||[]).slice(0,4))}/>{files.length>0&&<div className="a-plus-image-previews">{files.map((file,index)=><figure key={`${file.name}-${index}`}><img src={previews[index]} alt="Anteprima dell’immagine A+"/><figcaption><label>Titolo immagine {index+1}<input name="imageTitles" required maxLength={140} placeholder="Scrivi il titolo dell’immagine"/></label></figcaption></figure>)}</div>}<button disabled={busy}>{busy?'Caricamento…':'Salva galleria A+ in bozza'}</button></form>{message&&<p className="notice">{message}</p>}<div className="a-plus-status-list"><strong>Gallerie già create</strong>{blocks.length?blocks.map(block=>{const canManage=['draft','rejected'].includes(block.status),loading=busyBlock===block.id;return <article key={block.id}><div><b>Contenuto A+</b><span className={`a-plus-status ${block.status}`}>{labels[block.status]||'Bozza'}</span></div>{block.moderation_note&&<p className="muted">Nota: {block.moderation_note}</p>}{canManage&&<div className="a-plus-draft-actions"><button type="button" disabled={loading} onClick={()=>manageBlock(block.id,'submit')}>{loading?'Attendi…':'Invia alla revisione'}</button><button type="button" className="button danger" disabled={loading} onClick={()=>manageBlock(block.id,'delete')}>Elimina galleria</button></div>}</article>}):<p className="muted">Non hai ancora caricato immagini A+ per questo libro.</p>}</div></section>
}
