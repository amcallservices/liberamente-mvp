# Liberamente — MVP marketplace ebook

Marketplace italiano, solo ebook, costruito con Next.js (App Router), TypeScript, Supabase e Stripe Connect. Non contiene credenziali e non effettua deploy.

## Cosa include

- catalogo pubblico dei soli titoli approvati;
- iscrizione email/password per lettori e attivazione del profilo autore;
- bozza, upload EPUB/PDF in bucket privato e coda di moderazione;
- dashboard autore con royalty maturate e onboarding Stripe Express;
- Checkout Stripe, webhook con firma verificata, acquisti idempotenti e libreria privata;
- download autorizzato tramite URL Supabase firmato e valido 60 secondi.

## Architettura

`Browser → Next.js/Vercel → Supabase Auth + Postgres + Storage privato`  
`Checkout → Stripe → webhook verificato → purchases + royalty_ledger`

L’ebook non è mai pubblico: un lettore può ottenerne l’URL temporaneo soltanto se ha un acquisto `paid`. Il service-role Supabase è usato esclusivamente dal webhook server-side.

## Avvio locale

1. Copia `.env.example` in `.env.local` e compila le variabili.
2. Crea un progetto Supabase e applica `supabase/migrations/0001_marketplace.sql` nel SQL Editor (oppure con Supabase CLI).
3. In Supabase Auth abilita Email; configura l’URL di redirect locale e di Vercel.
4. In Stripe crea un endpoint webhook `POST /api/webhooks/stripe` e ascolta `checkout.session.completed`; inserisci il suo secret in `STRIPE_WEBHOOK_SECRET`.
5. Esegui `npm install`, poi `npm run dev`. I controlli sono `npm run test` e `npm run build`.

Per promuovere un amministratore, esegui una volta nel SQL editor (sostituendo l’UUID):

```sql
update public.profiles set role = 'admin' where id = 'UUID-UTENTE';
```

## Stripe Connect e royalty

L’onboarding crea un account Express italiano per l’autore. Il checkout crea una destination charge verso `profiles.stripe_account_id` e trattiene il 15% come `application_fee_amount`; il ledger conserva lo stesso calcolo (autore 85%) come fonte contabile. Un ebook senza account Connect collegato non può essere acquistato. Prima di attivare pagamenti reali servono termini di vendita, procedura rimborsi, verifica fiscale/IVA e policy copyright.

## Deploy, senza pubblicazione automatica

1. Inizializza Git e crea un repository GitHub privato: `git init`, `git add .`, `git commit -m "Initial ebook marketplace MVP"`.
2. Collega il repository in Vercel e importa le stesse variabili d’ambiente: quelle senza `NEXT_PUBLIC_` restano server-only.
3. Imposta `NEXT_PUBLIC_SITE_URL` sul dominio Vercel e aggiorna callback Supabase/Stripe.
4. `vercel.json` disattiva volontariamente i deploy Git automatici: abilitarli richiede una decisione esplicita.

## Note di sicurezza

- Non esporre `SUPABASE_SERVICE_ROLE_KEY` o chiavi Stripe nel client, nei commit o nei log.
- Le RLS policy limitano profili, bozze, acquisti e royalty al proprietario; l’admin è riconosciuto tramite funzione `security definer`.
- Il webhook verifica la firma Stripe e l’upsert per sessione evita doppie registrazioni.
- Per upload reali, il client deve usare la `signedUrl` con PUT e inviare il file entro la scadenza; aggiungere validazione MIME/dimensione con Edge Function prima della pubblicazione.
