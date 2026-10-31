'use client';

import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {SmartSearch} from '@/components/smart-search';
import {marketplacePath, type MarketplaceLocale} from '@/lib/marketplace';

type Props={signedIn:boolean;isPrimaryAdmin:boolean;hasAuthorArea:boolean};

export function SiteHeader({signedIn,isPrimaryAdmin,hasAuthorArea}:Props){
  const pathname=usePathname()||'/';
  const english=pathname==='/en'||pathname.startsWith('/en/');
  const locale:MarketplaceLocale=english?'en':'it';
  const currentPath=english?(pathname.replace(/^\/en(?=\/|$)/,'')||'/'):pathname;
  const local=(path:string)=>marketplacePath(locale,path);
  const text=english?{catalogue:'Catalogue',readers:'Reader area',authors:'Author area',plusAuthors:'Plus authors',reports:'Author reports',write:'Write your book',admin:'Administration',manage:'Manage Plus',profile:'Profile',signOut:'Sign out',login:'Sign in'}:{catalogue:'Catalogo',readers:'Area lettori',authors:'Area autori',plusAuthors:'Plus autori',reports:'Report autori',write:'Scrivi il tuo libro',admin:'Amministrazione',manage:'Gestione Plus',profile:'Profilo',signOut:'Esci',login:'Accedi'};
  return <header>
    <div className="header-top">
      <Link className="brand" href={local('/')}>LIBERAMENTE.site <span>– lo store di Scrittore.site</span></Link>
      <nav>
        <Link href={local('/catalogo')}>{text.catalogue}</Link>
        <Link href={local('/faq')}>FAQ</Link>
        <Link href={local('/plus')}>LIBERAMENTE Plus</Link>
        <Link href={local('/lettore')}>{text.readers}</Link>
        <Link href={local('/autore')}>{text.authors}</Link>
        {hasAuthorArea&&<><Link href={local('/autore/plus')}>{text.plusAuthors}</Link><Link href={local('/autore/report')}>{text.reports}</Link></>}
        <a className="write-book-link" href="https://scrittoresite.streamlit.app/" target="_blank" rel="noopener noreferrer">{text.write} <span aria-hidden="true">↗</span></a>
        {isPrimaryAdmin&&<><Link className="nav-login" href={local('/admin')}>{text.admin}</Link><Link className="nav-login" href={local('/admin/plus')}>{text.manage}</Link></>}
        <div className="language-switcher" aria-label="Marketplace language">
          <Link className={!english?'active-language':''} href={currentPath} aria-label="Italiano">🇮🇹 <span>IT</span></Link>
          <Link className={english?'active-language':''} href={marketplacePath('en',currentPath)} aria-label="English">🇺🇸 <span>EN</span></Link>
        </div>
        {signedIn?<><a className="nav-assistance" href="https://wa.me/393282693777?text=Scrivo%20da%20Liberamente.site" target="_blank" rel="noopener noreferrer">ASSISTENZA</a><Link className="nav-login" href={local('/profilo')}>{text.profile}</Link><form action="/api/auth/signout" method="POST"><button className="nav-button">{text.signOut}</button></form></>:<Link className="nav-login" href={`${local('/accedi')}?next=${encodeURIComponent(local('/catalogo'))}`}>{text.login}</Link>}
      </nav>
    </div>
    <div className="header-search-row"><SmartSearch className="header-search" locale={locale}/></div>
  </header>;
}
