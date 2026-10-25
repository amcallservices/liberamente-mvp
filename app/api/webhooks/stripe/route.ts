import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { admin } from '@/lib/supabase/admin';
import {recordCompletedCheckout} from '@/lib/checkout-record';

export async function POST(req: Request) {
  const signature = req.headers.get('stripe-signature');
  if (!signature) return NextResponse.json({ error: 'Firma mancante' }, { status: 400 });
  let event: Stripe.Event;
  try { event = stripe.webhooks.constructEvent(await req.text(), signature, process.env.STRIPE_WEBHOOK_SECRET!); }
  catch { return NextResponse.json({ error: 'Firma non valida' }, { status: 400 }); }
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    try{await recordCompletedCheckout(session)}catch(error){console.error('Impossibile registrare l’acquisto Stripe',error);return NextResponse.json({error:'Registrazione acquisto non riuscita'},{status:500})}
  }
  if(event.type==='charge.refunded'){const charge=event.data.object as Stripe.Charge;if(typeof charge.payment_intent==='string'){const db=admin();const {data:purchase}=await db.from('purchases').update({status:'refunded'}).eq('stripe_payment_intent_id',charge.payment_intent).select('id').maybeSingle();if(purchase)await db.from('royalty_ledger').update({reversed_at:new Date().toISOString()}).eq('purchase_id',purchase.id)}}
  return NextResponse.json({ received: true });
}
