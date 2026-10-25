import Stripe from 'stripe';
import {admin} from '@/lib/supabase/admin';
import {authorRoyalty} from '@/lib/money';

export async function recordCompletedCheckout(session:Stripe.Checkout.Session){
  const metadata=session.metadata;
  if(!metadata?.book_id||!metadata.buyer_id||!metadata.author_id||session.payment_status!=='paid')return {recorded:false,reason:'Sessione non pagata o incompleta'};
  const db=admin();
  const gross=session.amount_total??0;
  let {data:purchase,error}=await db.from('purchases').select('id').eq('stripe_checkout_session_id',session.id).maybeSingle();
  if(error)throw error;
  if(!purchase){
    const created=await db.from('purchases').insert({book_id:metadata.book_id,buyer_id:metadata.buyer_id,stripe_checkout_session_id:session.id,stripe_payment_intent_id:typeof session.payment_intent==='string'?session.payment_intent:null,gross_cents:gross,status:'paid'}).select('id').single();
    purchase=created.data;
    error=created.error;
    if(error){
      const existing=await db.from('purchases').select('id').eq('book_id',metadata.book_id).eq('buyer_id',metadata.buyer_id).maybeSingle();
      if(existing.error||!existing.data)throw error;
      purchase=existing.data;
      const updated=await db.from('purchases').update({stripe_checkout_session_id:session.id,stripe_payment_intent_id:typeof session.payment_intent==='string'?session.payment_intent:null,gross_cents:gross,status:'paid'}).eq('id',purchase.id);
      if(updated.error)throw updated.error;
    }
  }
  const authorAmount=authorRoyalty(gross);
  const {error:royaltyError}=await db.from('royalty_ledger').upsert({purchase_id:purchase.id,author_id:metadata.author_id,gross_cents:gross,platform_fee_cents:gross-authorAmount,author_amount_cents:authorAmount},{onConflict:'purchase_id'});
  if(royaltyError)throw royaltyError;
  return {recorded:true,purchaseId:purchase.id};
}
