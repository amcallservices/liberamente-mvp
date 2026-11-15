import {beforeEach,describe,expect,it,vi} from 'vitest';
import {NextRequest} from 'next/server';

const auth=vi.hoisted(()=>({verifyOtp:vi.fn(),exchangeCodeForSession:vi.fn()}));
vi.mock('@/lib/supabase/server',()=>({createClient:async()=>({auth})}));
import {GET} from '../app/auth/confirm/route';

const call=(query:string)=>GET(new NextRequest(`https://liberamente.site/auth/confirm?${query}`));

beforeEach(()=>{vi.clearAllMocks();auth.verifyOtp.mockResolvedValue({error:null});auth.exchangeCodeForSession.mockResolvedValue({error:null});});

describe('email link confirmation',()=>{
  it('verifies a recovery token and opens the new-password page',async()=>{
    const res=await call('token_hash=abc&type=recovery&next=%2Faccedi%2Fnuova-password');
    expect(auth.verifyOtp).toHaveBeenCalledWith({type:'recovery',token_hash:'abc'});
    expect(res.headers.get('location')).toBe('https://liberamente.site/accedi/nuova-password');
  });

  it('exchanges a PKCE code from the default email template',async()=>{
    const res=await call('code=xyz&next=%2Fen%2Faccedi%2Fnuova-password');
    expect(auth.exchangeCodeForSession).toHaveBeenCalledWith('xyz');
    expect(res.headers.get('location')).toBe('https://liberamente.site/en/accedi/nuova-password');
  });

  it('sends expired or reused links to the "request a new link" message',async()=>{
    auth.verifyOtp.mockResolvedValue({error:{message:'expired'}});
    const res=await call('token_hash=old&type=recovery&next=%2Faccedi%2Fnuova-password');
    expect(res.headers.get('location')).toBe('https://liberamente.site/accedi/nuova-password?errore=scaduto');
  });

  it('never redirects to another site',async()=>{
    const res=await call('token_hash=abc&type=recovery&next=%2F%2Fevil.example');
    expect(res.headers.get('location')).toBe('https://liberamente.site/accedi/nuova-password');
  });
});
