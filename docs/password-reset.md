# Recupero password

## Percorso
1. `/accedi` → link **Password dimenticata?** → `/accedi/recupero` (anche `/en/accedi/recupero`).
2. L'utente inserisce l'email: `resetPasswordForEmail` con `redirectTo=https://liberamente.site/auth/confirm?next=/accedi/nuova-password`. Il messaggio è sempre lo stesso, che l'email esista o no.
3. Il link dell'email apre `/auth/confirm`, che verifica il token e crea la sessione.
4. `/accedi/nuova-password`: nuova password (min. 8 caratteri, ripetuta). Dopo il salvataggio tutte le sessioni vengono chiuse e si torna ad `/accedi` con il messaggio di conferma.

## Impostazioni Supabase (Authentication)
- **URL Configuration → Redirect URLs**: `https://liberamente.site/**`.
- **Emails → Reset password (template)**, link consigliato (funziona anche se l'email viene aperta su un altro dispositivo):
  `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/accedi/nuova-password`
  Con il template predefinito (`{{ .ConfirmationURL }}`) il link funziona solo nello stesso browser in cui è stata fatta la richiesta.
- **Emails → SMTP Settings** (invio da Gmail): host `smtp.gmail.com`, porta `465`, utente = indirizzo Gmail, password = **password per le app** di Google (richiede la verifica in due passaggi). Gmail permette circa 500 email al giorno; senza SMTP personalizzato Supabase ne invia pochissime all'ora.
