import {beforeEach,describe,expect,it,vi} from 'vitest';

const {from,query}=vi.hoisted(()=>{
  const query={select:vi.fn(),eq:vi.fn(),order:vi.fn(),range:vi.fn()};
  return {from:vi.fn(()=>query),query};
});
vi.mock('@/lib/supabase/admin',()=>({admin:()=>({from})}));
import sitemap,{dynamic} from '../app/sitemap';
import robots from '../app/robots';

beforeEach(()=>{
  vi.clearAllMocks();
  query.select.mockReturnValue(query);
  query.eq.mockReturnValue(query);
  query.order.mockReturnValue(query);
});

describe('public sitemap',()=>{
  it('reads live publications and assigns each book to its storefront',async()=>{
    expect(dynamic).toBe('force-dynamic');
    const book={slug:'italian',marketplace_locale:'it',updated_at:'2026-11-04T12:00:00Z'};
    query.range.mockResolvedValueOnce({data:[book,{...book,slug:'english',marketplace_locale:'en'}],error:null});
    const entries=await sitemap();
    expect(from).toHaveBeenCalledWith('books');
    expect(query.eq).toHaveBeenCalledWith('status','published');
    expect(query.select).toHaveBeenCalledWith('slug,updated_at,published_at,marketplace_locale');
    const urls=entries.map(entry=>entry.url);
    expect(urls.filter(url=>url.includes('/ebook/'))).toEqual(['https://liberamente.site/ebook/italian','https://liberamente.site/en/ebook/english']);
    expect(urls).toContain('https://liberamente.site/blog');
    expect(urls).toContain('https://liberamente.site/en/blog');
    expect(urls).toContain('https://liberamente.site/blog/come-pubblicare-un-ebook');
    expect(urls).toContain('https://liberamente.site/en/blog/how-to-publish-an-ebook');
    expect(urls.filter(url=>/\/blog\/./.test(url))).toHaveLength(20);
  });

  it('includes publications beyond the first database page',async()=>{
    query.range.mockResolvedValueOnce({data:Array.from({length:1000},(_,i)=>({slug:`book-${i}`,marketplace_locale:'it'})),error:null})
      .mockResolvedValueOnce({data:[{slug:'last',marketplace_locale:'en'}],error:null});
    const entries=await sitemap();
    expect(query.range.mock.calls).toEqual([[0,999],[1000,1999]]);
    expect(entries.filter(entry=>entry.url.includes('/ebook/'))).toHaveLength(1001);
    expect(entries.at(-1)?.url).toBe('https://liberamente.site/en/ebook/last');
  });

  it('fails instead of publishing a partial sitemap on a database error',async()=>{
    query.range.mockResolvedValueOnce({data:null,error:{message:'unavailable'}});
    await expect(sitemap()).rejects.toThrow('Unable to load published books');
  });

  it('excludes private routes in both languages and declares the public sitemap',()=>{
    const result=robots();
    expect(result.sitemap).toBe('https://liberamente.site/sitemap.xml');
    const rules=result.rules as Array<{userAgent:string;allow:string;disallow:string[]}>;
    expect(rules[0]).toMatchObject({userAgent:'*',disallow:expect.arrayContaining(['/admin','/en/admin','/lettore','/en/lettore','/api/','/en/api/','/anteprima-grafica'])});
  });

  it('nomina i crawler delle AI e li lascia leggere le pagine pubbliche ma non le aree private',()=>{
    const rules=robots().rules as Array<{userAgent:string;allow:string;disallow:string[]}>;
    const names=rules.map(rule=>rule.userAgent);
    expect(names).toEqual(expect.arrayContaining(['GPTBot','ClaudeBot','PerplexityBot','Google-Extended']));
    rules.forEach(rule=>{expect(rule.allow).toBe('/');expect(rule.disallow).toContain('/lettore');});
  });
});
