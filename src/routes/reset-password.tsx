import { createFileRoute, Link } from '@tanstack/react-router';
import { useEffect,useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { passwordSchema } from '@/lib/account-rules';
import { seo } from '@/lib/seo';
import { Button } from '@/components/ui/button';
export const Route=createFileRoute('/reset-password')({head:()=>seo('Reset password — CreatorKit Studio','Securely set a new password for your CreatorKit Studio account.'),component:Reset});
function Reset(){const [valid,setValid]=useState(false);const [busy,setBusy]=useState(false);const [message,setMessage]=useState('');const [done,setDone]=useState(false);
 useEffect(()=>{if(new URLSearchParams(window.location.hash.slice(1)).get('type')==='recovery')setValid(true);},[]);
 async function submit(e:React.FormEvent<HTMLFormElement>){e.preventDefault();setMessage('');const data=new FormData(e.currentTarget);const parsed=passwordSchema.safeParse(data.get('password'));if(!parsed.success){setMessage(parsed.error.issues[0]?.message??'Invalid password');return;}if(parsed.data!==data.get('confirm')){setMessage('Passwords must match.');return;}setBusy(true);const {error}=await supabase.auth.updateUser({password:parsed.data});setBusy(false);if(error)setMessage(error.message);else setDone(true);}
 return <main className="mx-auto max-w-md px-4 py-12"><h1 className="text-3xl font-bold">New password</h1>{done?<p className="mt-6 text-success">Your password has been updated. <Link to="/account" className="underline">Go to account</Link></p>:!valid?<p className="mt-6 text-muted-foreground">Open your password reset email link to continue. <Link to="/auth" className="text-primary">Request a new link</Link></p>:<form onSubmit={submit} className="mt-6 space-y-4"><label className="block">New password<input className="field mt-2" type="password" name="password" autoComplete="new-password" required/></label><label className="block">Confirm password<input className="field mt-2" type="password" name="confirm" autoComplete="new-password" required/></label><p className="text-xs text-muted-foreground">8 characters minimum, uppercase, lowercase and a number.</p>{message&&<p role="alert" className="text-destructive">{message}</p>}<Button disabled={busy}>Save new password</Button></form>}</main>;
}
