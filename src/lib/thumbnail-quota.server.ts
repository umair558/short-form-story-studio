import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
export async function thumbnailIdentity(request: Request) {
 const token=request.headers.get('authorization')?.match(/^Bearer (.+)$/)?.[1];const url=process.env['SUPABASE_URL'];const key=process.env['SUPABASE_PUBLISHABLE_KEY'];if(!token||!url||!key)return null;
 const client=createClient<Database>(url,key,{auth:{persistSession:false,autoRefreshToken:false},global:{headers:{Authorization:`Bearer ${token}`}}});const {data,error}=await client.auth.getUser(token);return error?null:data.user;
}
export function isImageBytes(bytes:Uint8Array,type:string){
 if(/image\/png/i.test(type))return bytes.length>24&&[137,80,78,71,13,10,26,10].every((v,i)=>bytes[i]===v);
 if(/image\/jpeg/i.test(type))return bytes.length>4&&bytes[0]===255&&bytes[1]===216&&bytes[2]===255;
 if(/image\/webp/i.test(type))return bytes.length>12&&String.fromCharCode(...bytes.slice(0,4))==='RIFF'&&String.fromCharCode(...bytes.slice(8,12))==='WEBP';return false;
}
