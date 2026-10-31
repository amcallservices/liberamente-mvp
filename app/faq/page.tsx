import type {Metadata} from 'next';
import Link from 'next/link';

export const metadata:Metadata={
  title:'Domande frequenti',
  description:'Risposte per lettori e autori su acquisti, ebook, LIBERAMENTE Plus, royalty, pubblicazione e assistenza.',
  alternates:{canonical:'/faq'},
  openGraph:{title:'FAQ | LIBERAMENTE.site',description:'Tutto quello che serve per leggere, pubblicare e usare LIBERAMENTE Plus.'}
};

type Question={question:string;answer:string};
type Section={id:string;label:string;title:string;description:string;questions:Question[];link:{href:string;label:string}};

const sections:Section[]=[
  {
    id:'lettori',label:'Per chi legge',title:'Leggere e acquistare',
    description:'Informazioni su acquisti, libreria personale, anteprime e recensioni.',
    questions:[
      {question:'Che cos’è LIBERAMENTE.site?',answer:'LIBERAMENTE.site è lo store di Scrittore.site dedicato agli ebook di autori indipendenti. Puoi scoprire titoli, acquistarli in sicurezza e ritrovarli nella tua area lettori.'},
      {question:'Come acquisto un ebook?',answer:'Scegli un libro dal catalogo, apri la sua pagina e seleziona Acquista. Il pagamento viene gestito da Stripe con carta e, quando disponibile, con i metodi mostrati al checkout.'},
      {question:'Dove trovo i libri acquistati?',answer:'Dopo un pagamento confermato, il libro compare nella tua Area lettori. Da lì puoi aprire la lettura online e scaricare il file acquistato, secondo le modalità previste dal titolo.'},
      {question:'Posso leggere un estratto prima di acquistare?',answer:'Sì, quando l’autore abilita l’anteprima. Nella pagina del libro troverai il pulsante per aprire l’estratto disponibile.'},
      {question:'Chi può pubblicare una recensione?',answer:'Solo un lettore che ha acquistato realmente il libro può lasciare una recensione dalla propria Area lettori. Questo rende le valutazioni più affidabili.'},
      {question:'Posso chiedere un rimborso?',answer:'Le richieste di rimborso vengono valutate secondo le condizioni applicabili al singolo acquisto e alla normativa vigente. Per assistenza, accedi al tuo account e contattaci.'}
    ],
    link:{href:'/catalogo',label:'Esplora il catalogo'}
  },
  {
    id:'plus',label:'LIBERAMENTE Plus',title:'Un abbonamento, tanti ebook',
    description:'Come funziona il programma di lettura incluso nel piano mensile.',
    questions:[
      {question:'Che cos’è LIBERAMENTE Plus?',answer:'LIBERAMENTE Plus è l’abbonamento mensile che consente di leggere online gli ebook inclusi nel programma Plus, senza acquistare ogni singolo titolo.'},
      {question:'Posso scaricare o stampare i libri Plus?',answer:'No. I titoli Plus si leggono online in modalità sequenziale e non sono disponibili per il download o la stampa attraverso l’abbonamento.'},
      {question:'Come vengono conteggiate le pagine lette?',answer:'La lettura viene registrata quando il lettore conferma la pagina. Il sistema ricorda il punto raggiunto e riparte da lì al successivo accesso.'},
      {question:'Come vengono riconosciuti gli autori?',answer:'Una quota del fondo distribuibile Plus viene assegnata agli autori in base alle pagine lette qualificate. Gli autori ricevono il 60% del fondo previsto e LIBERAMENTE trattiene il 40% per la gestione del servizio.'},
      {question:'Come posso gestire o annullare Plus?',answer:'Dalla sezione Gestione Plus del tuo account puoi aprire il portale sicuro Stripe per consultare lo stato dell’abbonamento, aggiornare il metodo di pagamento o annullare il rinnovo.'}
    ],
    link:{href:'/plus',label:'Scopri LIBERAMENTE Plus'}
  },
  {
    id:'autori',label:'Per chi scrive',title:'Pubblicare con LIBERAMENTE',
    description:'Il percorso editoriale, le royalty e le opzioni di accredito per gli autori.',
    questions:[
      {question:'Come inserisco il mio ebook?',answer:'Dall’Area autori puoi creare la scheda del libro, caricare il manoscritto in PDF, la copertina e i materiali richiesti. Completa i dati editoriali e invia il titolo in revisione.'},
      {question:'Cosa accade dopo l’invio in revisione?',answer:'L’amministrazione valuta il libro. Può pubblicarlo, richiedere correzioni o bloccarlo. Le note della revisione restano visibili nell’area autore, così puoi intervenire e inviarlo nuovamente.'},
      {question:'Posso modificare o eliminare un mio libro?',answer:'Sì. Dall’Area autori puoi modificare i libri secondo il loro stato editoriale o eliminarli. Ogni modifica a un titolo già pubblicato torna in revisione prima di essere resa pubblica.'},
      {question:'Qual è la royalty sulle vendite singole?',answer:'Per le vendite singole l’autore matura una royalty del 50% del prezzo di vendita, al lordo di eventuali imposte applicabili. Il valore stimato viene mostrato anche durante l’inserimento del prezzo.'},
      {question:'Quando vengono pagate le royalty?',answer:'Le royalty maturate da almeno 30 giorni e non oggetto di rimborso sono disponibili per la liquidazione. Nel report autore puoi seguire vendite, letture Plus e compensi.'},
      {question:'Quali modalità di accredito sono disponibili?',answer:'Puoi indicare Stripe Connect, PayPal o bonifico bancario. Per il bonifico sono richiesti IBAN valido, intestatario, banca e contatto WhatsApp, dati che restano disponibili all’amministrazione per la liquidazione.'}
    ],
    link:{href:'/autore',label:'Apri l’Area autori'}
  },
  {
    id:'sicurezza',label:'Sicurezza e supporto',title:'Account, pagamenti e assistenza',
    description:'Le risposte essenziali per usare il servizio in modo sicuro.',
    questions:[
      {question:'I pagamenti sono sicuri?',answer:'Sì. LIBERAMENTE.site utilizza Stripe per elaborare i pagamenti. I dati della carta non vengono gestiti direttamente dallo store.'},
      {question:'Come accedo al mio account?',answer:'Puoi creare un account o accedere dalla pagina Accedi. Se richiesto, conferma il tuo indirizzo email tramite il messaggio ricevuto.'},
      {question:'Come ricevo assistenza?',answer:'Gli utenti registrati trovano il pulsante ASSISTENZA nel menu. Apre una chat WhatsApp dedicata con un messaggio di contesto già compilato.'}
    ],
    link:{href:'/accedi',label:'Accedi o crea un account'}
  }
];

