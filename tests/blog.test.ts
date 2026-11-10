import { describe, expect, it } from 'vitest';
import { blogPath, blogPosts, findPost, findPostInAnyLocale, translatedPost } from '../lib/blog';
import { headingsOf } from '../lib/blog/render';

const locales = ['it', 'en'] as const;
const sitePages = ['/', '/catalogo', '/plus', '/faq', '/autore', '/lettore'];

describe('blog content', () => {
  it('publishes every article in both languages', () => {
    const ids = (locale: 'it' | 'en') => blogPosts(locale).map((post) => post.id).sort();
    expect(ids('it')).toEqual(ids('en'));
    expect(blogPosts('it')).toHaveLength(10);
    for (const post of blogPosts('it')) expect(translatedPost(post, 'en')?.audience).toBe(post.audience);
  });

  it('has five articles for writers and five for readers in each language', () => {
    for (const locale of locales) {
      const posts = blogPosts(locale);
      expect(posts.filter((post) => post.audience === 'authors')).toHaveLength(5);
      expect(posts.filter((post) => post.audience === 'readers')).toHaveLength(5);
    }
  });

  it('uses unique, URL-safe slugs across languages', () => {
    const slugs = locales.flatMap((locale) => blogPosts(locale).map((post) => post.slug));
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it('keeps titles and descriptions within search-friendly lengths', () => {
    for (const locale of locales) {
      for (const post of blogPosts(locale)) {
        expect(post.title.length, post.title).toBeLessThanOrEqual(95);
        expect(post.description.length, post.slug).toBeGreaterThanOrEqual(110);
        expect(post.description.length, post.slug).toBeLessThanOrEqual(175);
        expect(headingsOf(post.body).length, post.slug).toBeGreaterThanOrEqual(3);
        expect(post.sources.length, post.slug).toBeGreaterThan(0);
      }
    }
  });

  it('only links to pages and articles that exist, in the same language', () => {
    for (const locale of locales) {
      const prefix = locale === 'en' ? '/en' : '';
      for (const post of blogPosts(locale)) {
        const links = [...post.body.matchAll(/\]\((\/[^)]*)\)/g)].map((match) => match[1]);
        for (const link of links) {
          if (locale === 'en') expect(link.startsWith('/en/') || link === '/en', `${post.slug} → ${link}`).toBe(true);
          else expect(link.startsWith('/en'), `${post.slug} → ${link}`).toBe(false);
          const path = link.slice(prefix.length) || '/';
          if (path.startsWith('/blog/')) expect(findPost(locale, path.slice(6)), `${post.slug} → ${link}`).toBeDefined();
          else expect(sitePages, `${post.slug} → ${link}`).toContain(path);
        }
      }
    }
  });

  it('finds an article from the other language so the language switch can redirect', () => {
    const italian = findPost('it', 'come-pubblicare-un-ebook')!;
    expect(findPostInAnyLocale('come-pubblicare-un-ebook')?.locale).toBe('it');
    expect(blogPath('en', translatedPost(italian, 'en')!.slug)).toBe('/en/blog/how-to-publish-an-ebook');
  });
});
