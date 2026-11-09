import './globals.css';
import './a-plus.css';
import './palette.css';
import './storefront.css';
import './brand.css';
import './search.css';
import './plus.css';
import './admin/plus/admin-plus.css';
import './autore/report/report.css';
import './lettore/reading.css';
import './faq/faq.css';
import './editorial-refresh.css';
import './home.css';
import type {Metadata} from 'next';
import {createClient} from '@/lib/supabase/server';
import {SiteHeader} from '@/components/site-header';
import {SiteFooter} from '@/components/site-footer';
const siteUrl='https://liberamente.site';
export const metadata:Metadata={metadataBase:new URL(siteUrl),title:{default:'LIBERAMENTE.site | Independent ebook store',template:'%s | LIBERAMENTE.site'},description:'Independent ebooks for Italian and English readers. LIBERAMENTE.site is the Scrittore.site store.',applicationName:'LIBERAMENTE.site',keywords:['ebook italiani','independent ebooks','ebook indipendenti','English ebooks','digital books','autori indipendenti','independent authors','pubblicare ebook','Scrittore.site'],authors:[{name:'LIBERAMENTE.site'}],creator:'LIBERAMENTE.site',publisher:'LIBERAMENTE.site',icons:{icon:[{url:'/favicon.png',type:'image/png'}],apple:'/favicon.png'},openGraph:{type:'website',locale:'it_IT',alternateLocale:['en_US'],url:siteUrl,siteName:'LIBERAMENTE.site',title:'LIBERAMENTE.site – the Scrittore.site store',description:'Independent ebooks to discover, buy and read.',images:[{url:'/liberamente-logo.png',alt:'Logo LIBERAMENTE.site'}]},twitter:{card:'summary_large_image',title:'LIBERAMENTE.site – the Scrittore.site store',description:'Independent ebooks for readers and authors.',images:['/liberamente-logo.png']},robots:{index:true,follow:true,googleBot:{index:true,follow:true,'max-image-preview':'large','max-snippet':-1,'max-video-preview':-1}}};
export default async function Layout({children}:{children:React.ReactNode}) {
  // Keep public pages available if the authentication service is temporarily
  // unavailable (and make the local visual preview independent of credentials).
  let user:{id:string;email?:string|null}|null=null;
  let sessionProfile:{role?:string}|null=null;
  try {
    const s=await createClient();
    const {data}=await s.auth.getUser();
    user=data.user;
    const profileResult=user
      ?await s.from('profiles').select('role').eq('id',user.id).maybeSingle()
      :{data:null};
    sessionProfile=profileResult.data;
  } catch {
    // Visitors can still browse public content; protected pages perform their
    // own authentication checks.
  }
  const isPrimaryAdmin=user?.email==='stramantonio@gmail.com'&&sessionProfile?.role==='admin';
  const hasAuthorArea=Boolean(user&&sessionProfile?.role&&sessionProfile.role!=='reader');
  const structuredData={'@context':'https://schema.org','@graph':[{'@type':'Organization',name:'LIBERAMENTE.site',url:siteUrl,logo:`${siteUrl}/liberamente-logo.png`,description:'Independent ebook marketplace, the Scrittore.site store.',areaServed:['IT','US','GB','CA','AU'],availableLanguage:['it','en']},{'@type':'WebSite',name:'LIBERAMENTE.site',alternateName:'LIBERAMENTE',url:siteUrl,inLanguage:['it-IT','en'],publisher:{'@type':'Organization',name:'LIBERAMENTE.site'},potentialAction:[{'@type':'SearchAction',target:`${siteUrl}/catalogo?q={search_term_string}`,'query-input':'required name=search_term_string'},{'@type':'SearchAction',target:`${siteUrl}/en/catalogo?q={search_term_string}`,'query-input':'required name=search_term_string'}]}]};
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(structuredData)}}/>
    <SiteHeader signedIn={Boolean(user)} isPrimaryAdmin={isPrimaryAdmin} hasAuthorArea={hasAuthorArea}/>
    {children}
    <SiteFooter/>
  </>;
}
