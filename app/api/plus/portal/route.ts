import {NextResponse} from 'next/server';
import {createClient} from '@/lib/supabase/server';
import {stripe} from '@/lib/stripe';
import {publicSiteUrl} from '@/lib/plus';
import {admin} from '@/lib/supabase/admin';

export async function POST(){
  const s=await createClient();
  const {data:{user}}=await s.auth.getUser();
  if(!user)return NextResponse.redirect(new URL('/accedi',publicSiteUrl()),303);

  const {data:subscription}=await s.from('plus_subscriptions').select('stripe_customer_id,stripe_subscription_id').eq('reader_id',user.id).maybeSingle();
  let customerId=subscription?.stripe_customer_id??null;
  if(!customerId&&subscription?.stripe_subscription_id){
    try{
      const stripeSubscription=await stripe.subscriptions.retrieve(subscription.stripe_subscription_id);
      customerId=typeof stripeSubscription.customer==='string'?stripeSubscription.customer:stripeSubscription.customer.id;
      if(customerId)await admin().from('plus_subscriptions').update({stripe_customer_id:customerId,updated_at:new Date().toISOString()}).eq('reader_id',user.id);
    }catch(error){console.error('Recupero cliente Plus non riuscito',error)}
  }
  if(!customerId)return NextResponse.redirect(new URL('/plus?errore=abbonamento',publicSiteUrl()),303);
  try{
    const portal=await stripe.billingPortal.sessions.create({customer:customerId,return_url:`${publicSiteUrl()}/plus`});
    return NextResponse.redirect(portal.url,303);
  }catch(error){
    console.error('Apertura portale Stripe Plus non riuscita',error);
    return NextResponse.redirect(new URL('/plus?errore=gestione',publicSiteUrl()),303);
  }
}
