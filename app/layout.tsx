import './globals.css';
import Link from 'next/link';
export const metadata={title:'Liberamente | Ebook italiani',description:'Marketplace italiano per ebook indipendenti'};
export default function Layout({children}:{children:React.ReactNode}){return <><header><Link className="brand" href="/">Liberamente</Link><nav><Link href="/catalogo">Catalogo</Link><Link href="/autore">Area autori</Link><Link href="/libreria">La mia libreria</Link><Link href="/accedi">Accedi</Link></nav></header>{children}<footer><div className="wrap">Liberamente · Ebook indipendenti, lettura responsabile.</div></footer></>}
