'use server';
import {redirect} from 'next/navigation';
import {createClient} from '@/lib/supabase/server';

export async function updatePassword(formData:FormData){
  const english=formData.get('lang')==='en';
  const base=english?'/en/accedi/nuova-password':'/accedi/nuova-password';
  const password=String(formData.get('password')??''),confirm=String(formData.get('confirm')??'');
  if(password.length<8) redirect(`${base}?errore=corta`);
  if(password!==confirm) redirect(`${base}?errore=diverse`);
  const s=await createClient();
  const {data:{user}}=await s.auth.getUser();
  if(!user) redirect(`${base}?errore=scaduto`);
  const {error}=await s.auth.updateUser({password});
  if(error){
    console.error('Password update failed:',error.message);
    redirect(`${base}?errore=${/different from the old|same/i.test(error.message)?'uguale':'aggiornamento'}`);
  }
  // Signs out everywhere so that a stolen session stops working, then asks to sign in with the new password.
  await s.auth.signOut({scope:'global'});
  redirect(`${english?'/en/accedi':'/accedi'}?messaggio=password_aggiornata${english?'&next=%2Fen':''}`);
}
