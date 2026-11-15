import type {Metadata} from 'next';
import Link from 'next/link';
import {marketplaceLocale,marketplacePath} from '@/lib/marketplace';
import {createClient} from '@/lib/supabase/server';
import {updatePassword} from './actions';

export const metadata:Metadata={title:'Nuova password',robots:{index:false,follow:false}};

type Search=Promise<{market?:string;errore?:string}>;

const copy={
  it:{title:'Scegli una nuova password',intro:'Almeno 8 caratteri. Dopo il salvataggio dovrai accedere di nuovo con la nuova password.',password:'Nuova password',confirm:'Ripeti la nuova password',save:'Salva la nuova password',expiredTitle:'Il link non è più valido',expired:'Il link per reimpostare la password è scaduto o è già stato usato. Richiedine uno nuovo: vale per un’ora.',again:'Richiedi un nuovo link',errors:{corta:'La password deve avere almeno 8 caratteri.',diverse:'Le due password non coincidono.',uguale:'La nuova password deve essere diversa da quella precedente.',aggiornamento:'Non è stato possibile aggiornare la password. Riprova.'} as Record<string,string>},
  en:{title:'Choose a new password',intro:'At least 8 characters. After saving, you’ll need to sign in again with the new password.',password:'New password',confirm:'Repeat the new password',save:'Save the new password',expiredTitle:'This link is no longer valid',expired:'The password reset link has expired or was already used. Request a new one: it’s valid for one hour.',again:'Request a new link',errors:{corta:'The password must be at least 8 characters long.',diverse:'The two passwords don’t match.',uguale:'The new password must be different from the previous one.',aggiornamento:'We couldn’t update your password. Please try again.'} as Record<string,string>}
};

export default async function NewPassword({searchParams}:{searchParams:Search}){
  const q=await searchParams;
  const locale=marketplaceLocale(q.market),t=copy[locale];
  const s=await createClient();
  const {data:{user}}=await s.auth.getUser();
  if(!user||q.errore==='scaduto') return <main className="wrap">
    <h1>{t.expiredTitle}</h1>
    <p className="notice" role="alert">{t.expired}</p>
    <p><Link className="button" href={marketplacePath(locale,'/accedi/recupero')}>{t.again}</Link></p>
  </main>;
  const error=q.errore?t.errors[q.errore]??t.errors.aggiornamento:'';
  return <main className="wrap">
    <h1>{t.title}</h1>
    <p className="muted">{t.intro}</p>
    {error&&<p className="notice" role="alert">{error}</p>}
    <form action={updatePassword} className="card">
      <input type="hidden" name="lang" value={locale}/>
      <input type="email" name="username" autoComplete="username" value={user.email??''} readOnly hidden/>
      <label htmlFor="password">{t.password}</label>
      <input id="password" name="password" type="password" autoComplete="new-password" required minLength={8}/>
      <label htmlFor="confirm">{t.confirm}</label>
      <input id="confirm" name="confirm" type="password" autoComplete="new-password" required minLength={8}/>
      <button>{t.save}</button>
    </form>
  </main>;
}
