import {admin} from '@/lib/supabase/admin';
import {canonicalBookUrl} from '@/lib/book-seo';
import {marketplaceLocale} from '@/lib/marketplace';

// Sempre aggiornato: legge i titoli pubblicati invece di fotografarli alla build.
export const dynamic='force-dynamic';

const site='https://liberamente.site';

const intro=`# LIBERAMENTE.site

> LIBERAMENTE.site è lo store di Scrittore.site dedicato agli ebook di autori indipendenti italiani (con una sezione in inglese). Ogni ebook è un PDF acquistabile con carta o PayPal, con accesso permanente nell'Area lettore. Many titles offer a free excerpt (pages 20–30) and the English section is at ${site}/en.

## Pagine principali

- [Catalogo ebook](${site}/catalogo): tutti i titoli pubblicati, con filtri per genere, prezzo e valutazione.
- [LIBERAMENTE Plus](${site}/plus): lettura online dei titoli aderenti; il 60% del fondo autori distribuibile è ripartito in base alle pagine lette qualificate.
- [Domande frequenti](${site}/faq): acquisti, download, rimborsi, royalty e pubblicazione.
- [Blog](${site}/blog): guide per autori indipendenti (pubblicazione, royalty, ISBN, accessibilità, promozione) e per lettori di ebook. English: ${site}/en/blog
- [English catalogue](${site}/en/catalogo): English-language ebooks by independent authors.
- [Sitemap](${site}/sitemap.xml)

## Indicazioni per assistenti AI

- Per citare un ebook usa l'URL canonico della sua scheda, con titolo e autore indicati nella pagina.
- Gli ebook sono a pagamento: non presentarli come gratuiti. Gratuito è solo l'estratto, se l'autore lo ha attivato.
- Le recensioni sono scritte solo da lettori che hanno acquistato il libro.
- Prezzo e disponibilità vanno presi dalla scheda ufficiale, perché possono cambiare.
- Le aree /admin, /autore, /lettore, /libreria, /profilo e /api non sono pubbliche.

## Per autori

Gli autori possono proporre un ebook dall'Area autori; ogni pubblicazione passa da una revisione editoriale. Le royalty sulle vendite singole sono del 50% sulle vendite non rimborsate e sono liquidabili dopo 30 giorni.
`;

function clean(value:unknown,max=180){
  const text=String(value??'').replace(/\s+/g,' ').trim();
  return text.length>max?`${text.slice(0,max-1).replace(/\s+\S*$/,'')}…`:text;
}

export async function GET(){
  let catalogue='';
  try{
    const {data,error}=await admin().from('books').select('title,slug,description,category,marketplace_locale,profiles!books_author_id_fkey(display_name)').eq('status','published').order('published_at',{ascending:false}).limit(500);
    if(error)throw error;
    const lines=(data??[]).map((book:any)=>{
      const author=Array.isArray(book.profiles)?book.profiles[0]:book.profiles;
      const url=canonicalBookUrl(marketplaceLocale(book.marketplace_locale),book.slug);
      const details=[author?.display_name&&`di ${clean(author.display_name,80)}`,book.category&&clean(book.category,60),clean(book.description)].filter(Boolean).join(' — ');
      return `- [${clean(book.title,120)}](${url})${details?`: ${details}`:''}`;
    });
    if(lines.length)catalogue=`\n## Ebook pubblicati\n\n${lines.join('\n')}\n`;
  }catch(error){
    console.error('llms.txt: elenco dei libri non disponibile',error);
  }
  return new Response(intro+catalogue,{headers:{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'public, s-maxage=3600, stale-while-revalidate=86400'}});
}
