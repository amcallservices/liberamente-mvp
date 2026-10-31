export type MarketplaceLocale = 'it' | 'en';

export function marketplaceLocale(value?: string | null): MarketplaceLocale {
  return value === 'en' ? 'en' : 'it';
}

export function marketplacePrefix(locale: MarketplaceLocale) {
  return locale === 'en' ? '/en' : '';
}

export function marketplacePath(locale: MarketplaceLocale, path = '/') {
  const prefix = marketplacePrefix(locale);
  if (path === '/') return prefix || '/';
  return `${prefix}${path.startsWith('/') ? path : `/${path}`}`;
}
