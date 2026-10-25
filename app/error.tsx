'use client';

export default function GlobalError({reset}:{reset:()=>void}){
  return <main className="wrap"><h1>Qualcosa non ha funzionato</h1><p className="notice">La pagina non è stata caricata correttamente. Puoi riprovare senza perdere dati o tornare alla pagina di accesso.</p><p><button onClick={reset}>Riprova</button>{' '}<a className="button alt" href="/accedi">Vai all’accesso</a></p></main>;
}
