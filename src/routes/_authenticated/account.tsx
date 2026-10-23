import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { LogOut, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAccount } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import { utcDay } from '@/lib/account-rules';
import { seo } from '@/lib/seo';
export const Route=createFileRoute('/_authenticated/account')({head:()=>seo('Your account — CreatorKit Studio','Manage your creator profile and daily AI thumbnail allowance.'),component:Account});
function Account(){const {user}=useAccount();const qc=useQueryClient();const navigate=useNavigate();const [message,setMessage]=useState('');const [saving,setSaving]=useState(false);
 const {data,error}=useQuery({queryKey:['account',user?.id],enabled:!!user,queryFn:async()=>{if(!user)throw new Error('Sign in required');const [profile,usage]=await Promise.all([supabase.from('profiles').select('name').eq('id',user.id).single(),supabase.from('thumbnail_days').select('successful').eq('user_id',user.id).eq('day',utcDay()).maybeSingle()]);if(profile.error)throw profile.error;if(usage.error)throw usage.error;return {name:profile.data.name,remaining:5-(usage.data?.successful??0)};}});
 async function logout(){await qc.cancelQueries();qc.clear();await supabase.auth.signOut();await navigate({to:'/auth',replace:true});}
 async function save(e:React.FormEvent<HTMLFormElement>){e.preventDefault();if(!user)return;setSaving(true);const name=String(new FormData(e.currentTarget).get('name')??'').trim();const {error}=await supabase.from('profiles').update({name}).eq('id',user.id);setMessage(error?error.message:'Profile saved.');setSaving(false);void qc.invalidateQueries({queryKey:['account']});}
 return <main className="mx-auto max-w-3xl px-4 py-12"><div className="flex items-center justify-between gap-4"><h1 className="text-3xl font-extrabold">Your account</h1><Button variant="outline" onClick={logout}><LogOut/>Sign out</Button></div><p className="mt-2 break-all text-muted-foreground">{user?.email}</p>{error&&<p role="alert" className="mt-6 text-destructive">Could not load your account. Please refresh.</p>}{data&&<><section className="mt-8 border-y py-6"><h2 className="text-lg font-semibold">Daily thumbnail allowance</h2><p className="mt-2 text-3xl font-extrabold text-primary">{data.remaining} / 5 remaining</p><p className="mt-2 text-sm text-muted-foreground">Resets at 00:00 UTC. Only generated images count.</p><Button asChild className="mt-4"><Link to="/tools/ai-thumbnail-generator"><Sparkles/>Create thumbnail</Link></Button></section><form onSubmit={save} className="mt-8 max-w-md space-y-4"><label className="block font-semibold">Name<input name="name" defaultValue={data.name} required maxLength={100} className="field mt-2"/></label>{message&&<p role="status" className="text-sm">{message}</p>}<Button disabled={saving}>Save profile</Button></form></>}</main>;
}
