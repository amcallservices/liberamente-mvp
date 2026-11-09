import {beforeEach,describe,expect,it,vi} from 'vitest';
import {PDFDocument} from 'pdf-lib';

const storage={list:vi.fn(),createSignedUrl:vi.fn(),download:vi.fn(),upload:vi.fn(),remove:vi.fn()};
vi.mock('@/lib/supabase/admin',()=>({admin:()=>({storage:{from:()=>storage}})}));

import {ensurePreviewPdfUrl} from '@/lib/preview-pdf';

const book={id:'libro',author_id:'autore',file_path:'autore/libro/manuscript.pdf',file_mime_type:'application/pdf'};
async function pdfWithPages(count:number){const doc=await PDFDocument.create();for(let i=0;i<count;i++)doc.addPage([300,400]);return Buffer.from(await doc.save());}

beforeEach(()=>Object.values(storage).forEach(fn=>fn.mockReset()));

describe('creazione automatica dell’anteprima impaginata',()=>{
  it('usa quella esistente senza scaricare il libro',async()=>{
    storage.list.mockResolvedValue({data:[{name:'preview.pdf'}]});
    storage.createSignedUrl.mockResolvedValue({data:{signedUrl:'https://esempio/anteprima'},error:null});
    expect(await ensurePreviewPdfUrl({...book,pageCount:40})).toBe('https://esempio/anteprima');
    expect(storage.download).not.toHaveBeenCalled();
  });

  it('la crea alla prima visita se manca (libri già pubblicati)',async()=>{
    storage.list.mockResolvedValueOnce({data:[]}).mockResolvedValueOnce({data:[{name:'preview.pdf'}]});
    storage.download.mockResolvedValue({data:new Blob([await pdfWithPages(35)])});
    storage.upload.mockResolvedValue({error:null});
    storage.createSignedUrl.mockResolvedValue({data:{signedUrl:'https://esempio/nuova'},error:null});
    expect(await ensurePreviewPdfUrl({...book,id:'libro-2',pageCount:35})).toBe('https://esempio/nuova');
    expect(storage.upload).toHaveBeenCalledTimes(1);
    expect(storage.upload.mock.calls[0][0]).toBe('autore/libro-2/preview.pdf');
  });

  it('non scarica nulla per i libri sotto le 20 pagine',async()=>{
    storage.list.mockResolvedValue({data:[]});
    expect(await ensurePreviewPdfUrl({...book,id:'libro-3',pageCount:12})).toBeNull();
    expect(storage.download).not.toHaveBeenCalled();
  });

  it('se la creazione fallisce restituisce null e non riprova subito',async()=>{
    storage.list.mockResolvedValue({data:[]});
    storage.download.mockResolvedValue({data:null});
    expect(await ensurePreviewPdfUrl({...book,id:'libro-4',pageCount:40})).toBeNull();
    expect(await ensurePreviewPdfUrl({...book,id:'libro-4',pageCount:40})).toBeNull();
    expect(storage.download).toHaveBeenCalledTimes(1);
  });
});
