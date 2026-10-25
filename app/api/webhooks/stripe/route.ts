import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { admin } from '@/lib/supabase/admin';
import { authorRoyalty } from '@/lib/money';

export async function POST(req: Request) {
  const signature = req.headers.get('stripe-signature');
  if (!signature) return NextResponse.json({ error: 'Firma mancante' }, { status: 400 });
  let event: Stripe.Event;
  try { event = stripe.webhooks.constructEvent(await req.text(), signature, process.env.STRIPE_WEBHOOK_SECRET!); }
  catch { return NextResponse.json({ error: 'Firma non valida' }, { status: 400 }); }
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const metadata = session.metadata;
    if (metadata?.book_id && metadata.buyer_id && metadata.author_id && session.payment_status === 'paid') {
      const db = admin(); const gross = session.amount_total ?? 0;
      const { data: purchase } = await db.from('purchases').upsert({ book_id: metadata.book_id, buyer_id: metadata.buyer_id, stripe_checkout_session_id: session.id, gross_cents: gross, status: 'paid' }, { onConflict: 'stripe_checkout_session_id' }).select('id').single();
      if (purchase) { const authorAmount = authorRoyalty(gross); await db.from('royalty_ledger').upsert({ purchase_id: purchase.id, author_id: metadata.author_id, gross_cents: gross, platform_fee_cents: gross - authorAmount, author_amount_cents: authorAmount }, { onConflict: 'purchase_id' }); }
    }
  }
  return NextResponse.json({ received: true });
}
