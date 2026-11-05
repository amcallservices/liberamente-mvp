import type { Metadata } from 'next';
import { marketplacePath, type MarketplaceLocale } from '@/lib/marketplace';

export const publicSiteUrl = 'https://liberamente.site';

export type BookSeoInput = {
  locale: MarketplaceLocale;
  slug: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  authorName?: string | null;
  categories?: Array<string | null | undefined>;
  image?: string | null;
  pageCount?: number | null;
  priceCents?: number | null;
  rating?: number | null;
  reviewCount?: number | null;
  publishedAt?: string | null;
  updatedAt?: string | null;
};

function text(value: unknown) {
  return String(value ?? '').replace(/\s+/g, ' ').trim();
}

function uniqueText(values: Array<string | null | undefined>) {
  return Array.from(new Set(values.map(text).filter(Boolean)));
}

function numberValue(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function authorFor(input: BookSeoInput) {
  return text(input.authorName) || (input.locale === 'en' ? 'Independent author' : 'Autore indipendente');
}

export function seoDescription(input: BookSeoInput) {
  const fallback = input.locale === 'en'
    ? `${text(input.title)} — an ebook by ${authorFor(input)} on LIBERAMENTE.site.`
    : `${text(input.title)} — ebook di ${authorFor(input)} su LIBERAMENTE.site.`;
  const description = text(input.description) || fallback;
  if (description.length <= 160) return description;

  const clipped = description.slice(0, 157);
  return `${clipped.replace(/\s+\S*$/, '').trimEnd() || clipped.trimEnd()}…`;
}

export function canonicalBookPath(locale: MarketplaceLocale, slug: string) {
  return marketplacePath(locale, `/ebook/${encodeURIComponent(slug)}`);
}

export function canonicalBookUrl(locale: MarketplaceLocale, slug: string) {
  return `${publicSiteUrl}${canonicalBookPath(locale, slug)}`;
}

export function buildBookMetadata(input: BookSeoInput): Metadata {
  const title = text(input.title) || (input.locale === 'en' ? 'Ebook' : 'Ebook');
  const subtitle = text(input.subtitle);
  const pageTitle = subtitle ? `${title}: ${subtitle}` : title;
  const author = authorFor(input);
  const description = seoDescription(input);
  const url = canonicalBookUrl(input.locale, input.slug);
  const image = text(input.image) || undefined;
  const english = input.locale === 'en';

  return {
    title: pageTitle,
    description,
    keywords: uniqueText([title, author, ...(input.categories ?? []), english ? 'independent ebooks' : 'ebook indipendenti']),
    alternates: { canonical: url },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
    openGraph: {
      type: 'book',
      locale: english ? 'en_US' : 'it_IT',
      url,
      siteName: 'LIBERAMENTE.site',
      title: pageTitle,
      description,
      images: image ? [{ url: image, alt: `${english ? 'Cover of' : 'Copertina di'} ${title}` }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description,
      images: image ? [image] : undefined,
    },
    other: { 'book:author': author },
  };
}

export function buildBookStructuredData(input: BookSeoInput) {
  const english = input.locale === 'en';
  const title = text(input.title);
  const author = authorFor(input);
  const url = canonicalBookUrl(input.locale, input.slug);
  const image = text(input.image) || undefined;
  const categories = uniqueText(input.categories ?? []);
  const priceCents = numberValue(input.priceCents);
  const pageCount = numberValue(input.pageCount);
  const rating = numberValue(input.rating);
  const reviewCount = numberValue(input.reviewCount) ?? 0;

  const book: Record<string, unknown> = {
    '@type': 'Book',
    '@id': `${url}#book`,
    name: title,
    description: text(input.description) || seoDescription(input),
    url,
    inLanguage: english ? 'en' : 'it-IT',
    bookFormat: 'https://schema.org/EBook',
    isAccessibleForFree: false,
    author: { '@type': 'Person', name: author },
    publisher: { '@type': 'Organization', name: 'LIBERAMENTE.site', url: publicSiteUrl },
  };

  const subtitle = text(input.subtitle);
  if (subtitle) book.alternateName = subtitle;
  if (image) book.image = image;
  if (pageCount && pageCount > 0) book.numberOfPages = Math.floor(pageCount);
  if (input.publishedAt) book.datePublished = input.publishedAt;
  if (input.updatedAt) book.dateModified = input.updatedAt;
  if (categories.length) book.genre = categories;
  if (rating !== null && reviewCount > 0) {
    book.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: rating.toFixed(1),
      reviewCount: Math.floor(reviewCount),
      bestRating: 5,
      worstRating: 1,
    };
  }
  if (priceCents !== null && priceCents >= 0) {
    book.offers = {
      '@type': 'Offer',
      '@id': `${url}#offer`,
      url,
      priceCurrency: 'EUR',
      price: (priceCents / 100).toFixed(2),
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
    };
  }

  const cataloguePath = marketplacePath(input.locale, '/catalogo');
  return {
    '@context': 'https://schema.org',
    '@graph': [
      book,
      {
        '@type': 'BreadcrumbList',
        '@id': `${url}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'LIBERAMENTE.site', item: `${publicSiteUrl}${marketplacePath(input.locale, '/')}` },
          { '@type': 'ListItem', position: 2, name: english ? 'Catalogue' : 'Catalogo', item: `${publicSiteUrl}${cataloguePath}` },
          { '@type': 'ListItem', position: 3, name: title, item: url },
        ],
      },
    ],
  };
}

export function serializeStructuredData(value: unknown) {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
}
