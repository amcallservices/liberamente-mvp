import type {MetadataRoute} from 'next';

const privatePaths=['/admin','/autore','/lettore','/libreria','/profilo','/accedi','/api/','/anteprima-grafica'];
const disallow=[...privatePaths,...privatePaths.map(path=>`/en${path}`)];

// Crawler dei motori di ricerca basati su AI: li nominiamo esplicitamente così
// che sia chiaro che le pagine pubbliche (catalogo, schede libro, FAQ) possono
// essere lette e citate. Le aree private restano escluse per tutti.
export const aiCrawlers=['GPTBot','OAI-SearchBot','ChatGPT-User','ClaudeBot','Claude-SearchBot','Claude-User','PerplexityBot','Perplexity-User','Google-Extended','Applebot-Extended','Bingbot','DuckDuckBot'];

export default function robots():MetadataRoute.Robots{
  return {
    rules:[{userAgent:'*',allow:'/',disallow},...aiCrawlers.map(userAgent=>({userAgent,allow:'/',disallow}))],
    sitemap:'https://liberamente.site/sitemap.xml',
    host:'https://liberamente.site'
  };
}
