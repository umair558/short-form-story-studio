import { createClient } from '@supabase/supabase-js';
import { expect, it } from 'vitest';
const url=process.env['SUPABASE_URL'];const key=process.env['SUPABASE_SERVICE_ROLE_KEY'];
it.skipIf(!url||!key)('enforces five successes atomically across simultaneous requests and resets by UTC day',async()=>{
 if(!url||!key)return;
 const db=createClient(url,key,{auth:{persistSession:false}});const user=crypto.randomUUID();
 const reserve=()=>db.rpc('reserve_thumbnail',{p_user:user});
 const finish=(id:string,success:boolean)=>db.rpc('finish_thumbnail',{p_user:user,p_request:id,p_success:success});
 const cooldown=()=>db.from('thumbnail_days').update({last_attempt:'2000-01-01T00:00:00Z'}).eq('user_id',user);
 try{
  await db.from('thumbnail_days').insert({user_id:user,day:'2000-01-01',successful:5});
  const parallel=await Promise.all([reserve(),reserve()]);expect(parallel.filter(r=>!r.error)).toHaveLength(1);expect(parallel.filter(r=>!!r.error)).toHaveLength(1);
  const first=parallel.find(r=>r.data);if(!first?.data)throw new Error('Reservation failed');
  expect((await finish(first.data,false)).data).toBe(5);await cooldown();
  for(let remaining=4;remaining>=0;remaining--){const r=await reserve();if(!r.data)throw new Error('Expected reservation');expect((await finish(r.data,true)).data).toBe(remaining);expect((await finish(r.data,true)).data).toBe(remaining);await cooldown();}
  expect((await reserve()).error?.message).toContain('Daily limit');
 }finally{await db.from('thumbnail_requests').delete().eq('user_id',user);await db.from('thumbnail_days').delete().eq('user_id',user);}
},30000);
