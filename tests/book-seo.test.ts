import { describe, expect, it } from 'vitest';
import {
  buildBookMetadata,
  buildBookStructuredData,
  canonicalBookUrl,
  serializeStructuredData,
} from '../lib/book-seo';

describe('book SEO', () => {
  it('builds one canonical, encoded URL for an Italian book', () => {
    expect(canonicalBookUrl('it', 'caffè & libri')).toBe('https://liberamente.site/ebook/caff%C3%A8%20%26%20libri');
  });

  it('exposes complete indexable metadata for published ebook pages', () => {
    const metadata = buildBookMetadata({
      locale: 'en',
      slug: 'an-independent-story',
      title: 'An independent story',
      description: 'A long-form description for readers looking for a compelling independent ebook.',
      authorName: 'Jane Author',
      categories: ['Fiction', 'Literary fiction'],
      image: 'https://cdn.example.com/cover.jpg',
    });

    expect(metadata.alternates?.canonical).toBe('https://liberamente.site/en/ebook/an-independent-story');
    expect(metadata.robots).toMatchObject({ index: true, follow: true });
    expect(metadata.openGraph).toMatchObject({ type: 'book', locale: 'en_US' });
    expect(metadata.description).toContain('independent ebook');
  });

  it('emits Book, Offer and Breadcrumb structured data', () => {
    const data = buildBookStructuredData({
      locale: 'it',
      slug: 'storia',
      title: 'Una storia',
      description: 'Descrizione del libro.',
      authorName: 'Mario Rossi',
      categories: ['Narrativa'],
      pageCount: 250,
      priceCents: 899,
      rating: 4.5,
      reviewCount: 2,
      publishedAt: '2026-11-05T12:00:00.000Z',
    });
    const [book, breadcrumb] = data['@graph'] as Array<Record<string, unknown>>;

    expect(book).toMatchObject({ '@type': 'Book', numberOfPages: 250, inLanguage: 'it-IT' });
    expect(book.offers).toMatchObject({ '@type': 'Offer', price: '8.99', priceCurrency: 'EUR' });
    expect(book.aggregateRating).toMatchObject({ reviewCount: 2 });
    expect(breadcrumb['@type']).toBe('BreadcrumbList');
  });

  it('escapes structured-data strings before embedding them in HTML', () => {
    expect(serializeStructuredData({ value: '</script><script>alert(1)</script>' })).not.toContain('</script>');
  });
});
