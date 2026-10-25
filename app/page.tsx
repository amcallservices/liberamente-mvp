import Link from 'next/link';
import {createClient} from '@/lib/supabase/server';
import {coverUrl} from '@/lib/covers';
import {eur} from '@/lib/money';

export default async function Home(){
  const supabase=await createClient();
  const {data}=await supabase.from('books').select('id,title,slug,description,category,price_cents,cover_path,profiles!books_author_id_fkey(display_name)').eq('status','published').order('published_at',{ascending:false}).limit(6);
  const books=data??[];
  return <>
    <section className="hero"><main className="wrap hero-grid"><div><p className="eyebrow">Marketplace editoriale italiano</p><h1>Storie indipendenti, da leggere davvero.</h1><p className="hero-copy">Scopri ebook selezionati da autori indipendenti. Acquista con carta o PayPal e ritrovali sempre nella tua libreria.</p><p><Link className="button" href="/catalogo">Esplora il catalogo</Link> <Link className="button alt" href="/autore">Pubblica il tuo ebook</Link></p></div><aside className="hero-note"><strong>Per autori</strong><span>Carica il manoscritto, invialo in revisione e monitora vendite e royalty.</span><small>Royalty del 50% · pagamenti ogni 60 giorni</small></aside></main></section>
    <main className="wrap"><div className="section-heading"><div><p className="eyebrow">In evidenza</p><h2>Gli ebook più recenti</h2></div><Link className="text-link" href="/catalogo">Vedi tutto il catalogo →</Link></div>{books.length?<div className="grid catalogue home-catalogue">{books.map((book:any)=>{const image=coverUrl(book.cover_path);return <article className="card book-card" key={book.id}>{image?<img className="cover-image" src={image} alt={`Copertina di ${book.title}`}/>:<div className="cover">Copertina in arrivo</div>}<p className="eyebrow">{book.category||'Ebook'}</p><p className="muted">di {book.profiles?.display_name||'Autore indipendente'}</p><h3>{book.title}</h3><p className="clamp">{book.description}</p><div className="card-footer"><span className="price">{eur(book.price_cents)}</span><Link className="text-link" href={`/ebook/${book.slug}`}>Scopri →</Link></div></article>})}</div>:<div className="empty"><h2>La libreria sta prendendo forma</h2><p>I primi ebook approvati saranno disponibili qui a breve.</p><Link className="button" href="/autore">Invia un ebook alla revisione</Link></div>}<section className="benefits"><article><strong>Acquista con fiducia</strong><span>Pagamento sicuro con carta o PayPal.</span></article><article><strong>La tua libreria</strong><span>I tuoi acquisti restano disponibili nel tuo account.</span></article><article><strong>Autori al centro</strong><span>50% di royalty per ogni vendita non rimborsata.</span></article></section></main>
  </>;
}
