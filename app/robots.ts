import type {MetadataRoute} from 'next';

export default function robots():MetadataRoute.Robots{
  const privatePaths=['/admin','/autore','/lettore','/libreria','/profilo','/accedi','/api/'];
  return {rules:{userAgent:'*',allow:'/',disallow:[...privatePaths,...privatePaths.map(path=>`/en${path}`)]},sitemap:'https://liberamente.site/sitemap.xml',host:'https://liberamente.site'};
}
