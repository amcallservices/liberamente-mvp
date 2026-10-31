import type {MetadataRoute} from 'next';
import {admin} from '@/lib/supabase/admin';

const siteUrl='https://liberamente.site';

export default async function sitemap():Promise<MetadataRoute.Sitemap>{
  const supabase=admin();
  const {data:books}=await supabase.from('books').select('slug,updated_at,published_at,marketplace_locale').eq('status','published');
  const core:MetadataRoute.Sitemap=[
    {url:siteUrl,lastModified:new Date(),changeFrequency:'daily',priority:1},
    {url:`${siteUrl}/catalogo`,lastModified:new Date(),changeFrequency:'daily',priority:.9},
    {url:`${siteUrl}/plus`,lastModified:new Date(),changeFrequency:'weekly',priority:.8},
    {url:`${siteUrl}/faq`,lastModified:new Date(),changeFrequency:'monthly',priority:.7},
    {url:`${siteUrl}/en`,lastModified:new Date(),changeFrequency:'daily',priority:.9},
    {url:`${siteUrl}/en/catalogo`,lastModified:new Date(),changeFrequency:'daily',priority:.85},
    {url:`${siteUrl}/en/plus`,lastModified:new Date(),changeFrequency:'weekly',priority:.75},
    {url:`${siteUrl}/en/faq`,lastModified:new Date(),changeFrequency:'monthly',priority:.65}
  ];
  return [...core,...(books??[]).map((book:any)=>{const english=book.marketplace_locale==='en';return {url:`${siteUrl}${english?'/en':''}/ebook/${book.slug}`,lastModified:new Date(book.updated_at??book.published_at??Date.now()),changeFrequency:'weekly' as const,priority:.8}})];
}
