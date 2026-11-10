import type {Metadata} from 'next';
import Link from 'next/link';
import {notFound,permanentRedirect} from 'next/navigation';
import {marketplaceLocale,marketplacePath,type MarketplaceLocale} from '@/lib/marketplace';
import {siteUrl} from '@/lib/seo';
import {blogPath,blogPosts,findPost,findPostInAnyLocale,formatBlogDate,readingMinutes,translatedPost,type BlogPost} from '@/lib/blog';
import {headingsOf,renderBody} from '@/lib/blog/render';

type Props={params:Promise<{slug:string}>;searchParams:Promise<{market?:string}>};

const copy={
  it:{blog:'Blog',home:'Home',authors:'Per chi scrive',readers:'Per chi legge',min:'min di lettura',updated:'Aggiornato il',contents:'In questo articolo',sources:'Fonti',related:'Altri articoli',ctaAuthorsTitle:'Pubblica il tuo ebook su LIBERAMENTE',ctaAuthors:'50% di royalty sulle vendite singole, pagamenti dopo 30 giorni e una revisione editoriale per ogni titolo.',ctaAuthorsBtn:'Apri l’area autori',ctaReadersTitle:'Trova la tua prossima lettura',ctaReaders:'Ebook di autori indipendenti, con estratti gratuiti e recensioni di chi li ha acquistati.',ctaReadersBtn:'Esplora il catalogo',back:'Tutti gli articoli'},
  en:{blog:'Blog',home:'Home',authors:'For writers',readers:'For readers',min:'min read',updated:'Updated',contents:'In this article',sources:'Sources',related:'More articles',ctaAuthorsTitle:'Publish your ebook on LIBERAMENTE',ctaAuthors:'50% royalties on single sales, payouts after 30 days and an editorial review for every title.',ctaAuthorsBtn:'Open the author area',ctaReadersTitle:'Find your next read',ctaReaders:'Ebooks by independent authors, with free excerpts and reviews from verified buyers.',ctaReadersBtn:'Browse the catalogue',back:'All articles'}
};

async function resolve({params,searchParams}:Props){
  const [{slug},{market}]=await Promise.all([params,searchParams]);
  const locale=marketplaceLocale(market);
  return {locale,slug,post:findPost(locale,slug)};
}

function alternatesFor(post:BlogPost,locale:MarketplaceLocale){
  const other:MarketplaceLocale=locale==='en'?'it':'en';
  const twin=translatedPost(post,other);
  const it=locale==='it'?post:twin,en=locale==='en'?post:twin;
  const languages:Record<string,string>={};
  if(it) languages['it-IT']=blogPath('it',it.slug);
  if(en) languages.en=blogPath('en',en.slug);
  if(it) languages['x-default']=blogPath('it',it.slug);
  return {canonical:blogPath(locale,post.slug),languages};
}

export async function generateMetadata(props:Props):Promise<Metadata>{
  const {locale,post}=await resolve(props);
  if(!post) return {title:'Blog',robots:{index:false}};
  const url=`${siteUrl}${blogPath(locale,post.slug)}`;
  return {
    title:post.title,description:post.description,keywords:post.keywords,
    alternates:alternatesFor(post,locale),
    authors:[{name:'Redazione LIBERAMENTE.site'}],
    openGraph:{type:'article',locale:locale==='en'?'en_US':'it_IT',url,siteName:'LIBERAMENTE.site',title:post.title,description:post.description,publishedTime:post.published,modifiedTime:post.updated,section:post.audience==='authors'?copy[locale].authors:copy[locale].readers,tags:post.keywords,images:[{url:'/liberamente-logo.png',alt:'LIBERAMENTE.site'}]},
    twitter:{card:'summary_large_image',title:post.title,description:post.description,images:['/liberamente-logo.png']},
  };
}

