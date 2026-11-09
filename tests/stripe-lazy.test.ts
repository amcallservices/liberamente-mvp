import {afterEach,describe,expect,it,vi} from 'vitest';

afterEach(()=>{vi.unstubAllEnvs();vi.resetModules()});

describe('client Stripe a inizializzazione tardiva',()=>{
  it('si importa senza STRIPE_SECRET_KEY (build Vercel senza variabili)',async()=>{
    vi.stubEnv('STRIPE_SECRET_KEY','');
    const {stripe}=await import('@/lib/stripe');
    expect(stripe).toBeDefined();
  });

  it('dà un errore chiaro solo quando viene usato senza chiave',async()=>{
    vi.stubEnv('STRIPE_SECRET_KEY','');
    const {stripe}=await import('@/lib/stripe');
    expect(()=>stripe.checkout).toThrow('STRIPE_SECRET_KEY');
  });

  it('con la chiave espone le API come prima',async()=>{
    vi.stubEnv('STRIPE_SECRET_KEY','sk_test_dummy');
    const {stripe}=await import('@/lib/stripe');
    expect(typeof stripe.webhooks.constructEvent).toBe('function');
    expect(typeof stripe.checkout.sessions.create).toBe('function');
  });
});
