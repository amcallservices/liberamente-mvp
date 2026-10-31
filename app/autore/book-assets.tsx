'use client';

import {useState} from 'react';

type Props={bookId:string;hasManuscript:boolean;hasCover:boolean;status:string};
const limits={manuscript:25*1024*1024,cover:8*1024*1024};

export function BookAssets({bookId,hasManuscript,hasCover,status}:Props){
  const [message,setMessage]=useState('');
  const [busy,setBusy]=useState(false);

  const upload=async(kind:'manuscript'|'cover',file?:File)=>{
    if(!file)return;
    const isPdf=file.type==='application/pdf'||file.name.toLowerCase().endsWith('.pdf');
    const contentType=kind==='manuscript'&&isPdf?'application/pdf':file.type;
    if(kind==='manuscript'&&!isPdf){
      setMessage('Per garantire la qualità di lettura, il libro deve essere caricato in formato PDF.');
      return;
    }
    if(file.size>limits[kind]){
      setMessage(kind==='manuscript'?'Il file del libro supera 25 MB.':'La copertina supera 8 MB.');
      return;
    }
    setBusy(true);
    setMessage('Preparazione del caricamento…');
    try{
      const request=await fetch(`/api/books/${bookId}/upload-url`,{
        method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({kind,contentType}),
      });
      const target=await request.json();
      if(!request.ok)throw new Error(target.error);
      const sent=await fetch(target.signedUrl,{method:'PUT',headers:{'Content-Type':contentType},body:file});
      if(!sent.ok)throw new Error('Il caricamento non è riuscito. Riprova.');
      const saved=await fetch(`/api/books/${bookId}/complete-upload`,{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({kind,path:target.path,fileName:file.name,contentType,size:file.size}),
      });
      const result=await saved.json();
      if(!saved.ok)throw new Error(result.error);
      if(kind==='manuscript'){
        setMessage(result.readingReady
          ?'PDF caricato e verificato: il testo è leggibile per anteprima e lettura online. Aggiorna la pagina per attivare l’anteprima.'
          :`PDF caricato, ma non è leggibile per anteprima e lettura online: ${result.readingWarning??'non contiene testo selezionabile.'} Il file resta salvato; ricarica un PDF esportato dal documento originale con testo selezionabile.`);
      }else setMessage('Copertina caricata. Aggiorna la pagina per vederne lo stato.');
    }catch(error){
      setMessage(error instanceof Error?error.message:'Errore di caricamento.');
    }finally{
      setBusy(false);
    }
  };

  const editable=['draft','rejected'].includes(status);
  return <section className="assets">
    <p><strong>Materiali editoriali</strong></p>
    <label>File del libro (solo PDF, max 25 MB)</label>
    <input type="file" accept="application/pdf,.pdf" disabled={!editable||busy} onChange={e=>upload('manuscript',e.target.files?.[0])}/>
    <small>{hasManuscript?'PDF caricato':'Da caricare'} · Il PDF mantiene la grafica originale nella lettura online.</small>
    <label>Copertina (PNG o JPEG, max 8 MB)</label>
    <input type="file" accept="image/png,image/jpeg" disabled={!editable||busy} onChange={e=>upload('cover',e.target.files?.[0])}/>
    <small>{hasCover?'Caricata':'Da caricare'}</small>
    {message&&<p className="notice">{message}</p>}
    {!editable&&<p className="muted">Il titolo è in revisione o già pubblicato: non può essere modificato.</p>}
  </section>;
}
