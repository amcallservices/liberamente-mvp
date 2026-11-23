import Stripe from 'stripe';
import {admin} from '@/lib/supabase/admin';

function isoFromUnix(value:number|undefined|null){return value?new Date(value*1000).toISOString():null}

// Newer Stripe API versions (used by webhooks) moved the billing period from the
// subscription to its items, so read it from either place.
export function subscriptionPeriod(subscription:Stripe.Subscription){
  const sub=subscription as any,item=(subscription.items?.data||[])[0] as any;
  return {start:isoFromUnix(sub.current_period_start??item?.current_period_start),end:isoFromUnix(sub.current_period_end??item?.current_period_end)};
}

export async function syncPlusSubscription(subscription:Stripe.Subscription,readerId?:string|null){
  const db=admin();
  const customer=typeof subscription.customer==='string'?subscription.customer:subscription.customer?.id;
  const metadataReader=readerId||subscription.metadata?.buyer_id||null;
  if(!metadataReader)return;
  const item=(subscription.items?.data||[])[0];
  const period=subscriptionPeriod(subscription);
  const payload={reader_id:metadataReader,stripe_customer_id:customer||null,stripe_subscription_id:subscription.id,stripe_price_id:item?.price?.id||null,status:subscription.status,...(period.start?{current_period_start:period.start}:{}),...(period.end?{current_period_end:period.end}:{}),cancel_at_period_end:Boolean(subscription.cancel_at_period_end),updated_at:new Date().toISOString()};
  const {error}=await db.from('plus_subscriptions').upsert(payload,{onConflict:'reader_id'});
  if(error)throw error;
}

export async function recordPlusCheckout(session:Stripe.Checkout.Session,stripe:Stripe){
  if(session.metadata?.kind!=='liberamente_plus'||typeof session.subscription!=='string')return false;
  const subscription=await stripe.subscriptions.retrieve(session.subscription);
  await syncPlusSubscription(subscription,session.metadata.buyer_id);
  return true;
}
