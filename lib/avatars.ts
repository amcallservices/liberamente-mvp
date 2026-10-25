export function avatarUrl(path:string|null|undefined){
  if(!path)return null;
  const base=process.env.NEXT_PUBLIC_SUPABASE_URL;
  return base?`${base}/storage/v1/object/public/avatars/${path.split('/').map(encodeURIComponent).join('/')}`:null;
}
