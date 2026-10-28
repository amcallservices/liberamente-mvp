import {NextResponse} from 'next/server';

// Endpoint precedente, mantenuto solo per restituire un messaggio esplicito.
// Tutti i manoscritti passano ora dal flusso autenticato dell'Area autori,
// che accetta esclusivamente PDF e controlla lo stato editoriale del libro.
export async function POST(){
  return NextResponse.json(
    {error:'Questo metodo non è più disponibile. Carica il manoscritto PDF dall’Area autori.'},
    {status:410},
  );
}
