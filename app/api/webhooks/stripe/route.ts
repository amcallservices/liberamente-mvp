import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { admin } from '@/lib/supabase/admin';
import {recordCompletedCheckout} from '@/lib/checkout-record';
import {recordPlusCheckout,syncPlusSubscription} from '@/lib/plus-subscriptions';

export async function POST(req: Request) {
  const signature = req.headers.get('stripe-signature');
  if (!signature) return NextResponse.json({ error: 'Firma mancante' }, { status: 400 });
  let event: Stripe.Event;
  try { event = stripe.webhooks.constructEvent(await req.text(), signature, process.env.STRIPE_WEBHOOK_SECRET!); }
  catch { return NextResponse.json({ error: 'Firma non valida' }, { status: 400 }); }
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    if(session.metadata?.kind==='liberamente_plus'){
      try{await recordPlusCheckout(session,stripe)}catch(error){console.error('Impossibile registrare Plus',error);return NextResponse.json({error:'Registrazione Plus non riuscita'},{status:500})}
      return NextResponse.json({received:true});
    }
    try{await recordCompletedCheckout(session)}catch(error){console.error('Impossibile registrare l’acquisto Stripe',error);return NextResponse.json({error:'Registrazione acquisto non riuscita'},{status:500})}
  }
  if(event.type==='customer.subscription.created'||event.type==='customer.subscription.updated'||event.type==='customer.subscription.deleted'){
    try{await syncPlusSubscription(event.data.object as Stripe.Subscription)}catch(error){console.error('Impossibile sincronizzare Plus',error);return NextResponse.json({error:'Sincronizzazione Plus non riuscita'},{status:500})}
  }
  if(event.type==='charge.refunded'){const charge=event.data.object as Stripe.Charge;if(typeof charge.payment_intent==='string'){const db=admin();const {data:purchase}=await db.from('purchases').update({status:'refunded'}).eq('stripe_payment_intent_id',charge.payment_intent).select('id').maybeSingle();if(purchase)await db.from('royalty_ledger').update({reversed_at:new Date().toISOString()}).eq('purchase_id',purchase.id)}}
  return NextResponse.json({ received: true });
}
