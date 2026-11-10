'use client';

import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {marketplacePath} from '@/lib/marketplace';

export function SiteFooter(){
  const pathname=usePathname()||'/';
  const english=pathname==='/en'||pathname.startsWith('/en/');
  const locale=english?'en':'it';
  const local=(path:string)=>marketplacePath(locale,path);
  return <footer className="site-footer lm-footer">
    <div className="lm-wrap lm-footer__inner">
      <div className="lm-footer__top">
        <Link href={local('/')} className="lm-footer__logo"><img src="/liberamente-logo.png" alt="LIBERAMENTE.site – lo store di Scrittore.site" width={168} height={56}/></Link>
        <nav aria-label={english?'Footer':'Piè di pagina'} className="lm-footer__nav">
          <Link href={local('/catalogo')}>{english?'Catalogue':'Catalogo'}</Link>
          <Link href={local('/plus')}>LIBERAMENTE Plus</Link>
          <Link href={local('/lettore')}>{english?'Reader area':'Area lettori'}</Link>
          <Link href={local('/autore')}>{english?'Author area':'Area autori'}</Link>
          <Link href={local('/blog')}>Blog</Link>
          <Link href={local('/faq')}>{english?'Frequently asked questions':'Domande frequenti'}</Link>
        </nav>
      </div>
      <p>{english?'A home for independent ebooks. Pay securely by card or PayPal, and every purchase stays in your library.':'Una casa per gli ebook indipendenti. Paghi con carta o PayPal in modo sicuro, e ogni acquisto resta nella tua libreria.'}</p>
    </div>
  </footer>;
}
