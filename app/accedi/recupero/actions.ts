'use server';
import {redirect} from 'next/navigation';
import {createClient} from '@/lib/supabase/server';

const publicSiteUrl=(process.env.NEXT_PUBLIC_SITE_URL||'https://liberamente.site').replace(/\/$/,'');

/** Sends the password-reset email. The answer is the same whether or not the address exists, so accounts cannot be guessed. */
export async function requestPasswordReset(formData:FormData){
  const english=formData.get('lang')==='en';
  const base=english?'/en/accedi/recupero':'/accedi/recupero';
  const email=String(formData.get('email')??'').trim().toLowerCase();
  if(!/^\S+@\S+\.\S+$/.test(email)) redirect(`${base}?errore=email`);
  const next=english?'/en/accedi/nuova-password':'/accedi/nuova-password';
  const s=await createClient();
  const {error}=await s.auth.resetPasswordForEmail(email,{redirectTo:`${publicSiteUrl}/auth/confirm?next=${encodeURIComponent(next)}`});
  if(error){
    console.error('Password reset email failed:',error.message);
    // Too many requests is the only error worth telling the visitor about.
    if(error.status===429||/rate limit/i.test(error.message)) redirect(`${base}?errore=troppe`);
  }
  redirect(`${base}?inviata=1`);
}
