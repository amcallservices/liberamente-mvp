import type {MarketplaceLocale} from '@/lib/marketplace';
import {italianPosts} from './posts-it';
import {englishPosts} from './posts-en';

export type BlogAudience='authors'|'readers';
export type BlogSource={title:string;url:string};
export type BlogPost={
  /** Shared between the Italian and English versions of the same article. */
  id:string;
  slug:string;
  audience:BlogAudience;
  title:string;
  /** Used for <meta name="description"> and social cards: 120–160 characters. */
  description:string;
  /** Short teaser shown on the blog index. */
  excerpt:string;
  keywords:string[];
  published:string;
  updated:string;
  /** Lightweight markdown: ##/### headings, paragraphs, "- " and "1. " lists, "> " notes, **bold** and [links](/path). */
  body:string;
  sources:BlogSource[];
};

const byLocale:Record<MarketplaceLocale,BlogPost[]>={it:italianPosts,en:englishPosts};

export function blogPosts(locale:MarketplaceLocale){
  return [...byLocale[locale]].sort((a,b)=>b.published.localeCompare(a.published)||a.id.localeCompare(b.id));
}

export function findPost(locale:MarketplaceLocale,slug:string){
  return byLocale[locale].find(post=>post.slug===slug);
}

/** The same article in the other language, used for hreflang and for the language switcher. */
export function translatedPost(post:BlogPost,locale:MarketplaceLocale){
  return byLocale[locale].find(candidate=>candidate.id===post.id);
}

/** A slug of the other language (the header's language switch keeps the path), so it can be redirected. */
export function findPostInAnyLocale(slug:string){
  for(const locale of ['it','en'] as MarketplaceLocale[]){
    const post=findPost(locale,slug);
    if(post) return {locale,post};
  }
  return null;
}

export function readingMinutes(post:BlogPost){
  return Math.max(2,Math.round(post.body.split(/\s+/).length/200));
}

export function blogPath(locale:MarketplaceLocale,slug?:string){
  const base=locale==='en'?'/en/blog':'/blog';
  return slug?`${base}/${slug}`:base;
}

export function formatBlogDate(date:string,locale:MarketplaceLocale){
  return new Intl.DateTimeFormat(locale==='en'?'en-GB':'it-IT',{day:'numeric',month:'long',year:'numeric'}).format(new Date(`${date}T12:00:00Z`));
}
