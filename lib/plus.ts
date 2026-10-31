export const PLUS_PRICE_ID=process.env.STRIPE_PLUS_PRICE_ID?.trim()||'';
export const PLUS_AUTHOR_SHARE=0.60;
export const PLUS_PLATFORM_SHARE=0.40;
export const ACTIVE_PLUS_STATUSES=['active','trialing'] as const;
export type PlusStatus=(typeof ACTIVE_PLUS_STATUSES)[number];

export function isPlusActive(status:string|undefined|null){return ACTIVE_PLUS_STATUSES.includes(status as PlusStatus)}
export function publicSiteUrl(){return (process.env.NEXT_PUBLIC_SITE_URL||'https://liberamente.site').replace(/\/$/,'')}
