import type {MetadataRoute} from 'next';

export default function robots():MetadataRoute.Robots{
  return {rules:{userAgent:'*',allow:'/',disallow:['/admin','/autore','/lettore','/profilo','/accedi','/api/']},sitemap:'https://liberamente.site/sitemap.xml',host:'https://liberamente.site'};
}
