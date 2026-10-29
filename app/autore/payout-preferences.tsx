'use client';

import {useState} from 'react';

type Props = {
  action: (formData: FormData) => void | Promise<void>;
  preference?: string | null;
  paypalEmail?: string | null;
  iban?: string | null;
  accountHolder?: string | null;
  bankName?: string | null;
  whatsapp?: string | null;
};

export function PayoutPreferences({action, preference, paypalEmail, iban, accountHolder, bankName, whatsapp}: Props) {
  const [method, setMethod] = useState(preference || 'stripe');
  return <form action={action} className="payout-preferences">
    <label>Metodo preferito</label>
    <select name="payoutPreference" value={method} onChange={event => setMethod(event.target.value)}>
      <option value="stripe">Stripe Connect</option>
      <option value="paypal">PayPal</option>
      <option value="bank_transfer">Bonifico bancario</option>
    </select>
    {method === 'paypal' && <><label>Email PayPal</label><input name="paypalEmail" type="email" required defaultValue={paypalEmail || ''}/></>}
    {method === 'bank_transfer' && <fieldset className="bank-transfer-fields"><legend>Dati per il bonifico</legend><label>IBAN</label><input name="iban" required defaultValue={iban || ''} autoCapitalize="characters" placeholder="IT60 X054 2811 1010 0000 0123 456"/><small className="muted">L’IBAN viene controllato prima del salvataggio.</small><label>Nome e cognome intestatario</label><input name="accountHolder" required defaultValue={accountHolder || ''} maxLength={160}/><label>Nome della banca</label><input name="bankName" required defaultValue={bankName || ''} maxLength={160}/><label>Cellulare WhatsApp</label><input name="whatsapp" required defaultValue={whatsapp || ''} inputMode="tel" placeholder="+39 333 1234567" maxLength={25}/></fieldset>}
    <button>Salva preferenza</button>
  </form>;
}
