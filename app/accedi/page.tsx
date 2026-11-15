import Link from 'next/link';
import {signIn,signUp} from './actions';

type SearchParams = Promise<{errore?:string;messaggio?:string;next?:string;market?:string}>;

const errors:Record<string,string>={
  credenziali_non_valide:'Email o password non corrette.',
  registrazione:'Non è stato possibile creare l’account. Verifica i dati e riprova.',
};

export default async function Login({searchParams}:{searchParams:SearchParams}){
  const q=await searchParams;
  const next=q.next?.startsWith('/')&&!q.next.startsWith('//')?q.next:'';
  const english=next.startsWith('/en')||q.market==='en';
  const messages:Record<string,string>={password_aggiornata:english?'Password updated. Sign in with your new password.':'Password aggiornata. Accedi con la nuova password.'};
  const notice=q.errore?errors[q.errore]??'Si è verificato un errore. Riprova.':q.messaggio?messages[q.messaggio]??q.messaggio.replace(/-/g,' '):undefined;
  return <main className="wrap"><h1>{english?'Sign in or create an account':'Accedi o registrati'}</h1>{notice&&<p className="notice" role="status">{notice}</p>}<div className="grid"><form action={signIn} className="card"><input type="hidden" name="next" value={next}/><h2>{english?'Sign in':'Accedi'}</h2><label>Email</label><input name="email" type="email" autoComplete="email" required/><label>{english?'Password':'Password'}</label><input name="password" type="password" autoComplete="current-password" required minLength={8}/><button>{english?'Sign in':'Accedi'}</button><p><Link className="text-link" href={english?'/en/accedi/recupero':'/accedi/recupero'}>{english?'Forgot your password?':'Password dimenticata?'}</Link></p></form><form action={signUp} className="card"><input type="hidden" name="next" value={next}/><h2>{english?'Create account':'Crea account'}</h2><label>{english?'Public name':'Nome pubblico'}</label><input name="name" autoComplete="name" required maxLength={80}/><label>Email</label><input name="email" type="email" autoComplete="email" required/><label>{english?'Password':'Password'}</label><input name="password" type="password" autoComplete="new-password" required minLength={8}/><button>{english?'Register':'Registrati'}</button></form></div></main>
}