const faqSchema={'@context':'https://schema.org','@type':'FAQPage',mainEntity:sections.flatMap(section=>section.questions.map(item=>({'@type':'Question',name:item.question,acceptedAnswer:{'@type':'Answer',text:item.answer}})))};

export default function FaqPage(){
  return <main className="faq-page">
    <section className="faq-hero">
      <div className="wrap faq-hero-inner">
        <p className="faq-kicker">LIBERAMENTE.site</p>
        <h1>Domande frequenti</h1>
        <p>Tutto quello che serve per leggere, pubblicare e usare LIBERAMENTE Plus in modo semplice e consapevole.</p>
        <nav className="faq-jump-nav" aria-label="Argomenti FAQ">{sections.map(section=><a key={section.id} href={`#${section.id}`}>{section.label}</a>)}</nav>
      </div>
    </section>
    <section className="wrap faq-content" aria-label="Risposte alle domande frequenti">
      {sections.map(section=><section className="faq-section" id={section.id} key={section.id}>
        <div className="faq-section-intro"><p>{section.label}</p><h2>{section.title}</h2><span>{section.description}</span><Link className="faq-section-link" href={section.link.href}>{section.link.label} <span aria-hidden="true">→</span></Link></div>
        <div className="faq-items">{section.questions.map(item=><details key={item.question}><summary>{item.question}</summary><p>{item.answer}</p></details>)}</div>
      </section>)}
    </section>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(faqSchema)}}/>
  </main>;
}
