'use client';

import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {marketplacePath} from '@/lib/marketplace';

export function SiteFooter(){
  const pathname=usePathname()||'/';
  const english=pathname==='/en'||pathname.startsWith('/en/');
  const locale=english?'en':'it';
  return <footer><div className="wrap footer-content"><p><strong>LIBERAMENTE.site – lo store di Scrittore.site</strong> · {english?'a home for independent ebooks. Secure payments, protected downloads.':'una casa per ebook indipendenti. Pagamenti sicuri, download protetti.'}</p><Link href={marketplacePath(locale,'/faq')}>{english?'Frequently asked questions':'Domande frequenti'}</Link></div></footer>;
}
