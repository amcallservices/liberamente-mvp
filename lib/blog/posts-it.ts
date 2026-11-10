import type {BlogPost} from './index';

const D='2026-11-10';

export const italianPosts:BlogPost[]=[
{
id:'publish-guide',slug:'come-pubblicare-un-ebook',audience:'authors',published:D,updated:D,
title:'Come pubblicare un ebook nel 2026: la guida passo passo',
description:'Dal manoscritto al primo lettore: file, copertina, ISBN, prezzo, piattaforme e promozione. La guida pratica per pubblicare un ebook da indipendente nel 2026.',
excerpt:'Dal manoscritto finito al primo lettore: cosa preparare, quanto costa, quali scelte contano davvero e quali errori evitare quando pubblichi da indipendente.',
keywords:['come pubblicare un ebook','pubblicare un libro da indipendente','self publishing 2026','autopubblicazione ebook','pubblicare ebook gratis'],
body:`Pubblicare un ebook oggi non richiede un editore né un investimento iniziale importante. Richiede però alcune scelte fatte bene: un testo curato, un file leggibile, una copertina che funzioni anche in piccolo e un prezzo sensato. In questa guida mettiamo in fila i passaggi, nell'ordine in cui conviene affrontarli.

## 1. Finisci (davvero) il testo

Il primo passo è anche quello che si salta più spesso. Prima di pensare alla copertina, fai rileggere il manoscritto ad almeno due persone che non ti conoscono troppo bene, poi passa a una revisione di bozze. Refusi e incoerenze sono la prima ragione delle recensioni negative per i libri indipendenti, e non si recuperano con la promozione.

Se il libro è ancora in lavorazione, uno strumento di scrittura guidata come [Scrittore.site](https://scrittoresite.streamlit.app/) può aiutarti a impostare struttura, capitoli e revisione.

## 2. Prepara il file

Il formato dipende da dove vendi. Gli store come Kindle e Kobo lavorano soprattutto con EPUB o con file Word che convertono loro. Su LIBERAMENTE carichi invece il manoscritto in **PDF**: impaginazione fissa, quindi quello che vedi è esattamente quello che vedrà il lettore.

Per un PDF che si legga bene anche sul telefono:

- usa un formato pagina contenuto (A5 o 6×9 pollici) e margini generosi;
- scegli un corpo del testo tra 11 e 12 punti, con interlinea ampia;
- inserisci un indice con collegamenti ai capitoli;
- esporta con il testo selezionabile, non come immagini scansionate.

## 3. Crea una copertina che si legga in miniatura

Nel catalogo la tua copertina sarà grande come un francobollo. Titolo leggibile, un'immagine forte e niente dettagli minuti: prova sempre a guardarla ridotta a 200 pixel di larghezza prima di approvarla. Usa immagini di cui hai i diritti.

## 4. Decidi se ti serve un ISBN

Per un ebook l'ISBN non è sempre obbligatorio, ma ha conseguenze pratiche: identifica l'edizione nei cataloghi e, in Italia, è la condizione per applicare l'IVA agevolata al 4% sugli ebook. Ne parliamo nel dettaglio nella guida [ISBN per ebook: serve davvero?](/blog/isbn-ebook-serve-davvero).

## 5. Scegli il prezzo

Per la narrativa indipendente la maggior parte degli ebook si colloca tra 2,99 € e 9,99 €. Un prezzo troppo basso può far sembrare il libro poco curato, uno troppo alto frena chi non ti conosce ancora. Considera la lunghezza, il genere e quanto guadagni per copia sulle diverse piattaforme: lo spieghiamo in [Royalty degli ebook a confronto](/blog/royalty-ebook-confronto).

## 6. Scegli dove pubblicare

Puoi pubblicare in esclusiva su una sola piattaforma o essere presente su più store. Le due strade hanno vantaggi diversi: l'esclusiva può dare accesso a programmi in abbonamento, la distribuzione ampia ti rende meno dipendente da un solo canale.

Su LIBERAMENTE il percorso è questo:

1. dall'[Area autori](/autore) crei la scheda del libro e carichi PDF, copertina e dati editoriali;
2. invii il titolo in revisione: la redazione lo approva, chiede correzioni o lo rifiuta, e le note restano visibili nella tua area;
3. una volta pubblicato, ricevi il **50% del prezzo** su ogni vendita singola, con le royalty liquidabili dopo 30 giorni;
4. puoi aderire a [LIBERAMENTE Plus](/plus), l'abbonamento in cui gli autori sono pagati in base alle pagine lette.

## 7. Prepara il lancio prima della pubblicazione

Un libro pubblicato senza nessuno che lo aspetta resta invisibile. Nelle settimane prima dell'uscita raccogli qualche contatto, prepara un estratto da far leggere e chiedi a lettori di fiducia di essere tra i primi. Abbiamo raccolto le idee che non richiedono budget in [Come promuovere il tuo libro senza spendere](/blog/promuovere-libro-senza-budget).

## Gli errori più comuni

- Pubblicare la prima stesura, senza revisione esterna.
- Una copertina fatta in fretta, illeggibile in miniatura.
- Una descrizione del libro che riassume la trama invece di far venire voglia di leggerlo.
- Sparire dopo l'uscita: le prime settimane contano, ma un libro vende per anni se continui a parlarne.

> Pubblicare è l'inizio, non la fine del lavoro. Un buon testo, un file curato e qualche lettore che parla del libro valgono più di qualsiasi trucco.`,
sources:[{title:'KDP – Codici ISBN e sigla editoriale',url:'https://kdp.amazon.com/it_IT/help/topic/G201834170'},{title:'LIBERAMENTE.site – Domande frequenti per autori',url:'https://liberamente.site/faq'}]
},
{
id:'royalties',slug:'royalty-ebook-confronto',audience:'authors',published:D,updated:D,
title:'Royalty degli ebook a confronto: quanto guadagna davvero un autore indipendente',
description:'Kindle, Kobo e LIBERAMENTE a confronto: percentuali, fasce di prezzo, costi di consegna e cosa cambia dal luglio 2026. Esempi pratici su un ebook da 6 €.',
excerpt:'Percentuali, fasce di prezzo e costi nascosti: un confronto onesto, con esempi in euro, per capire quanto resta davvero in tasca all’autore per ogni copia venduta.',
keywords:['royalty ebook','quanto guadagna un autore','royalty kindle 70%','kobo writing life royalty','guadagnare con gli ebook'],
body:`"Quanto guadagno per copia?" è la prima domanda di chi pubblica da indipendente. La risposta dipende dalla piattaforma, dal prezzo e da alcune regole che non sempre sono evidenti. Ecco come funzionano oggi le principali.

## Amazon Kindle (KDP)

KDP offre due opzioni di royalty: **35%** e **70%**. Il 70% vale solo in una fascia di prezzo precisa. Dal **7 luglio 2026** la fascia sull'Amazon americano va da 2,99 $ a 12,99 $ (prima il tetto era 9,99 $), con importi equivalenti negli altri store: in euro va da 2,69 € a 12,99 €. Fuori da questa fascia si ricade nel 35%.

Due dettagli pesano sul calcolo del 70%:

- la percentuale si applica al prezzo **senza IVA**;
- Amazon sottrae un **costo di consegna** in base al peso del file (sull'Amazon americano 0,15 $ per megabyte). Per un romanzo di solo testo è poco; per un libro pieno di immagini può rendere più conveniente il 35%.

In alcuni paesi (Brasile, Giappone, Messico, India) il 70% richiede l'adesione esclusiva a KDP Select.

## Kobo Writing Life

Kobo paga il **70%** del prezzo di listino (al netto delle tasse) quando il prezzo è almeno 1,99 € in euro (2,99 $ in dollari), e il **45%** sotto questa soglia. Non c'è un tetto massimo e non c'è un costo di consegna per megabyte.

## LIBERAMENTE

Su LIBERAMENTE l'autore riceve il **50% del prezzo di vendita** su ogni copia venduta singolarmente, senza fasce di prezzo e senza costi di consegna. Le royalty diventano liquidabili dopo 30 giorni, se la vendita non è stata rimborsata, e puoi scegliere tra Stripe Connect, PayPal o bonifico. Con [LIBERAMENTE Plus](/plus) c'è un secondo canale: il 60% del fondo distribuibile dell'abbonamento è ripartito tra gli autori in base alle pagine lette qualificate.

## Un esempio con un ebook da 6 €

Prendiamo un romanzo di solo testo, file da 1 MB, venduto a 6 € IVA inclusa a un lettore italiano (IVA ebook al 4%, quindi circa 5,77 € netti).

- **Kindle, opzione 70%:** circa il 70% di 5,77 € meno il costo di consegna, quindi intorno a 4 €.
- **Kobo, 70%:** il 70% del prezzo al netto delle tasse, circa 4 €.
- **LIBERAMENTE:** il 50% del prezzo, cioè 3 €.

Sui grandi store la percentuale per copia è più alta. Allora perché affiancare uno store indipendente?

## La percentuale non è tutto

Quello che guadagni in un anno dipende da **quante copie vendi**, non solo da quanto prendi per copia. Nei grandi store il tuo libro compete con milioni di titoli; in un catalogo più piccolo e dedicato agli indipendenti è più facile essere visti. Conta anche:

- **l'esclusiva:** pubblicare su più canali ti rende meno dipendente dalle regole di uno solo;
- **il rapporto con i lettori:** recensioni solo da acquisti verificati ed estratti gratuiti aiutano chi scopre un autore nuovo;
- **la semplicità:** nessuna fascia di prezzo da rispettare e nessun calcolo legato al peso del file.

> Una strategia comune tra gli indipendenti è distribuire lo stesso ebook su più store, purché non si aderisca a programmi in esclusiva. Controlla sempre le condizioni di ciascuna piattaforma.

## In sintesi

1. Sui grandi store la royalty più alta vale solo entro certe fasce di prezzo e può avere costi di consegna.
2. Lo stesso libro può stare su più piattaforme, se non scegli l'esclusiva.
3. Per un autore che parte da zero, la visibilità vale quanto la percentuale.

Vuoi provare? Puoi caricare il tuo ebook dall'[Area autori](/autore): il guadagno stimato per copia ti viene mostrato mentre inserisci il prezzo.`,
sources:[{title:'KDP – Requisiti di prezzo per gli eBook (fascia 70% dal 7 luglio 2026)',url:'https://kdp.amazon.com/en_US/help/topic/G200634560'},{title:'KDP – Opzioni royalty per i libri digitali',url:'https://kdp.amazon.com/help/topic/A29FL26OKE7R7B'},{title:'Kobo Writing Life – Royalty structure',url:'https://kobowritinglife.zendesk.com/hc/en-us/articles/360058976032'},{title:'LIBERAMENTE.site – Domande frequenti',url:'https://liberamente.site/faq'}]
},
{
id:'isbn',slug:'isbn-ebook-serve-davvero',audience:'authors',published:D,updated:D,
title:'ISBN per ebook: serve davvero? Costi, obblighi e IVA al 4%',
description:'Quando un ebook ha bisogno dell’ISBN, quanto costa in Italia con EDISER, perché ogni formato ha il suo codice e cosa c’entra l’IVA agevolata al 4%.',
excerpt:'Non sempre è obbligatorio, ma per un ebook italiano l’ISBN fa la differenza su cataloghi, distribuzione e IVA. Ecco quando conviene e quanto costa.',
keywords:['isbn ebook','isbn obbligatorio','costo isbn italia','ediser isbn','iva ebook 4%'],
body:`L'ISBN (International Standard Book Number) è il codice di 13 cifre che identifica in modo univoco una specifica edizione di un libro. Lo vedi sul retro dei libri di carta, ma esiste anche per gli ebook. La domanda è: a te serve?

## È obbligatorio?

Per pubblicare un ebook non sempre. Amazon, per esempio, dichiara che per gli eBook su KDP il codice ISBN non è necessario: in quel caso il libro è identificato da un codice interno. Molte piattaforme funzionano allo stesso modo.

Ci sono però tre buone ragioni per averne uno.

## 1. Identifica il tuo libro ovunque

Con un ISBN il tuo ebook è riconoscibile in modo univoco da librerie, biblioteche, distributori e cataloghi. È utile se vuoi essere presente su più store, comparire nelle banche dati bibliografiche o essere preso sul serio da chi seleziona i libri.

## 2. Ogni formato ha il suo codice

L'ISBN identifica un'**edizione in un formato**. Se lo stesso libro esce in cartaceo e in ebook, servono due codici diversi; anche formati digitali diversi dello stesso testo (per esempio PDF ed EPUB) dovrebbero avere ciascuno il proprio ISBN.

## 3. In Italia incide sull'IVA

È il punto meno conosciuto. Dal 2015 in Italia gli ebook godono dell'IVA agevolata al **4%**, come i libri di carta, invece dell'aliquota ordinaria del 22%. Secondo l'Agenzia delle Entrate, però, per i prodotti editoriali elettronici il codice **ISBN** (o ISSN per i periodici) è una delle condizioni per applicare l'aliquota ridotta. Senza codice, un ebook rischia di essere trattato come un normale servizio digitale.

> Le regole fiscali dipendono dalla tua situazione: se vendi abitualmente, chiedi conferma al tuo commercialista su aliquota e adempimenti.

## Quanto costa in Italia

In Italia gli ISBN sono rilasciati da **EDISER**, la società di servizi dell'Associazione Italiana Editori che gestisce l'agenzia ISBN per l'area di lingua italiana (sito [isbn.it](https://www.isbn.it)). Anche autori indipendenti e pubblicazioni occasionali possono acquistarli, singolarmente o in piccoli blocchi: secondo le tariffe riportate a fine 2025, un singolo codice costa circa 60 € più IVA e un blocco da 5 circa 200 € più IVA. Verifica sempre il listino aggiornato prima di acquistare.

Alcune piattaforme offrono un ISBN gratuito (KDP, per esempio, solo per il cartaceo). In quel caso, però, l'editore registrato è la piattaforma e spesso il codice non si può usare altrove.

## Quando conviene comprarlo

- Pubblichi in più formati o su più store: un ISBN tuo ti segue ovunque.
- Vendi in modo continuativo in Italia e vuoi l'IVA agevolata.
- Vuoi una sigla editoriale tua, con il tuo nome o quello del tuo marchio.

Se invece stai solo provando a pubblicare un primo racconto, puoi partire anche senza e aggiungerlo per l'edizione definitiva. Ricorda solo che un ISBN assegnato a un'edizione non si riusa per un'altra.

## E su LIBERAMENTE?

Nell'[Area autori](/autore) puoi inserire i dati editoriali del tuo libro, compreso l'ISBN se lo hai. Se stai preparando la pubblicazione, leggi anche [Come pubblicare un ebook nel 2026](/blog/come-pubblicare-un-ebook).`,
sources:[{title:'KDP – Codici ISBN e sigla editoriale',url:'https://kdp.amazon.com/it_IT/help/topic/G201834170'},{title:'Geopop – Cos’è il codice ISBN e quanto costa (ottobre 2025)',url:'https://www.geopop.it/codice-isbn-cose-a-che-serve-libri/'},{title:'Fiscomania – Regime IVA nell’editoria',url:'https://fiscomania.com/regime-iva-editoria-guida/'},{title:'Agenzia ISBN per l’area di lingua italiana',url:'https://www.isbn.it'}]
},
{
id:'accessibility',slug:'accessibilita-ebook-european-accessibility-act',audience:'authors',published:D,updated:D,
title:'Ebook accessibili e European Accessibility Act: cosa cambia per gli autori',
description:'Dal 28 giugno 2025 gli ebook rientrano nell’European Accessibility Act. Chi è obbligato, l’esenzione per le microimprese e come rendere accessibile un PDF.',
excerpt:'Dal giugno 2025 la normativa europea sull’accessibilità riguarda anche gli ebook. Chi deve adeguarsi, chi è esentato e cosa puoi fare comunque per i tuoi lettori.',
keywords:['european accessibility act ebook','ebook accessibili','accessibilità pdf','eaa editoria','d.lgs 82/2022'],
body:`Dal **28 giugno 2025** si applica in tutta l'Unione Europea la Direttiva (UE) 2019/882, conosciuta come European Accessibility Act. In Italia è stata recepita con il decreto legislativo 82 del 2022. Tra i servizi coinvolti ci sono anche gli **ebook**: un cambiamento che riguarda tutta la filiera dell'editoria digitale.

## Che cosa chiede la norma

L'obiettivo è che le persone con disabilità, per esempio chi è cieco o ipovedente, chi ha dislessia o difficoltà motorie, possano usare prodotti e servizi digitali in autonomia. Per un ebook significa, in pratica, che deve poter essere letto anche con tecnologie assistive: lettori di schermo, ingrandimento, sintesi vocale, navigazione da tastiera.

## Chi è obbligato

Gli obblighi si applicano agli operatori economici che offrono questi servizi ai consumatori nell'Unione, anche se hanno sede fuori dall'UE. È prevista però un'esenzione importante: le **microimprese**, cioè le imprese con meno di 10 dipendenti e un fatturato annuo non superiore a 2 milioni di euro, sono esentate per quanto riguarda i servizi. Molti autori indipendenti rientrano in questa categoria.

Ci sono anche regole transitorie: alcuni servizi già forniti prima del 28 giugno 2025 hanno tempo fino al 2030, salvo modifiche sostanziali.

> Questo articolo è informativo e non sostituisce una consulenza legale. Se pubblichi come casa editrice o superi le soglie delle microimprese, verifica la tua posizione con un professionista.

## Perché conviene comunque

Anche se sei esentato, un ebook accessibile è semplicemente un ebook migliore: si legge meglio su schermi piccoli, funziona con la sintesi vocale e raggiunge più lettori. In Italia milioni di persone hanno difficoltà di lettura di qualche tipo: escluderle non conviene a nessuno.

## Come rendere più accessibile un PDF

Su LIBERAMENTE gli ebook sono in PDF. Ecco le buone pratiche che puoi applicare già quando esporti il file dal tuo programma di scrittura:

1. **Testo vero, non immagini.** Non scansionare le pagine: il testo deve essere selezionabile, altrimenti un lettore di schermo non può leggerlo.
2. **Usa gli stili per i titoli.** Imposta i capitoli come Titolo 1, i paragrafi come Titolo 2 e così via: diventano la struttura navigabile del PDF.
3. **Esporta un PDF con tag.** In Word, LibreOffice e InDesign c'è l'opzione per includere i tag di accessibilità e i segnalibri: attivala.
4. **Testo alternativo per le immagini.** Descrivi brevemente ogni immagine significativa; le decorazioni possono essere marcate come tali.
5. **Imposta lingua e titolo del documento** nelle proprietà del file.
6. **Contrasto e leggibilità.** Testo scuro su fondo chiaro, corpo non troppo piccolo, niente testo su immagini complesse.
7. **Indice con collegamenti** per spostarsi tra i capitoli.

Esistono strumenti di verifica, come il controllo di accessibilità di Adobe Acrobat o il programma gratuito PAC, che segnalano i problemi più comuni.

## In sintesi

- L'European Accessibility Act riguarda anche gli ebook dal 28 giugno 2025.
- Le microimprese sono esentate per i servizi, ma la buona pratica resta consigliata.
- Bastano pochi accorgimenti all'esportazione per un PDF molto più accessibile.

Stai preparando il file del tuo libro? Riparti dalla [guida alla pubblicazione](/blog/come-pubblicare-un-ebook) e poi caricalo dall'[Area autori](/autore).`,
sources:[{title:'Agenda Digitale – European Accessibility Act ed editoria digitale (C. Mussinelli, Fondazione LIA)',url:'https://www.agendadigitale.eu/?p=248812'},{title:'Diritto.it – Accessibility Act: guida giuridico-operativa',url:'https://www.diritto.it/accessibility-act-guida-giuridico-operativa/'},{title:'greenMe – Accessibilità digitale obbligatoria dal 28 giugno 2025 ed esenzione microimprese',url:'https://www.greenme.it/?p=1242558'},{title:'iubenda – Guida all’European Accessibility Act',url:'https://www.iubenda.com/it/help/181740-eaa-compliance'}]
},
{
id:'promote',slug:'promuovere-libro-senza-budget',audience:'authors',published:D,updated:D,
title:'Come promuovere il tuo libro senza spendere: 9 idee che funzionano',
description:'Promuovere un libro da autore indipendente senza budget pubblicitario: estratti, recensioni verificate, video brevi, newsletter, bookblogger e lancio.',
excerpt:'Non serve un budget pubblicitario per far conoscere il tuo libro. Servono costanza e qualche strumento giusto: ecco nove idee concrete da mettere in pratica subito.',
keywords:['promuovere un libro','marketing per autori','promozione libro gratis','autore indipendente social','booktok italia'],
body:`Molti autori indipendenti scoprono dopo l'uscita che pubblicare è la parte facile. Far sapere che il libro esiste è il vero lavoro. La buona notizia: le strategie più efficaci costano tempo, non denaro.

## 1. Attiva l'estratto gratuito

Chi non ti conosce vuole provare prima di comprare. Su LIBERAMENTE puoi abilitare un'anteprima leggibile direttamente nella pagina del libro: è il modo più semplice per convincere un lettore indeciso. Scegli un estratto che si regga da solo e finisca con una domanda aperta.

## 2. Cura la pagina del libro

Titolo, sottotitolo, copertina e descrizione lavorano per te ventiquattr'ore al giorno. La descrizione non deve riassumere la trama: deve dire a chi è rivolto il libro e cosa proverà leggendolo. Rileggila ad alta voce: se annoia te, annoierà anche gli altri.

## 3. Parti dalle persone che conosci

I primi lettori sono quasi sempre amici, colleghi e conoscenti. Non chiedere solo di comprare: chiedi di **condividere** il link e, se il libro è piaciuto, di lasciare una recensione. Su LIBERAMENTE le recensioni possono lasciarle solo lettori che hanno acquistato il libro: per questo valgono di più.

## 4. Video brevi, una volta a settimana

TikTok e Instagram Reels sono diventati vetrine importanti per la lettura (BookTok, Bookstagram). Non servono produzioni professionali:

- leggi a voce l'incipit;
- mostra il luogo che ha ispirato la storia;
- racconta in 20 secondi un personaggio;
- rispondi alla domanda "perché hai scritto questo libro?".

La regolarità conta più della qualità: un video a settimana per tre mesi vale più di dieci video in un giorno.

## 5. Una newsletter, anche piccola

Una lista di email è l'unico pubblico che ti appartiene davvero: i social cambiano le regole, la tua lista resta. Offri qualcosa in cambio dell'iscrizione (un racconto inedito, un capitolo in anteprima) e scrivi una volta al mese.

## 6. Bookblogger e bookstagrammer

Cerca profili che recensiscono il tuo genere, anche piccoli, e proponi una copia gratuita in cambio di una recensione onesta. Scrivi un messaggio personale, spiega perché hai scelto proprio loro e accetta i no con gentilezza.

## 7. Gruppi e comunità di lettori

Gruppi Facebook, forum e community di genere sono pieni di lettori in cerca di consigli. Partecipa davvero alle discussioni e parla del tuo libro solo quando è pertinente: la promozione insistente ottiene l'effetto opposto.

## 8. Contenuti che si trovano su Google

Un articolo sul tema del tuo libro (la storia del luogo in cui è ambientato, la ricetta che il protagonista cucina, la ricerca che hai fatto) può portare lettori per anni. Pensa a cosa cercherebbe chi amerebbe il tuo libro.

## 9. Un lancio con una data

Fissa un giorno di uscita e preparalo: avvisa la tua lista, programma un post, chiedi ai primi lettori di condividere nello stesso giorno. La concentrazione di attenzione aiuta il libro a farsi notare.

> Non devi fare tutto. Scegli due o tre di queste idee e portale avanti per tre mesi: funziona più della dispersione.

## Da dove iniziare oggi

1. Attiva l'estratto e rileggi la descrizione del libro.
2. Manda il link a dieci persone, chiedendo di condividerlo.
3. Registra il primo video, anche imperfetto.

Non hai ancora pubblicato? Parti dalla [guida passo passo](/blog/come-pubblicare-un-ebook) e dall'[Area autori](/autore).`,
sources:[{title:'LIBERAMENTE.site – Domande frequenti (anteprime e recensioni verificate)',url:'https://liberamente.site/faq'}]
},
{
id:'why-indie',slug:'perche-leggere-autori-indipendenti',audience:'readers',published:D,updated:D,
title:'Perché leggere autori indipendenti (e come trovare quelli giusti)',
description:'Gli ebook di autori indipendenti offrono storie diverse, prezzi accessibili e un rapporto diretto con chi scrive. Come scoprirli e scegliere quelli di qualità.',
excerpt:'Storie che non trovi in classifica, prezzi accessibili e il piacere di sostenere direttamente chi scrive. Ecco perché vale la pena provare, e come scegliere bene.',
keywords:['autori indipendenti','libri indipendenti','ebook autori emergenti','self publishing lettori','libri da scoprire'],
body:`Quando pensiamo a cosa leggere, guardiamo quasi sempre le classifiche, i premi e le vetrine delle grandi librerie. È comprensibile, ma così si perde una parte enorme di quello che si scrive oggi: i libri degli autori indipendenti.

## Il digitale cresce, e con lui gli indipendenti

Secondo i dati presentati dall'Associazione Italiana Editori, nel 2025 il mercato italiano del libro ha perso terreno nel cartaceo, mentre gli **ebook sono cresciuti del 2,4%**, arrivando a 87 milioni di euro, e gli audiolibri del 13,3%. Il digitale è anche il terreno naturale dell'autopubblicazione: è lì che molti autori esordiscono, senza passare da un editore tradizionale.

## Cosa trovi in un libro indipendente

### Storie fuori dagli schemi

Un autore indipendente non deve convincere un ufficio marketing che il suo libro venderà. Può scrivere di una nicchia, di un luogo preciso, di una passione particolare: romanzi ambientati in un paese che conosci, saggi pratici su un mestiere, raccolte di poesie, guide di cucina scritte da chi cucina davvero.

### Prezzi accessibili

Molti ebook indipendenti costano tra i 3 e i 9 euro. È una cifra che permette di provare un autore nuovo senza pensarci troppo.

### Un rapporto diretto

Chi scrive da indipendente spesso risponde ai messaggi, legge le recensioni, ascolta i lettori. E quando compri il suo libro, una parte importante del prezzo va a lui: su LIBERAMENTE, per esempio, l'autore riceve il 50% di ogni vendita.

## Come scegliere bene

Non tutti i libri indipendenti sono curati allo stesso modo, ed è giusto essere esigenti. Qualche abitudine aiuta:

1. **Leggi l'estratto.** Molte schede su LIBERAMENTE hanno un'anteprima gratuita: due pagine bastano per capire se lo stile ti piace.
2. **Guarda le recensioni verificate.** Sul nostro catalogo può recensire solo chi ha acquistato il libro.
3. **Valuta la descrizione e la copertina.** Una presentazione curata è spesso il segno di un libro curato.
4. **Parti dal tuo genere preferito.** Usa i filtri del [catalogo](/catalogo) per genere, prezzo e valutazione.
5. **Segui gli autori che ti sono piaciuti.** Se un libro ti ha convinto, è probabile che ti piaccia anche il successivo.

## Leggere indipendente è anche una scelta

Ogni acquisto è un piccolo voto: per una varietà di voci più ampia, per autori che altrimenti non avrebbero spazio, per un mercato meno concentrato. Non devi rinunciare ai tuoi autori preferiti: basta aggiungere, ogni tanto, una scoperta.

> Un consiglio: la prossima volta che finisci un libro, prima di cercare in classifica prova un autore che non conosci. Potresti trovare la tua nuova voce preferita.

Pronto a provare? [Esplora il catalogo](/catalogo) o leggi [come scegliere il prossimo libro](/blog/come-scegliere-il-prossimo-libro).`,
sources:[{title:'Italia Oggi – Libri, il 2025 segna un calo: il digitale aiuta a contenere le perdite',url:'https://www.italiaoggi.it/marketing-e-media/media/libri-il-2025-segna-un-calo-speranze-sul-2026-d1lvbt3i'},{title:'Orizzonte Scuola – Il mercato editoriale chiude il 2025: crescono ebook e audiolibri',url:'https://www.orizzontescuola.it/il-mercato-editoriale-italiano-chiude-il-2025-con-tre-milioni-di-copie-in-meno-calano-i-libri-cartacei-crescono-ebook-e-audiolibri/'}]
},
{
id:'ebook-vs-print',slug:'ebook-o-libro-cartaceo',audience:'readers',published:D,updated:D,
title:'Ebook o libro cartaceo? Pro, contro e come scegliere',
description:'Prezzo, comodità, lettura, ambiente e IVA: le differenze reali tra ebook e libro di carta, e quando conviene l’uno o l’altro. Una guida senza tifoserie.',
excerpt:'Non è una gara: ebook e carta rispondono a bisogni diversi. Ecco le differenze concrete su prezzo, comodità e lettura, per scegliere di volta in volta il formato giusto.',
keywords:['ebook o cartaceo','vantaggi ebook','libro digitale vs carta','conviene leggere ebook','prezzo ebook'],
body:`Il dibattito "ebook contro carta" va avanti da anni, spesso con toni da tifoseria. In realtà la maggior parte dei lettori usa entrambi i formati, a seconda del momento. Vediamo le differenze concrete.

## Prezzo

In media un ebook costa meno della sua versione cartacea, perché non ci sono stampa, magazzino e trasporto. Per i libri indipendenti la differenza è spesso ancora più marcata: molti ebook costano tra 3 e 9 euro.

In Italia, dal 2015, l'IVA sugli ebook è al **4%**, la stessa dei libri di carta (per gli ebook dotati di codice ISBN): la differenza di prezzo non dipende quindi dalle tasse, ma dai costi di produzione e dalle scelte dell'editore.

## Comodità

È il vantaggio più evidente del digitale:

- **una libreria in tasca:** centinaia di libri sul telefono o sull'e-reader, che pesano zero grammi in valigia;
- **subito disponibile:** compri e leggi in un minuto, a qualsiasi ora;
- **sempre con te:** su LIBERAMENTE i libri acquistati restano nella tua [Area lettore](/lettore), da cui puoi leggerli online o scaricarli.

## L'esperienza di lettura

Qui la carta ha i suoi argomenti: niente batteria, niente notifiche, il piacere dell'oggetto e una memoria più "spaziale" di dove si trovava una frase. Molti lettori trovano più facile concentrarsi su un libro di carta.

Il digitale risponde con altri vantaggi: puoi ingrandire il testo, leggere al buio, cercare una parola, evidenziare senza rovinare nulla. Per chi ha problemi di vista o legge nei ritagli di tempo, non è poco.

> Un e-reader con schermo a inchiostro elettronico stanca la vista molto meno di un telefono. Se leggi molto in digitale, è l'acquisto che fa la differenza.

## Ambiente

Il confronto è meno ovvio di quanto sembri: un libro di carta ha un impatto legato a carta, stampa e trasporto; un e-reader ha un impatto concentrato nella produzione del dispositivo, che si "ammortizza" leggendo molti libri. Per chi legge tanto, il digitale tende a essere la scelta più leggera; per chi legge poco, un libro di carta condiviso o preso in biblioteca resta un'ottima opzione.

## Regali, prestiti, rivendita

La carta vince su questi punti: si regala, si presta, si rivende, si lascia in eredità. Gli ebook sono legati all'account di chi li compra.

## Allora, quale scegliere?

- **Ebook** se leggi in viaggio o in mobilità, se vuoi provare autori nuovi spendendo poco, se ti serve ingrandire il testo.
- **Carta** se il libro è un regalo, se vuoi sottolineare e tenerlo in libreria, se fai fatica a concentrarti sullo schermo.

Molti scelgono il digitale per scoprire e la carta per i libri da conservare. È un compromesso perfettamente ragionevole.

Vuoi provare? Nel [catalogo](/catalogo) trovi ebook di autori indipendenti, spesso con un estratto gratuito. E se non sai come leggerli sul tuo dispositivo, c'è la nostra [guida per telefono, tablet ed e-reader](/blog/come-leggere-ebook-pdf).`,
sources:[{title:'Il Post – La Commissione Europea e l’IVA sugli ebook',url:'https://www.ilpost.it/2016/12/05/iva-ebook-commissione-europea/'},{title:'Italia Oggi – IVA sui libri in Italia (ebook con ISBN)',url:'https://www.italiaoggi.it/diritto-e-fisco/iva-sui-libri-la-danimarca-propone-labolizione-in-legge-di-bilancio-quali-sono-i-regimi-fiscali-nei-paese-ue-pmn87hot'}]
},
{
id:'read-pdf',slug:'come-leggere-ebook-pdf',audience:'readers',published:D,updated:D,
title:'Come leggere un ebook PDF su telefono, tablet, Kindle e Kobo',
description:'Guida pratica per leggere gli ebook in PDF ovunque: online, su smartphone, tablet, Kindle (Send to Kindle) e Kobo, con i consigli per una lettura comoda.',
excerpt:'Hai acquistato un ebook in PDF e vuoi leggerlo dove preferisci? Ecco come fare su telefono, tablet, computer, Kindle e Kobo, con qualche trucco per leggere meglio.',
keywords:['leggere pdf su kindle','come leggere un ebook','ebook pdf telefono','send to kindle pdf','leggere ebook su kobo'],
body:`Gli ebook di LIBERAMENTE sono in formato **PDF**: un formato universale che si apre su praticamente qualsiasi dispositivo e mantiene l'impaginazione voluta dall'autore. Ecco come leggerli comodamente, ovunque.

## Prima di tutto: dove trovi i tuoi libri

Dopo un pagamento confermato, il libro compare nella tua [Area lettore](/lettore). Da lì hai due possibilità:

- **leggerlo online**, direttamente nel browser, senza scaricare nulla;
- **scaricare il file PDF**, per leggerlo con l'app o il dispositivo che preferisci.

## Sul telefono

Il PDF si apre con l'app File (iPhone) o con il lettore PDF predefinito (Android). Per una lettura più comoda:

- su iPhone e iPad puoi aprire il file con **Apple Books**: scegli "Condividi" e poi Libri;
- su Android puoi caricarlo su **Google Play Libri**, che accetta anche file PDF ed EPUB personali e li sincronizza tra i dispositivi;
- gira il telefono in orizzontale per ingrandire la pagina, oppure usa lo zoom con due dita.

## Su tablet e computer

Lo schermo più grande è ideale per i PDF, che hanno un'impaginazione fissa. Puoi usare il browser, Apple Books, Google Play Libri o qualsiasi lettore PDF. Sul computer, la modalità "a schermo intero" o "lettura" elimina le distrazioni.

## Su Kindle

I Kindle leggono i PDF. Il modo più semplice per inviarli è il servizio gratuito **Send to Kindle** di Amazon:

1. vai sulla pagina Send to Kindle dal browser, o installa l'app per computer, oppure usa l'indirizzo email del tuo Kindle (lo trovi nelle impostazioni del tuo account Amazon, in "Gestisci contenuti e dispositivi");
2. carica o invia il file PDF;
3. il libro compare nella tua libreria Kindle, sincronizzato su tutti i dispositivi.

Send to Kindle accetta tra gli altri PDF, EPUB, DOCX e TXT. Tieni presente che un PDF mantiene la sua impaginazione fissa: sugli schermi piccoli da 6 pollici può essere utile ruotare il Kindle in orizzontale o ingrandire.

> Se usi l'invio via email, devi prima aggiungere l'indirizzo da cui spedisci all'elenco degli indirizzi approvati nelle impostazioni di Amazon.

## Su Kobo

Gli e-reader Kobo aprono i PDF senza conversioni:

1. collega il Kobo al computer con il cavo USB;
2. copia il file PDF nella memoria del dispositivo;
3. scollega il Kobo: il libro compare nella libreria.

## Consigli per leggere meglio un PDF

- **Ritaglia i margini:** molte app e alcuni e-reader permettono di eliminare i margini bianchi e ingrandire il testo.
- **Usa la modalità notte** sul telefono la sera, per affaticare meno gli occhi.
- **Preferisci un e-reader** se leggi molte ore: lo schermo a inchiostro elettronico stanca meno.
- **Tieni il file al sicuro:** salva una copia in una cartella o nel cloud; in ogni caso il libro resta nella tua Area lettore.

## E i libri di LIBERAMENTE Plus?

I titoli inclusi in [LIBERAMENTE Plus](/plus) si leggono **online**, in sequenza, e non si scaricano: basta un browser, su qualsiasi dispositivo. Il sistema ricorda il punto in cui ti eri fermato.

Hai ancora dubbi su un acquisto? Consulta le [domande frequenti](/faq) oppure [esplora il catalogo](/catalogo).`,
sources:[{title:'Amazon – Send to Kindle, formati supportati',url:'https://digprjsurvey.amazon.com/csad/help/node/G5WYD9SAF7PGXRNA'},{title:'Liliputing – I Kindle ora accettano gli EPUB tramite Send to Kindle',url:'https://liliputing.com/amazon-kindles-now-support-epub-books-sort-of-but-mobi-and-azw-support-is-ending-in-2022/'},{title:'LIBERAMENTE.site – Domande frequenti',url:'https://liberamente.site/faq'}]
},
{
id:'subscriptions',slug:'abbonamento-ebook-conviene',audience:'readers',published:D,updated:D,
title:'Abbonamenti agli ebook: conviene davvero? Kindle+, LIBERAMENTE Plus e acquisto singolo',
description:'Kindle Unlimited ora si chiama Kindle+ e costa 9,99 € al mese; LIBERAMENTE Plus parte da 4,99 €. Come capire se un abbonamento agli ebook ti conviene.',
excerpt:'Kindle Unlimited è diventato Kindle+, e anche LIBERAMENTE ha il suo abbonamento. Un semplice calcolo per capire se ti conviene, e cosa guardare oltre al prezzo.',
keywords:['abbonamento ebook','kindle unlimited prezzo','kindle+ italia','conviene kindle unlimited','liberamente plus'],
body:`Gli abbonamenti hanno cambiato il modo di ascoltare musica e guardare film. Per i libri funzionano in modo simile: una quota mensile e un catalogo da leggere senza comprare ogni titolo. Ma convengono davvero?

## Le novità del 2026

- Dal **22 ottobre 2026** Kindle Unlimited di Amazon si chiama **Kindle+**. In Italia il prezzo resta **9,99 € al mese**, lo stesso dal lancio del servizio nel 2014; negli Stati Uniti il nuovo piano include anche audiolibri, che in Italia per ora non ci sono.
- **LIBERAMENTE Plus** è l'abbonamento del nostro store dedicato agli autori indipendenti: parte da **4,99 € al mese** e si annulla quando vuoi.

## Il calcolo di base

La domanda giusta è: quanto spenderei comprando i libri che leggo davvero in un mese?

1. Conta quanti libri finisci in un mese tipico (non quelli che vorresti leggere: quelli che finisci).
2. Moltiplica per il prezzo medio degli ebook che compri.
3. Confronta con la quota mensile.

Esempio: se leggi due ebook al mese da 6 €, spendi 12 €. Un abbonamento da 4,99 € ti fa risparmiare, **a patto che i libri che vuoi leggere siano nel catalogo**. Se leggi un libro ogni due mesi, l'acquisto singolo resta quasi sempre più conveniente.

## Oltre al prezzo: cosa guardare

### Il catalogo

Un abbonamento vale quanto i libri che contiene. Prima di iscriverti controlla se ci sono gli autori e i generi che leggi: i grandi bestseller spesso non sono inclusi nei servizi in abbonamento.

### Come si legge

Alcuni servizi permettono di scaricare i libri sul dispositivo, altri sono solo online. In LIBERAMENTE Plus, per esempio, i titoli si leggono online in sequenza e non si scaricano né si stampano; il sistema ricorda il punto raggiunto.

### Il libro resta tuo?

No: con un abbonamento il libro è in prestito finché paghi. Se un titolo ti è piaciuto tanto da volerlo rileggere, conviene acquistarlo.

### Chi viene pagato

Negli abbonamenti gli autori sono pagati in base alla lettura. In LIBERAMENTE Plus il 60% del fondo distribuibile va agli autori, ripartito in base alle pagine lette e confermate dai lettori: ogni pagina che leggi conta davvero per chi l'ha scritta.

## La nostra regola pratica

- **Leggi più di un libro al mese** e il catalogo ti interessa: l'abbonamento conviene.
- **Leggi poco o solo autori precisi:** meglio l'acquisto singolo.
- **Vuoi scoprire autori indipendenti** spendendo poco: un abbonamento dedicato è il modo più economico per provarne tanti.

> Prima di abbonarti, sfoglia il catalogo incluso e prova per un mese: è il test più onesto.

Scopri cosa include [LIBERAMENTE Plus](/plus) o sfoglia il [catalogo](/catalogo) per l'acquisto singolo.`,
sources:[{title:'Your Life Updated – Kindle Unlimited diventa Kindle+ (novembre 2026)',url:'https://www.yourlifeupdated.net/news/kindle-unlimited-diventa-kindle-plus'},{title:'Punto Informatico – Kindle Unlimited diventa Kindle+ (22 ottobre 2026)',url:'https://www.punto-informatico.it/kindle-unlimited-diventa-kindle-plus/'},{title:'LIBERAMENTE Plus – Come funziona',url:'https://liberamente.site/plus'}]
},
{
id:'choose-next',slug:'come-scegliere-il-prossimo-libro',audience:'readers',published:D,updated:D,
title:'Come scegliere il prossimo libro da leggere: 7 metodi che funzionano',
description:'Non sai cosa leggere? Sette metodi pratici per scegliere il prossimo libro: estratti, recensioni verificate, filtri per genere, lettura a tema e consigli.',
excerpt:'Finito un libro, comincia la ricerca del prossimo. Sette metodi semplici per scegliere meglio, scoprire autori nuovi e non restare mai senza qualcosa da leggere.',
keywords:['cosa leggere','consigli di lettura','come scegliere un libro','libri da leggere','prossimo libro da leggere'],
body:`C'è un momento preciso, appena finito un buon libro, in cui non sai cosa leggere dopo. A volte si finisce per scegliere il primo titolo in classifica, a volte per non scegliere affatto. Ecco sette metodi per uscirne con un libro giusto per te.

## 1. Parti da quello che ti è appena piaciuto

Chiediti **cosa** ti è piaciuto del libro che hai finito: l'ambientazione, il ritmo, un tipo di personaggio, il tema? È più utile di "mi è piaciuto" e ti indirizza verso libri simili per il motivo giusto, non solo per il genere.

## 2. Leggi l'estratto, sempre

Le prime pagine dicono moltissimo su stile e ritmo. Molte schede del nostro [catalogo](/catalogo) hanno un'anteprima gratuita: leggine due pagine. Se alla fine vuoi sapere come continua, hai trovato il libro.

## 3. Fidati delle recensioni giuste

Non tutte le recensioni valgono uguale. Guarda quelle che spiegano il perché, non solo il voto. Su LIBERAMENTE può recensire solo chi ha acquistato il libro: è un filtro semplice ma efficace contro le recensioni di comodo.

## 4. Usa i filtri, non solo le classifiche

Le classifiche premiano ciò che è già famoso. I filtri per genere, prezzo e valutazione ti aiutano a trovare quello che fa per te:

- scegli un genere che ami;
- ordina per "più recensiti" per partire dai titoli che hanno convinto più lettori;
- oppure guarda le "novità" per scoprire uscite recenti.

## 5. Leggi a tema

Darti un piccolo tema rende la scelta più divertente: un libro ambientato nella tua regione, un autore esordiente, un genere che non hai mai provato, un libro scritto nell'anno in cui sei nato. Funziona come una sfida personale, senza pressione.

## 6. Alterna lungo e breve

Dopo un romanzo impegnativo, un libro breve (un racconto lungo, una raccolta, un saggio pratico) fa ritrovare il piacere di finire qualcosa. Molti lettori si bloccano proprio per aver scelto un libro troppo lungo nel momento sbagliato.

## 7. Prova un autore indipendente

Gli autori indipendenti scrivono spesso di nicchie e luoghi che i grandi editori trascurano, a prezzi più bassi. È il modo più economico per allargare i tuoi orizzonti: ne parliamo in [Perché leggere autori indipendenti](/blog/perche-leggere-autori-indipendenti).

## Un trucco in più: la lista "da leggere"

Quando qualcuno ti consiglia un libro o ne incontri uno interessante, segnalo subito: in una nota sul telefono o tra i preferiti. Alla fine di ogni lettura, avrai già una lista da cui scegliere.

> Il libro giusto non è sempre il più famoso: è quello che arriva nel momento giusto. Darsi il permesso di lasciare un libro che non funziona fa parte del gioco.

Cerchi ispirazione adesso? Apri il [catalogo](/catalogo) e parti dal tuo genere preferito. E se leggi spesso, valuta se ti conviene un [abbonamento](/blog/abbonamento-ebook-conviene).`,
sources:[{title:'LIBERAMENTE.site – Domande frequenti (anteprime e recensioni)',url:'https://liberamente.site/faq'}]
}
];
