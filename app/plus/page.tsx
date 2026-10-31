import Link from 'next/link';
import type {Metadata} from 'next';
import { createClient } from '@/lib/supabase/server';
import { isPlusActive } from '@/lib/plus';
import {marketplaceLocale,marketplacePath} from '@/lib/marketplace';

export const metadata:Metadata={title:'LIBERAMENTE Plus',description:'Con LIBERAMENTE Plus leggi online gli ebook aderenti al programma e sostieni gli autori in base alle pagine lette qualificate.',alternates:{canonical:'/plus'},openGraph:{title:'LIBERAMENTE Plus | Ebook da leggere online',description:'Un abbonamento mensile per leggere online gli ebook inclusi e sostenere gli autori indipendenti.'}};

const notices: Record<string, string> = {
  configurazione: 'Il piano Plus non è ancora pronto. Riprova tra poco.',
  abbonamento: 'Non abbiamo trovato un abbonamento da gestire. Attendi qualche istante dopo il pagamento e riprova.',
  gestione: 'Il portale di gestione non è disponibile in questo momento. Riprova tra poco oppure contatta l’assistenza.',
  annullato: 'Hai annullato il checkout: non è stato addebitato nulla.',
  attivo: 'Il tuo abbonamento Plus è già attivo.',
};

export default async function Plus({ searchParams }: { searchParams: Promise<{ errore?: string; stato?: string; market?:string }> }) {
  const query = await searchParams;
  const locale=marketplaceLocale(query.market),english=locale==='en',local=(path:string)=>marketplacePath(locale,path);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: subscription } = user
    ? await supabase.from('plus_subscriptions').select('status,current_period_end,cancel_at_period_end').eq('reader_id', user.id).maybeSingle()
    : { data: null };
  const active = isPlusActive(subscription?.status);
  const notice = query.errore ? notices[query.errore] : query.stato ? notices[query.stato] : null;

  return <main className="wrap plus-page">
    <section className="plus-hero">
      <p className="eyebrow">LIBERAMENTE Plus</p>
      <h1>{english?'Read more. Support independent writers.':'Leggi di più. Sostieni chi scrive.'}</h1>
      <p className="plus-lead">{english?'One subscription to read ebooks in the Plus programme. Each confirmed page contributes transparently to the share due to authors.':'Un solo abbonamento per leggere gli ebook inclusi nel programma Plus. Ogni pagina confermata dal lettore contribuisce in modo trasparente alla quota destinata agli autori.'}</p>
      <div className="plus-price"><strong>4,99 €</strong><span>{english?'per month · cancel anytime':'al mese · annulla quando vuoi'}</span></div>
      {notice && <p className="notice">{notice}</p>}

      <div className="plus-actions plus-actions-visible" aria-label="Azioni LIBERAMENTE Plus">
        {active ? <>
          <span className="plus-active-label">✓ Abbonamento Plus attivo</span>
          <Link className="button plus-explore-cta" href={local('/lettore/plus')}>{english?'Explore Plus titles':'Esplora i titoli Plus'}</Link>
          <form action="/api/plus/portal" method="POST"><input type="hidden" name="market" value={locale}/><button className="button alt">{english?'Manage subscription':'Gestisci abbonamento'}</button></form>
        </> : user ? <>
          <form action="/api/plus/checkout" method="POST"><input type="hidden" name="market" value={locale}/><button className="button">{english?'Activate LIBERAMENTE Plus':'Attiva LIBERAMENTE Plus'}</button></form>
          <Link className="button plus-explore-cta" href={local('/catalogo?plus=1')}>{english?'Explore Plus titles':'Esplora i titoli Plus'}</Link>
          <Link className="plus-manage-hint" href={local('/plus?errore=abbonamento')}>{english?'Manage subscription':'Gestisci abbonamento'}</Link>
        </> : <>
          <Link className="button" href={local(`/accedi?next=${encodeURIComponent(local('/plus'))}`)}>{english?'Activate LIBERAMENTE Plus':'Attiva LIBERAMENTE Plus'}</Link>
          <Link className="button plus-explore-cta" href={local('/catalogo?plus=1')}>{english?'Explore Plus titles':'Esplora i titoli Plus'}</Link>
          <Link className="plus-manage-hint" href={local(`/accedi?next=${encodeURIComponent(local('/plus'))}`)}>{english?'Manage subscription':'Gestisci abbonamento'}</Link>
        </>}
      </div>
    </section>

    <section className="plus-grid">
      <article><span>01</span><h2>{english?'For readers':'Per lettori'}</h2><p>{english?'Access published Plus titles, read PDFs online and keep a personal library without changing individually purchased ebooks.':'Accesso ai titoli Plus pubblicati, lettura online in PDF e libreria personale, senza cambiare gli ebook acquistati singolarmente.'}</p></article>
      <article><span>02</span><h2>{english?'For authors':'Per autori'}</h2><p>{english?'Joining is optional. Titles remain editable and continue to be sold separately.':'L’adesione del libro è facoltativa. I titoli restano modificabili e continuano a vendersi anche separatamente.'}</p></article>
      <article><span>03</span><h2>{english?'Transparent distribution':'Ripartizione trasparente'}</h2><p>{english?'Each month 60% of the distributable fund goes to authors based on qualified pages read; 40% remains with LIBERAMENTE for operating and growing the service.':'Ogni mese il 60% del fondo distribuibile va agli autori in base alle pagine lette qualificate; il 40% resta a LIBERAMENTE per gestione e crescita del servizio.'}</p></article>
    </section>

    <section className="plus-terms">
      <h2>{english?'How author compensation is calculated':'Come vengono calcolati i compensi'}</h2>
      <p>{english?'A page counts when the reader explicitly confirms it. The same page can only count once per reader, book and month. Payment fees, taxes, refunds and reserves are deducted from Plus revenue. Of the remainder, 60% forms the author fund. Amounts are consolidated for 30 days and reported monthly. Final amounts remain subject to administrative and tax checks.':'Una pagina vale quando il lettore la conferma esplicitamente. La stessa pagina può essere conteggiata una sola volta per lettore, libro e mese. Dal fatturato Plus vengono sottratti commissioni di pagamento, imposte, rimborsi e riserve. Del residuo, il 60% forma il fondo autori. Le somme sono consolidate per 30 giorni e quindi rendicontate mensilmente. L’importo definitivo resta soggetto a verifica amministrativa e fiscale.'}</p>
    </section>
  </main>;
}
