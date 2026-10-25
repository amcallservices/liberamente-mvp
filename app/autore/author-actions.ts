'use server';
import {redirect} from 'next/navigation';import {createClient} from '@/lib/supabase/server';
export async function becomeAuthor(){const s=await createClient();const {data:{user}}=await s.auth.getUser();if(!user)redirect('/accedi');await s.rpc('become_author');redirect('/autore?messaggio=Profilo+autore+attivato.')}
