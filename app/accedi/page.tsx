import {signIn,signUp} from './actions';

type SearchParams = Promise<{errore?:string;messaggio?:string}>;

const errors:Record<string,string>={
  credenziali_non_valide:'Email o password non corrette.',
  registrazione:'Non è stato possibile creare l’account. Verifica i dati e riprova.',
};

export default async function Login({searchParams}:{searchParams:SearchParams}){
  const q=await searchParams;
  const notice=q.errore?errors[q.errore]??'Si è verificato un errore. Riprova.':q.messaggio;
  return <main className="wrap"><h1>Accedi o registrati</h1>{notice&&<p className="notice" role="status">{notice}</p>}<div className="grid"><form action={signIn} className="card"><h2>Accedi</h2><label>Email</label><input name="email" type="email" autoComplete="email" required/><label>Password</label><input name="password" type="password" autoComplete="current-password" required minLength={8}/><button>Accedi</button></form><form action={signUp} className="card"><h2>Crea account</h2><label>Nome pubblico</label><input name="name" autoComplete="name" required maxLength={80}/><label>Email</label><input name="email" type="email" autoComplete="email" required/><label>Password</label><input name="password" type="password" autoComplete="new-password" required minLength={8}/><button>Registrati</button></form></div></main>
}
