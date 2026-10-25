'use server';
import {redirect} from 'next/navigation';
import {createClient} from '@/lib/supabase/server';

const allowedAvatarTypes=new Set(['image/jpeg','image/png','image/webp']);
const maxAvatarSize=4*1024*1024;

export async function saveProfile(form:FormData){
  const displayName=String(form.get('displayName')??'').trim();
  const email=String(form.get('email')??'').trim().toLowerCase();
  const password=String(form.get('password')??'');
  const avatar=form.get('avatar');
  const s=await createClient();
  const {data:{user}}=await s.auth.getUser();
  if(!user)redirect('/accedi');
  if(displayName.length<2||displayName.length>80||!/^\S+@\S+\.\S+$/.test(email)||password&&password.length<8)redirect('/profilo?errore=campi');
  const {data:current}=await s.from('profiles').select('avatar_path').eq('id',user.id).maybeSingle();
  let avatarPath=current?.avatar_path??null;
  if(avatar instanceof File&&avatar.size>0){
    if(!allowedAvatarTypes.has(avatar.type)||avatar.size>maxAvatarSize)redirect('/profilo?errore=foto');
    const extension=avatar.type==='image/png'?'png':avatar.type==='image/webp'?'webp':'jpg';
    avatarPath=`${user.id}/avatar.${extension}`;
    const {error:uploadError}=await s.storage.from('avatars').upload(avatarPath,avatar,{upsert:true,contentType:avatar.type});
    if(uploadError)redirect('/profilo?errore=foto');
    if(current?.avatar_path&&current.avatar_path!==avatarPath)await s.storage.from('avatars').remove([current.avatar_path]);
  }
  const {error:profileError}=await s.from('profiles').update({display_name:displayName,avatar_path:avatarPath}).eq('id',user.id);
  if(profileError)redirect('/profilo?errore=salvataggio');
  const updates:{email?:string;password?:string;data?:Record<string,string>}={data:{display_name:displayName}};
  if(email!==user.email)updates.email=email;
  if(password)updates.password=password;
  const {error:authError}=await s.auth.updateUser(updates);
  if(authError)redirect('/profilo?errore=autenticazione');
  if(email!==user.email)await s.from('profiles').update({email}).eq('id',user.id);
  redirect(`/profilo?messaggio=${encodeURIComponent(email!==user.email?'Profilo salvato. Conferma il cambio email dal messaggio ricevuto.':'Profilo aggiornato con successo.')}`);
}
