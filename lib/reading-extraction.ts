import pdf from 'pdf-parse';
import {markReaderText,normaliseReaderText} from '@/lib/reader-format';

const previewFirstPage=20;
const previewLastPage=30;
const unavailablePreview='L’anteprima dalle pagine 20–30 non è disponibile perché questo ebook non raggiunge la pagina 20.';
const parsePdf=pdf as unknown as (buffer:Buffer,options?:{max?:number;pagerender?:(pageData:any)=>Promise<string>})=>Promise<{text:string;numpages?:number}>;

export type EbookTextAnalysis=
  | {ok:true;fullText:string;previewText:string}
  | {ok:false;reason:'not_pdf'|'unreadable'|'too_short'};

function clean(text:string){
  return normaliseReaderText(text).replace(/[ \t]{2,}/g,' ');
}

async function renderPdfPage(pageData:any){
  const content=await pageData.getTextContent({normalizeWhitespace:false,disableCombineTextItems:false});
  const lines:{y:number;height:number;parts:string[]}[]=[];
  for(const item of content.items as Array<{str?:string;transform?:number[]}>){
    const text=item.str?.replace(/\s+/g,' ').trim();
    if(!text)continue;
    const y=item.transform?.[5]??0,height=Math.abs(item.transform?.[3]??10),previous=lines[lines.length-1];
    if(previous&&Math.abs(previous.y-y)<=Math.max(2,previous.height*.34))previous.parts.push(text);
    else lines.push({y,height,parts:[text]});
  }
  const output:string[]=[];
  for(let index=0;index<lines.length;index++){
    const line=lines[index],previous=lines[index-1];
    if(previous&&Math.abs(previous.y-line.y)>Math.max(15,Math.max(previous.height,line.height)*1.55))output.push('');
    output.push(line.parts.join(' '));
  }
  return `${output.join('\n')}\n\n`;
}

async function extractPdfPages(buffer:Buffer,fromPage:number,toPage:number){
  let currentPage=0;
  const extracted=await parsePdf(buffer,{max:toPage,pagerender:async(pageData:any)=>{
    currentPage+=1;
    const pageText=await renderPdfPage(pageData);
    return currentPage>=fromPage&&currentPage<=toPage?pageText:'';
  }});
  return clean(extracted.text);
}

/** Estrae una sola pagina PDF per la lettura protetta di LIBERAMENTE Plus. */
export async function extractPdfPage(buffer:Buffer,pageNumber:number){
  const requestedPage=Math.max(1,Math.floor(pageNumber));
  return extractPdfPages(buffer,requestedPage,requestedPage);
}

/** Restituisce il numero di pagine dichiarato dal PDF, senza dipendere dal testo estraibile. */
export async function getPdfPageCount(buffer:Buffer){
  try{
    const parsed=await parsePdf(buffer);
    const count=Number(parsed.numpages);
    return Number.isSafeInteger(count)&&count>0?count:null;
  }catch(error){
    console.error('Conteggio pagine PDF non riuscito',error);
    return null;
  }
}

function isPdfDocument(buffer:Buffer,mimeType?:string|null){
  return mimeType==='application/pdf'||buffer.subarray(0,5).toString('ascii')==='%PDF-';
}

/**
 * Analizza un PDF appena caricato. Un file può essere un PDF valido ma non
 * leggibile dal lettore web: tipicamente è una scansione composta da immagini.
 */
export async function analyzeEbookText(buffer:Buffer,mimeType?:string|null):Promise<EbookTextAnalysis>{
  if(!isPdfDocument(buffer,mimeType))return {ok:false,reason:'not_pdf'};
  try{
    const raw=(await parsePdf(buffer,{pagerender:renderPdfPage})).text;
    const fullText=clean(raw);
    if(!fullText.length)return {ok:false,reason:'unreadable'};
    if(fullText.length<80)return {ok:false,reason:'too_short'};
    // L'estratto pubblico è sempre composto dalle pagine 20–30 del PDF.
    // Per libri più brevi salviamo un avviso leggibile anziché un estratto vuoto.
    const extractedPreview=await extractPdfPages(buffer,previewFirstPage,previewLastPage);
    const previewText=extractedPreview.length>=80?extractedPreview:unavailablePreview;
    return {ok:true,fullText:markReaderText(fullText),previewText:markReaderText(previewText)};
  }catch(error){
    console.error('Estrazione testo ebook non riuscita',error);
    return {ok:false,reason:'unreadable'};
  }
}

/** Compatibilità con i processi già presenti che richiedono soltanto il testo. */
export async function extractEbookText(buffer:Buffer,mimeType?:string|null){
  const result=await analyzeEbookText(buffer,mimeType);
  return result.ok?{fullText:result.fullText,previewText:result.previewText}:null;
}
