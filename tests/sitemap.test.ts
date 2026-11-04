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
    expect(entries.slice(8).map(entry=>entry.url)).toEqual(['https://liberamente.site/ebook/italian','https://liberamente.site/en/ebook/english']);
  });

  it('includes publications beyond the first database page',async()=>{
    query.range.mockResolvedValueOnce({data:Array.from({length:1000},(_,i)=>({slug:`book-${i}`,marketplace_locale:'it'})),error:null})
      .mockResolvedValueOnce({data:[{slug:'last',marketplace_locale:'en'}],error:null});
    const entries=await sitemap();
    expect(query.range.mock.calls).toEqual([[0,999],[1000,1999]]);
    expect(entries).toHaveLength(1009);
    expect(entries.at(-1)?.url).toBe('https://liberamente.site/en/ebook/last');
  });

  it('fails instead of publishing a partial sitemap on a database error',async()=>{
    query.range.mockResolvedValueOnce({data:null,error:{message:'unavailable'}});
    await expect(sitemap()).rejects.toThrow('Unable to load published books');
  });

  it('excludes private routes in both languages and declares the public sitemap',()=>{
    const result=robots();
    expect(result.sitemap).toBe('https://liberamente.site/sitemap.xml');
    expect(result.rules).toMatchObject({disallow:expect.arrayContaining(['/admin','/en/admin','/lettore','/en/lettore','/api/','/en/api/'])});
  });
});
