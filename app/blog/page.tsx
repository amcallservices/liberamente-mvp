import type {Metadata} from 'next';
import Link from 'next/link';
import {marketplaceLocale,marketplacePath} from '@/lib/marketplace';
import {localizedAlternates,siteUrl} from '@/lib/seo';
import {blogPath,blogPosts,formatBlogDate,readingMinutes,type BlogAudience} from '@/lib/blog';

type Search={market?:string;per?:string};

const copy={
  it:{title:'Il blog di LIBERAMENTE',heading:'Il blog per chi legge e chi scrive.',intro:'Guide pratiche e aggiornate per pubblicare il tuo ebook da indipendente, e idee per trovare la prossima lettura.',metaTitle:'Blog: guide per autori indipendenti e lettori di ebook',meta:'Guide aggiornate per pubblicare un ebook, royalty, ISBN, accessibilità e promozione, più consigli per lettori di ebook di autori indipendenti.',all:'Tutti gli articoli',authors:'Per chi scrive',readers:'Per chi legge',min:'min di lettura',read:'Leggi l’articolo',filter:'Filtra gli articoli'},
  en:{title:'The LIBERAMENTE blog',heading:'The blog for readers and writers.',intro:'Practical, up-to-date guides to publishing your ebook independently, and ideas for finding your next read.',metaTitle:'Blog: guides for independent authors and ebook readers',meta:'Up-to-date guides on publishing an ebook, royalties, ISBNs, accessibility and promotion, plus tips for readers of independent ebooks.',all:'All articles',authors:'For writers',readers:'For readers',min:'min read',read:'Read the article',filter:'Filter the articles'}
};

const audienceParam:Record<string,BlogAudience>={autori:'authors',lettori:'readers',authors:'authors',readers:'readers'};

export async function generateMetadata({searchParams}:{searchParams:Promise<Search>}):Promise<Metadata>{
  const {market,per}=await searchParams;
  const locale=marketplaceLocale(market),t=copy[locale];
  const alternates=localizedAlternates('/blog',locale);
  return {
    title:t.metaTitle,description:t.meta,alternates,
    // Filtered views are useful to visitors but duplicate the index for search engines.
    robots:per?{index:false,follow:true}:undefined,
    openGraph:{type:'website',locale:locale==='en'?'en_US':'it_IT',url:`${siteUrl}${blogPath(locale)}`,siteName:'LIBERAMENTE.site',title:`${t.metaTitle} | LIBERAMENTE.site`,description:t.meta,images:[{url:'/liberamente-logo.png',alt:'LIBERAMENTE.site'}]},
  };
}

export default async function BlogIndex({searchParams}:{searchParams:Promise<Search>}){
  const {market,per}=await searchParams;
  const locale=marketplaceLocale(market),t=copy[locale],english=locale==='en';
  const audience=per?audienceParam[per]:undefined;
  const all=blogPosts(locale);
  const posts=audience?all.filter(post=>post.audience===audience):all;
  const [lead,...rest]=posts;
  const filters=[{label:t.all,href:blogPath(locale),on:!audience},{label:t.authors,href:`${blogPath(locale)}?per=${english?'authors':'autori'}`,on:audience==='authors'},{label:t.readers,href:`${blogPath(locale)}?per=${english?'readers':'lettori'}`,on:audience==='readers'}];
  const structured={'@context':'https://schema.org','@type':'Blog',name:t.title,url:`${siteUrl}${blogPath(locale)}`,inLanguage:english?'en':'it-IT',publisher:{'@type':'Organization',name:'LIBERAMENTE.site',logo:{'@type':'ImageObject',url:`${siteUrl}/liberamente-logo.png`}},blogPost:all.map(post=>({'@type':'BlogPosting',headline:post.title,url:`${siteUrl}${blogPath(locale,post.slug)}`,datePublished:post.published,dateModified:post.updated}))};
  return <main className="lm-blog">
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(structured)}}/>
    <div className="lm-wrap">
      <div className="lm-blog__head">
        <p className="lm-blog__kicker">{t.title}</p>
        <h1>{t.heading}</h1>
        <p className="lm-blog__intro">{t.intro}</p>
      </div>
      <nav className="lm-blog__filters" aria-label={t.filter}>
        {filters.map(filter=><Link key={filter.href} href={filter.href} className={filter.on?'is-active':''} aria-current={filter.on?'page':undefined}>{filter.label}</Link>)}
      </nav>
      {lead&&<article className="lm-blog__lead">
        <p className="lm-blog__meta">{lead.audience==='authors'?t.authors:t.readers} · {formatBlogDate(lead.published,locale)} · {readingMinutes(lead)} {t.min}</p>
        <h2><Link href={blogPath(locale,lead.slug)}>{lead.title}</Link></h2>
        <p>{lead.excerpt}</p>
        <Link className="lm-btn lm-btn--ink" href={blogPath(locale,lead.slug)}>{t.read} <span aria-hidden="true">→</span></Link>
      </article>}
      <div className="lm-blog__grid">
        {rest.map(post=><article className="lm-blog__card" key={post.id}>
          <p className="lm-blog__meta">{post.audience==='authors'?t.authors:t.readers} · {readingMinutes(post)} {t.min}</p>
          <h2><Link href={blogPath(locale,post.slug)}>{post.title}</Link></h2>
          <p>{post.excerpt}</p>
          <Link className="lm-blog__more" href={blogPath(locale,post.slug)}>{t.read} <span aria-hidden="true">→</span></Link>
        </article>)}
      </div>
      <p className="lm-blog__cta">{english?<>Looking for something to read? <Link href={marketplacePath(locale,'/catalogo')}>Browse the catalogue</Link> · Want to publish? <Link href={marketplacePath(locale,'/autore')}>Open the author area</Link></>:<>Cerchi qualcosa da leggere? <Link href={marketplacePath(locale,'/catalogo')}>Esplora il catalogo</Link> · Vuoi pubblicare? <Link href={marketplacePath(locale,'/autore')}>Apri l’area autori</Link></>}</p>
    </div>
  </main>;
}
