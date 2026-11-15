import {NextResponse,type NextRequest} from 'next/server';
import type {EmailOtpType} from '@supabase/supabase-js';
import {createClient} from '@/lib/supabase/server';

/**
 * Landing point of the links in Supabase auth emails.
 * - token_hash + type: works in any browser (recommended email template, see docs/password-reset.md).
 * - code: the default template's PKCE redirect, which works in the browser that asked for the email.
 */
export async function GET(request:NextRequest){
  const url=request.nextUrl;
  const rawNext=url.searchParams.get('next')??'/accedi/nuova-password';
  const next=rawNext.startsWith('/')&&!rawNext.startsWith('//')?rawNext:'/accedi/nuova-password';
  const english=next.startsWith('/en');
  const tokenHash=url.searchParams.get('token_hash'),type=url.searchParams.get('type') as EmailOtpType|null,code=url.searchParams.get('code');
  const s=await createClient();
  let ok=false;
  if(tokenHash&&type){const {error}=await s.auth.verifyOtp({type,token_hash:tokenHash});ok=!error;if(error)console.error('Email link verification failed:',error.message);}
  else if(code){const {error}=await s.auth.exchangeCodeForSession(code);ok=!error;if(error)console.error('Email code exchange failed:',error.message);}
  const target=new URL(ok?next:`${english?'/en':''}/accedi/nuova-password?errore=scaduto`,url.origin);
  return NextResponse.redirect(target);
}
