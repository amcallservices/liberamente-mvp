import {NextResponse} from 'next/server';
import {createClient} from '@/lib/supabase/server';
import {stripe} from '@/lib/stripe';
import {publicSiteUrl} from '@/lib/plus';
import {admin} from '@/lib/supabase/admin';
import {marketplaceLocale,marketplacePath} from '@/lib/marketplace';

export async function POST(req:Request){
  const form=await req.formData();
  const locale=marketplaceLocale(String(form.get('market')??''));
  const local=(path:string)=>marketplacePath(locale,path);
  const site=publicSiteUrl();
  const s=await createClient();
  const {data:{user}}=await s.auth.getUser();
  if(!user)return NextResponse.redirect(new URL(`${local('/accedi')}?next=${encodeURIComponent(local('/plus'))}`,site),303);

  const {data:subscription}=await s.from('plus_subscriptions').select('stripe_customer_id,stripe_subscription_id').eq('reader_id',user.id).maybeSingle();
  let customerId=subscription?.stripe_customer_id??null;
  if(!customerId&&subscription?.stripe_subscription_id){
    try{
      const stripeSubscription=await stripe.subscriptions.retrieve(subscription.stripe_subscription_id);
      customerId=typeof stripeSubscription.customer==='string'?stripeSubscription.customer:stripeSubscription.customer.id;
      if(customerId)await admin().from('plus_subscriptions').update({stripe_customer_id:customerId,updated_at:new Date().toISOString()}).eq('reader_id',user.id);
    }catch(error){console.error('Recupero cliente Plus non riuscito',error)}
  }
  if(!customerId)return NextResponse.redirect(new URL(`${local('/plus')}?errore=abbonamento`,site),303);
  try{
    const portal=await stripe.billingPortal.sessions.create({customer:customerId,return_url:`${site}${local('/plus')}`});
    return NextResponse.redirect(portal.url,303);
  }catch(error){
    console.error('Apertura portale Stripe Plus non riuscita',error);
    return NextResponse.redirect(new URL(`${local('/plus')}?errore=gestione`,site),303);
  }
}
