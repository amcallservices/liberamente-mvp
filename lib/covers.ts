export function coverUrl(path:string|null|undefined){
  if(!path)return null;
  const base=process.env.NEXT_PUBLIC_SUPABASE_URL;
  if(!base)return null;
  const objectPath=path.replace(/^\/?covers\//,'');
  return `${base}/storage/v1/object/public/covers/${objectPath.split('/').map(encodeURIComponent).join('/')}`;
}
