import './globals.css';
import Link from 'next/link';
import {createClient} from '@/lib/supabase/server';
export const metadata={title:'Liberamente | Ebook italiani',description:'Marketplace italiano per ebook indipendenti'};
export default async function Layout({children}:{children:React.ReactNode}){const s=await createClient(),{data:{user}}=await s.auth.getUser();return <><header><Link className="brand" href="/">LIBERAMENTE</Link><nav><Link href="/catalogo">Catalogo</Link><Link href="/lettore">Area lettori</Link><Link href="/autore">Area autori</Link>{user?<form action="/api/auth/signout" method="POST"><button className="nav-button">Esci</button></form>:<Link className="nav-login" href="/accedi">Accedi</Link>}</nav></header>{children}<footer><div className="wrap"><strong>LIBERAMENTE</strong> · una casa per ebook indipendenti. Pagamenti sicuri, download protetti.</div></footer></>}
