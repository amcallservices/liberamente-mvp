import Stripe from 'stripe';

// Il client Stripe viene creato solo al primo utilizzo, non quando il modulo viene
// caricato: così `next build` non fallisce se STRIPE_SECRET_KEY non è disponibile
// durante la build (per esempio nei deploy di anteprima).
let client:Stripe|undefined;

function getStripe():Stripe{
  if(!client){
    const key=process.env.STRIPE_SECRET_KEY;
    if(!key)throw new Error('STRIPE_SECRET_KEY non è configurata.');
    client=new Stripe(key);
  }
  return client;
}

export const stripe=new Proxy({} as Stripe,{
  get(_target,property){
    const instance=getStripe();
    const value=Reflect.get(instance,property,instance);
    return typeof value==='function'?value.bind(instance):value;
  },
});
