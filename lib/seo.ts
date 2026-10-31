import type { Metadata } from 'next';

export const siteUrl = 'https://liberamente.site';
export type StoreLocale = 'it' | 'en';

export function seoLocale(market?: string): StoreLocale {
  return market === 'en' ? 'en' : 'it';
}

export function localizedAlternates(path: string, locale: StoreLocale) {
  const italianPath = path === '/' ? '/' : `/${path.replace(/^\/+|^en\//g, '')}`;
  const englishPath = italianPath === '/' ? '/en' : `/en${italianPath}`;
  return {
    canonical: locale === 'en' ? englishPath : italianPath,
    languages: { 'it-IT': italianPath, en: englishPath, 'x-default': italianPath },
  };
}

export function storefrontMetadata(locale: StoreLocale, page: 'home' | 'catalogue' | 'plus' | 'faq'): Metadata {
  const english = locale === 'en';
  const content = {
    home: english
      ? ['Independent ebooks | LIBERAMENTE.site', 'Discover, buy and read English-language ebooks from independent writers. LIBERAMENTE.site is the Scrittore.site store.']
      : ['Ebook indipendenti italiani', 'Scopri, acquista e leggi ebook di autori indipendenti italiani. LIBERAMENTE.site è lo store di Scrittore.site.'],
    catalogue: english
      ? ['Independent ebook catalogue', 'Browse English-language ebooks by independent authors: fiction, nonfiction, romance, thrillers and more.']
      : ['Catalogo ebook italiani', 'Esplora il catalogo di ebook indipendenti italiani: narrativa, saggi, thriller, romance, crescita personale e molto altro.'],
    plus: english
      ? ['LIBERAMENTE Plus', 'Read online the ebooks included in LIBERAMENTE Plus and support independent writers through qualified reading.']
      : ['LIBERAMENTE Plus', 'Con LIBERAMENTE Plus leggi online gli ebook aderenti al programma e sostieni gli autori in base alle pagine lette qualificate.'],
    faq: english
      ? ['Frequently asked questions', 'Answers for readers and authors about ebooks, purchases, LIBERAMENTE Plus, royalties and publishing.']
      : ['Domande frequenti', 'Risposte per lettori e autori su acquisti, ebook, LIBERAMENTE Plus, royalty, pubblicazione e assistenza.'],
  }[page];
  const path = page === 'home' ? '/' : page === 'catalogue' ? '/catalogo' : `/${page}`;
  const title = content[0];
  const description = content[1];
  return {
    title,
    description,
    keywords: english
      ? ['independent ebooks', 'English ebooks', 'digital books', 'independent authors', 'publish ebook', 'LIBERAMENTE.site']
      : ['ebook italiani', 'ebook indipendenti', 'libri digitali', 'autori indipendenti', 'pubblicare ebook', 'LIBERAMENTE.site'],
    alternates: localizedAlternates(path, locale),
    openGraph: {
      type: 'website', locale: english ? 'en_US' : 'it_IT', alternateLocale: [english ? 'it_IT' : 'en_US'],
      url: `${siteUrl}${english ? (path === '/' ? '/en' : `/en${path}`) : path}`,
      siteName: 'LIBERAMENTE.site', title: `${title} | LIBERAMENTE.site`, description,
      images: [{ url: '/liberamente-logo.png', alt: 'LIBERAMENTE.site' }],
    },
    twitter: { card: 'summary_large_image', title: `${title} | LIBERAMENTE.site`, description, images: ['/liberamente-logo.png'] },
  };
}
