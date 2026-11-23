// Covers are uploaded at full resolution (often 1-3 MB PNGs). When a display
// width is given, the URL goes through Next.js image optimisation, which
// serves a resized WebP/AVIF and caches it. Without a width (social previews,
// structured data) the original file is returned.
export const COVER_THUMB = 384;
export const COVER_LARGE = 640;

export function coverUrl(path:string|null|undefined,width?:number){
  if(!path)return null;
  const base=process.env.NEXT_PUBLIC_SUPABASE_URL;
  if(!base)return null;
  const objectPath=path.replace(/^\/?covers\//,'');
  const original=`${base}/storage/v1/object/public/covers/${objectPath.split('/').map(encodeURIComponent).join('/')}`;
  return width?`/_next/image?url=${encodeURIComponent(original)}&w=${width}&q=75`:original;
}
