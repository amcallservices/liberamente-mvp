import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

async function moderate(form: FormData) {
  'use server';
  const s = await createClient();
  const { data: auth } = await s.auth.getUser();
  if (!auth.user) redirect('/');
  const { data: profile } = await s.from('profiles').select('role').eq('id', auth.user.id).single();
  if (profile?.role !== 'admin') redirect('/');
  const status = String(form.get('status'));
  await s.from('books').update({ status, published_at: status === 'published' ? new Date().toISOString() : null }).eq('id', String(form.get('id')));
  redirect('/admin');
}

export default async function Admin() {
  const s = await createClient();
  const { data: auth } = await s.auth.getUser();
  if (!auth.user) redirect('/');
  const { data: profile } = await s.from('profiles').select('role').eq('id', auth.user.id).single();
  if (profile?.role !== 'admin') redirect('/');
  const { data = [] } = await s.from('books').select('id,title,status,profiles!books_author_id_fkey(display_name)').eq('status', 'pending_review');
  return <main className="wrap"><h1>Moderazione</h1>{data.map((b: any) => <form action={moderate} className="card" key={b.id}><strong>{b.title}</strong> · {b.profiles?.display_name}<input type="hidden" name="id" value={b.id}/><select name="status"><option value="published">Approva e pubblica</option><option value="rejected">Rifiuta</option></select><button>Conferma</button></form>)}</main>;
}
