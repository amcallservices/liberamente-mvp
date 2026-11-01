import Link from 'next/link';
import type {ReactNode} from 'react';

export default function AdminLayout({children}:{children:ReactNode}){
  return <><nav aria-label="Strumenti amministrazione" style={{maxWidth:1100,margin:'18px auto -4px',padding:'0 24px',display:'flex',justifyContent:'flex-end',gap:10}}><Link className="button alt" href="/admin">Gestione libri</Link><Link className="button" href="/admin/recensioni">Gestisci recensioni</Link></nav>{children}</>;
}
