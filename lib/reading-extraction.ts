import mammoth from 'mammoth';
import pdf from 'pdf-parse';

const previewCharacters=26000;

function clean(text:string){
  return text.replace(/\r/g,'').replace(/\n{3,}/g,'\n\n').replace(/[ \t]{2,}/g,' ').trim();
}

export async function extractEbookText(buffer:Buffer,mimeType?:string|null){
  try{
    const isPdf=mimeType==='application/pdf';
    const raw=isPdf
      ?(await pdf(buffer)).text
      :(await mammoth.extractRawText({buffer})).value;
    const fullText=clean(raw);
    if(fullText.length<80)return null;
    // Per i PDF il parser rispetta le prime dieci pagine; per Word, che non ha
    // pagine strutturali, conserviamo un estratto di lunghezza equivalente.
    const previewText=isPdf?clean((await pdf(buffer,{max:10})).text):fullText.slice(0,previewCharacters);
    return {fullText,previewText:previewText.length>=80?previewText:fullText.slice(0,previewCharacters)};
  }catch(error){
    console.error('Estrazione testo ebook non riuscita',error);
    return null;
  }
}
