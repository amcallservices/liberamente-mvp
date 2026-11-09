import {describe,expect,it} from 'vitest';
import {PDFDocument,PDFName,StandardFonts} from 'pdf-lib';
import {createPreviewPdf} from '@/lib/preview-pdf';

// PNG 1×1 rosso: basta per verificare che le immagini vengano conservate.
const PNG='iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';

async function sampleBook(pages:number){
  const doc=await PDFDocument.create(),font=await doc.embedFont(StandardFonts.Helvetica),image=await doc.embedPng(Buffer.from(PNG,'base64'));
  for(let number=1;number<=pages;number++){
    const page=doc.addPage([400,600]);
    page.drawText(`Pagina ${number}`,{x:40,y:540,size:18,font});
    page.drawImage(image,{x:40,y:300,width:120,height:120});
  }
  return Buffer.from(await doc.save());
}

async function imageCount(bytes:Uint8Array){
  const doc=await PDFDocument.load(bytes);
  return [...doc.context.enumerateIndirectObjects()].filter(([,object])=>(object as any).dict?.get(PDFName.of('Subtype'))===PDFName.of('Image')).length;
}

describe('anteprima impaginata dal PDF originale',()=>{
  it('estrae le pagine 20–30 e conserva le immagini',async()=>{
    const bytes=await createPreviewPdf(await sampleBook(40));
    expect(bytes).not.toBeNull();
    const preview=await PDFDocument.load(bytes!);
    expect(preview.getPageCount()).toBe(11);
    expect(await imageCount(bytes!)).toBeGreaterThan(0);
  });

  it('con un libro più corto si ferma all’ultima pagina disponibile',async()=>{
    const bytes=await createPreviewPdf(await sampleBook(25));
    expect((await PDFDocument.load(bytes!)).getPageCount()).toBe(6);
  });

  it('non crea l’anteprima se il libro non raggiunge la pagina 20',async()=>{
    expect(await createPreviewPdf(await sampleBook(19))).toBeNull();
  });

  it('estrae una singola pagina (lettore Plus)',async()=>{
    const bytes=await createPreviewPdf(await sampleBook(12),7,7);
    expect((await PDFDocument.load(bytes!)).getPageCount()).toBe(1);
    expect(await imageCount(bytes!)).toBeGreaterThan(0);
  });

  it('restituisce null se il file non è un PDF valido',async()=>{
    expect(await createPreviewPdf(Buffer.from('non è un pdf'))).toBeNull();
  });
});
