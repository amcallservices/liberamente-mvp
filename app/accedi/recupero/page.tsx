import type {Metadata} from 'next';
import Link from 'next/link';
import {marketplaceLocale,marketplacePath} from '@/lib/marketplace';
import {requestPasswordReset} from './actions';

export const metadata:Metadata={title:'Recupera la password',robots:{index:false,follow:false}};

type Search=Promise<{market?:string;inviata?:string;errore?:string}>;

const copy={
  it:{title:'Hai dimenticato la password?',intro:'Inserisci l’email del tuo account: ti mandiamo un link per scegliere una nuova password.',email:'Email',send:'Invia il link',sent:'Se l’indirizzo è registrato, tra pochi minuti riceverai un’email con il link per reimpostare la password. Controlla anche la cartella spam o promozioni. Il link vale per un’ora.',errors:{email:'Inserisci un indirizzo email valido.',troppe:'Hai fatto troppe richieste ravvicinate. Riprova tra qualche minuto.'} as Record<string,string>,back:'Torna all’accesso'},
  en:{title:'Forgot your password?',intro:'Enter your account email and we’ll send you a link to choose a new password.',email:'Email',send:'Send the link',sent:'If the address is registered, you’ll receive an email with a reset link within a few minutes. Check your spam or promotions folder too. The link is valid for one hour.',errors:{email:'Please enter a valid email address.',troppe:'Too many requests in a short time. Please try again in a few minutes.'} as Record<string,string>,back:'Back to sign in'}
};

export default async function PasswordRecovery({searchParams}:{searchParams:Search}){
  const q=await searchParams;
  const locale=marketplaceLocale(q.market),t=copy[locale];
  const error=q.errore?t.errors[q.errore]??t.errors.email:'';
  return <main className="wrap">
    <h1>{t.title}</h1>
    {q.inviata?<p className="notice" role="status">{t.sent}</p>:<>
      <p className="muted">{t.intro}</p>
      {error&&<p className="notice" role="alert">{error}</p>}
      <form action={requestPasswordReset} className="card">
        <input type="hidden" name="lang" value={locale}/>
        <label htmlFor="email">{t.email}</label>
        <input id="email" name="email" type="email" autoComplete="email" required/>
        <button>{t.send}</button>
      </form>
    </>}
    <p><Link className="text-link" href={marketplacePath(locale,'/accedi')}>{t.back}</Link></p>
  </main>;
}
