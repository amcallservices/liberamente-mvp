import type {MetadataRoute} from 'next';
import {admin} from '@/lib/supabase/admin';

const siteUrl='https://liberamente.site';

export default async function sitemap():Promise<MetadataRoute.Sitemap>{
  const supabase=admin();
  const {data:books}=await supabase.from('books').select('slug,updated_at,published_at').eq('status','published');
  const core:MetadataRoute.Sitemap=[
    {url:siteUrl,lastModified:new Date(),changeFrequency:'daily',priority:1},
    {url:`${siteUrl}/catalogo`,lastModified:new Date(),changeFrequency:'daily',priority:.9},
    {url:`${siteUrl}/plus`,lastModified:new Date(),changeFrequency:'weekly',priority:.8},
    {url:`${siteUrl}/faq`,lastModified:new Date(),changeFrequency:'monthly',priority:.7}
  ];
  return [...core,...(books??[]).map((book:any)=>({url:`${siteUrl}/ebook/${book.slug}`,lastModified:new Date(book.updated_at??book.published_at??Date.now()),changeFrequency:'weekly' as const,priority:.8}))];
}
