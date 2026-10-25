export type BookStatus='draft'|'pending_review'|'published'|'rejected';
export type Book={id:string;title:string;slug:string;description:string;price_cents:number;cover_path:string|null;author_id:string;status:BookStatus;profiles?:{display_name:string|null}|null};
