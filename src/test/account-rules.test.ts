import { expect, it } from 'vitest';
import { DAILY_THUMBNAIL_LIMIT, passwordSchema, registrationSchema, utcDay } from '@/lib/account-rules';
import { isImageBytes } from '@/lib/thumbnail-quota.server';
it('allows five thumbnails daily',()=>expect(DAILY_THUMBNAIL_LIMIT).toBe(5));
it('requires matching registration passwords',()=>expect(registrationSchema.safeParse({name:'Creator',email:'creator@example.com',password:'Secure123',confirmPassword:'Different123'}).success).toBe(false));
it('rejects weak passwords',()=>{expect(passwordSchema.safeParse('short').success).toBe(false);expect(passwordSchema.safeParse('Secure123').success).toBe(true);});
it('uses the same UTC day regardless of local timezone',()=>expect(utcDay(new Date('2026-10-24T04:59:00+05:00'))).toBe('2026-10-23'));
it('does not count an HTML response as a generated image',()=>expect(isImageBytes(new TextEncoder().encode('<html>not an image</html>'),'image/png')).toBe(false));