import mammoth from 'mammoth';
import pdf from 'pdf-parse';
import {markReaderText,normaliseReaderText} from '@/lib/reader-format';

const previewCharacters=26000;
const previewFirstPage=20;
const previewLastPage=30;
const unavailablePreview='L’anteprima dalle pagine 20–30 non è disponibile perché questo ebook non raggiunge la pagina 20.';
const parsePdf=pdf as unknown as (buffer:Buffer,options?:{max?:number;pagerender?:(pageData:any)=>Promise<string>})=>Promise<{text:string;numpages?:number}>;
const convertWordToHtml=mammoth as unknown as {convertToHtml:(input:{buffer:Buffer})=>Promise<{value:string}>};

function clean(text:string){
  return normaliseReaderText(text).replace(/[ \t]{2,}/g,' ');
}

function decodeHtml(value:string){
  return value.replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>');
}

function htmlToReaderText(html:string){
  return clean(decodeHtml(html)
    .replace(/<h[1-6][^>]*>/gi,'\n\n# ')
    .replace(/<\/(h[1-6]|p|div|blockquote|ul|ol)[^>]*>/gi,'\n\n')
    .replace(/<li[^>]*>/gi,'\n• ')
    .replace(/<br\s*\/?>(\r?\n)?/gi,'\n')
    .replace(/<[^>]+>/g,''));
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

export async function extractEbookText(buffer:Buffer,mimeType?:string|null){
  try{
    const isPdf=mimeType==='application/pdf';
    const raw=isPdf
      ?(await parsePdf(buffer,{pagerender:renderPdfPage})).text
      :htmlToReaderText((await convertWordToHtml.convertToHtml({buffer})).value);
    const fullText=clean(raw);
    if(fullText.length<80)return null;
    // L'estratto pubblico è sempre composto dalle pagine 20–30 del PDF.
    // Per libri più brevi salviamo un avviso leggibile anziché un estratto vuoto.
    const extractedPreview=isPdf
      ?await extractPdfPages(buffer,previewFirstPage,previewLastPage)
      :fullText.slice(0,previewCharacters);
    const previewText=extractedPreview.length>=80?extractedPreview:unavailablePreview;
    return {fullText:markReaderText(fullText),previewText:markReaderText(previewText)};
  }catch(error){
    console.error('Estrazione testo ebook non riuscita',error);
    return null;
  }
}
