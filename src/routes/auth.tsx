import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { LogIn, UserPlus, ArrowLeft, LoaderCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { registrationSchema } from '@/lib/account-rules';
import { seo } from '@/lib/seo';
import { Button } from '@/components/ui/button';
export const Route=createFileRoute('/auth')({head:()=>seo('Sign in — CreatorKit Studio','Sign in or create your CreatorKit Studio account to generate AI thumbnails and manage your daily allowance.'),component:AuthPage});
function AuthPage(){
 const [mode,setMode]=useState<'login'|'register'|'forgot'>('login');const [busy,setBusy]=useState(false);const [error,setError]=useState('');const [message,setMessage]=useState('');const navigate=useNavigate();
 async function submit(e:React.FormEvent<HTMLFormElement>){e.preventDefault();setError('');setMessage('');const form=new FormData(e.currentTarget);const email=String(form.get('email')??'').trim();const password=String(form.get('password')??'');setBusy(true);
 try{if(mode==='register'){const parsed=registrationSchema.safeParse(Object.fromEntries(form));if(!parsed.success)throw new Error(parsed.error.issues[0]?.message);const {data,error}=await supabase.auth.signUp({email,password,options:{data:{name:parsed.data.name},emailRedirectTo:window.location.origin}});if(error)throw error;if(data.session)await navigate({to:'/account'});else setMessage('Check your email to confirm your account before signing in.');}
 else if(mode==='forgot'){const {error}=await supabase.auth.resetPasswordForEmail(email,{redirectTo:`${window.location.origin}/reset-password`});if(error)throw error;setMessage('If an account exists, a password reset link has been sent.');}
 else{const {error}=await supabase.auth.signInWithPassword({email,password});if(error)throw error;await navigate({to:'/account'});}}
 catch(e){setError(e instanceof Error?e.message:'Please try again.');}finally{setBusy(false);}}
 return <main className="mx-auto w-full max-w-md px-4 py-12"><Link to="/tools" className="inline-flex items-center gap-2 text-sm text-muted-foreground"><ArrowLeft size={16}/>Tools</Link><h1 className="mt-6 text-3xl font-extrabold">{mode==='register'?'Create your account':mode==='forgot'?'Reset your password':'Welcome back'}</h1><p className="mt-2 text-muted-foreground">CreatorKit Studio</p><form className="mt-8 space-y-4" onSubmit={submit}>
 {mode==='register'&&<label className="block text-sm font-semibold">Name<input name="name" required maxLength={100} autoComplete="name" className="field mt-2"/></label>}
 <label className="block text-sm font-semibold">Email<input name="email" type="email" required maxLength={254} autoComplete="email" className="field mt-2"/></label>
 {mode!=='forgot'&&<label className="block text-sm font-semibold">Password<input name="password" type="password" required minLength={mode==='register'?8:1} autoComplete={mode==='register'?'new-password':'current-password'} className="field mt-2"/></label>}
 {mode==='register'&&<><p className="text-xs text-muted-foreground">At least 8 characters, uppercase, lowercase and a number.</p><label className="block text-sm font-semibold">Confirm password<input name="confirmPassword" type="password" required autoComplete="new-password" className="field mt-2"/></label></>}
 {error&&<p role="alert" className="text-sm text-destructive">{error}</p>}{message&&<p role="status" className="text-sm text-success">{message}</p>}
 <Button disabled={busy} className="h-12 w-full">{busy?<LoaderCircle className="animate-spin"/>:mode==='register'?<UserPlus/>:<LogIn/>}{mode==='register'?'Create account':mode==='forgot'?'Send reset link':'Sign in'}</Button>
 </form><div className="mt-4 flex flex-wrap gap-2">{(['login','register','forgot'] as const).filter(v=>v!==mode).map(v=><Button key={v} variant="link" onClick={()=>{setMode(v);setError('');setMessage('');}}>{v==='login'?'Sign in':v==='register'?'Create account':'Forgot password?'}</Button>)}</div></main>;
}
