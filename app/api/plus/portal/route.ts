import {NextResponse} from 'next/server';
import {createClient} from '@/lib/supabase/server';
import {stripe} from '@/lib/stripe';
import {publicSiteUrl} from '@/lib/plus';
export async function POST(){const s=await createClient(),{data:{user}}=await s.auth.getUser();if(!user)return NextResponse.redirect(new URL('/accedi',publicSiteUrl()));const {data:subscription}=await s.from('plus_subscriptions').select('stripe_customer_id').eq('reader_id',user.id).maybeSingle();if(!subscription?.stripe_customer_id)return NextResponse.redirect(new URL('/plus?errore=abbonamento',publicSiteUrl()));const portal=await stripe.billingPortal.sessions.create({customer:subscription.stripe_customer_id,return_url:`${publicSiteUrl()}/plus`});return NextResponse.redirect(portal.url);}
