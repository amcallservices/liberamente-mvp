type ReviewStatus = 'published' | 'rejected' | 'blocked';

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://liberamente.site').replace(/\/$/, '');

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  })[character] || character);
}

async function sendEmail({to, subject, htmlContent}: {to?: string | null; subject: string; htmlContent: string}) {
  const apiKey = process.env.BREVO_API_KEY?.trim();
  const senderEmail = process.env.EMAIL_FROM?.trim();

  // La mancata configurazione o un errore email non deve fermare il flusso editoriale.
  if (!apiKey || !senderEmail || !to) {
    console.warn('Notifica email non inviata: configurazione Brevo mancante.');
    return false;
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: {name: 'LIBERAMENTE', email: senderEmail},
        to: [{email: to}],
        subject,
        htmlContent,
      }),
    });
    if (!response.ok) {
      const diagnostic = (await response.text()).slice(0, 500);
      console.error(`Notifica Brevo non inviata: ${response.status}${diagnostic ? ` — ${diagnostic}` : ''}`);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Notifica Brevo non inviata:', error);
    return false;
  }
}

export async function notifyAdminBookSubmitted({title, authorName, authorEmail, bookId}: {title: string; authorName?: string | null; authorEmail?: string | null; bookId: string}) {
  const safeTitle = escapeHtml(title);
  const safeAuthor = escapeHtml(authorName || authorEmail || 'Autore senza nome');
  const safeEmail = authorEmail ? escapeHtml(authorEmail) : 'non disponibile';
  return sendEmail({
    to: process.env.ADMIN_EMAIL,
    subject: `Nuovo ebook da revisionare: ${title}`,
    htmlContent: `<main style="font-family:Arial,sans-serif;line-height:1.5;color:#1d2b25"><h1>Nuovo ebook in revisione</h1><p><strong>${safeTitle}</strong> è stato inviato alla revisione editoriale.</p><p>Autore: ${safeAuthor}<br>Email: ${safeEmail}</p><p><a href="${siteUrl}/admin">Apri il pannello di amministrazione</a></p><p style="color:#62736a">ID interno: ${escapeHtml(bookId)}</p></main>`,
  });
}

export async function notifyAuthorBookDecision({email, title, status, note}: {email?: string | null; title: string; status: ReviewStatus; note: string}) {
  const details = {
    published: {subject: `Il tuo ebook è stato pubblicato: ${title}`, heading: 'Il tuo ebook è stato approvato', text: 'Il libro è ora pubblicato e visibile nel catalogo LIBERAMENTE.'},
    rejected: {subject: `Correzioni richieste per: ${title}`, heading: 'Sono richieste alcune correzioni', text: 'Apri la tua area autore, applica le correzioni e invia nuovamente il libro alla revisione.'},
    blocked: {subject: `Aggiornamento revisione: ${title}`, heading: 'Il libro è stato bloccato', text: 'Consulta la nota di revisione nella tua area autore per conoscere il prossimo passo.'},
  }[status];
  return sendEmail({
    to: email,
    subject: details.subject,
    htmlContent: `<main style="font-family:Arial,sans-serif;line-height:1.5;color:#1d2b25"><h1>${details.heading}</h1><p><strong>${escapeHtml(title)}</strong></p><p>${details.text}</p><section style="padding:16px;background:#f2f7f3;border-radius:8px"><strong>Nota di revisione</strong><br>${escapeHtml(note)}</section><p><a href="${siteUrl}/autore">Apri la tua area autore</a></p></main>`,
  });
}
