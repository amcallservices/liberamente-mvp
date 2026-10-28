import mammoth from 'mammoth';
import pdf from 'pdf-parse';
import {markReaderText,normaliseReaderText} from '@/lib/reader-format';

const previewCharacters=26000;

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

export async function extractEbookText(buffer:Buffer,mimeType?:string|null){
  try{
    const isPdf=mimeType==='application/pdf';
    const raw=isPdf
      ?(await pdf(buffer,{pagerender:renderPdfPage})).text
      :htmlToReaderText((await mammoth.convertToHtml({buffer})).value);
    const fullText=clean(raw);
    if(fullText.length<80)return null;
    // Per i PDF vengono conservate righe e distanze tra paragrafi: l'estratto
    // contiene le prime dieci pagine, mentre Word conserva un equivalente sicuro.
    const previewText=isPdf?clean((await pdf(buffer,{max:10,pagerender:renderPdfPage})).text):fullText.slice(0,previewCharacters);
    return {fullText:markReaderText(fullText),previewText:markReaderText(previewText.length>=80?previewText:fullText.slice(0,previewCharacters))};
  }catch(error){
    console.error('Estrazione testo ebook non riuscita',error);
    return null;
  }
}