export default async function BlogArticle(props:Props){
  const {locale,slug,post}=await resolve(props);
  if(!post){
    // The language switch keeps the slug: send visitors to this article in their language.
    const found=findPostInAnyLocale(slug);
    const twin=found&&translatedPost(found.post,locale);
    if(twin) permanentRedirect(blogPath(locale,twin.slug));
    notFound();
  }
  const t=copy[locale],english=locale==='en',url=`${siteUrl}${blogPath(locale,post.slug)}`;
  const toc=headingsOf(post.body);
  const related=blogPosts(locale).filter(p=>p.id!==post.id).sort((a,b)=>Number(b.audience===post.audience)-Number(a.audience===post.audience)).slice(0,3);
  const authorsPost=post.audience==='authors';
  const structured={'@context':'https://schema.org','@graph':[
    {'@type':'BlogPosting',headline:post.title,description:post.description,inLanguage:english?'en':'it-IT',datePublished:post.published,dateModified:post.updated,mainEntityOfPage:url,url,keywords:post.keywords.join(', '),wordCount:post.body.split(/\s+/).length,image:`${siteUrl}/liberamente-logo.png`,author:{'@type':'Organization',name:'Redazione LIBERAMENTE.site',url:siteUrl},publisher:{'@type':'Organization',name:'LIBERAMENTE.site',logo:{'@type':'ImageObject',url:`${siteUrl}/liberamente-logo.png`}},citation:post.sources.map(source=>source.url)},
    {'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:t.home,item:`${siteUrl}${marketplacePath(locale,'/')}`},{'@type':'ListItem',position:2,name:t.blog,item:`${siteUrl}${blogPath(locale)}`},{'@type':'ListItem',position:3,name:post.title,item:url}]}
  ]};
  return <main className="lm-blog lm-article">
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(structured)}}/>
    <div className="lm-wrap">
      <nav className="lm-crumbs" aria-label="Breadcrumb"><Link href={marketplacePath(locale,'/')}>{t.home}</Link> <span aria-hidden="true">/</span> <Link href={blogPath(locale)}>{t.blog}</Link></nav>
      <div className="lm-article__head">
        <p className="lm-blog__meta">{authorsPost?t.authors:t.readers} · {formatBlogDate(post.published,locale)} · {readingMinutes(post)} {t.min}</p>
        <h1>{post.title}</h1>
        <p className="lm-article__lede">{post.excerpt}</p>
        {post.updated!==post.published&&<p className="lm-blog__meta">{t.updated} {formatBlogDate(post.updated,locale)}</p>}
      </div>
      <div className="lm-article__layout">
        {toc.length>2&&<nav className="lm-article__toc" aria-label={t.contents}><p>{t.contents}</p><ol>{toc.map(item=><li key={item.id}><a href={`#${item.id}`}>{item.text}</a></li>)}</ol></nav>}
        <article className="lm-article__body">
          {renderBody(post.body)}
          <aside className="lm-article__cta">
            <h2>{authorsPost?t.ctaAuthorsTitle:t.ctaReadersTitle}</h2>
            <p>{authorsPost?t.ctaAuthors:t.ctaReaders}</p>
            <Link className="lm-btn lm-btn--gold" href={marketplacePath(locale,authorsPost?'/autore':'/catalogo')}>{authorsPost?t.ctaAuthorsBtn:t.ctaReadersBtn} <span aria-hidden="true">→</span></Link>
          </aside>
          {post.sources.length>0&&<section className="lm-article__sources" aria-labelledby="lm-sources"><h2 id="lm-sources">{t.sources}</h2><ul>{post.sources.map(source=><li key={source.url}><a href={source.url} target="_blank" rel="noopener">{source.title}</a></li>)}</ul></section>}
        </article>
      </div>
      <section className="lm-article__related" aria-labelledby="lm-related">
        <h2 id="lm-related">{t.related}</h2>
        <div className="lm-blog__grid">{related.map(item=><article className="lm-blog__card" key={item.id}><p className="lm-blog__meta">{item.audience==='authors'?t.authors:t.readers} · {readingMinutes(item)} {t.min}</p><h3><Link href={blogPath(locale,item.slug)}>{item.title}</Link></h3><p>{item.excerpt}</p></article>)}</div>
        <Link className="lm-blog__more" href={blogPath(locale)}>{t.back} <span aria-hidden="true">→</span></Link>
      </section>
    </div>
  </main>;
}
