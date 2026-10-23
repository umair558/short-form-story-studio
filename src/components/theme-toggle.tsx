import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from './ui/button';
export function ThemeToggle() {
 const [dark,setDark]=useState(false);
 useEffect(()=>{ const value=localStorage.getItem('creatorkit-theme')==='dark'; setDark(value); document.documentElement.classList.toggle('dark',value); },[]);
 function toggle(){const value=!dark;setDark(value);document.documentElement.classList.toggle('dark',value);localStorage.setItem('creatorkit-theme',value?'dark':'light');}
 return <Button variant="outline" size="icon" className="h-10 w-10" onClick={toggle} aria-label={dark?'Switch to light mode':'Switch to dark mode'} title={dark?'Light mode':'Dark mode'}>{dark?<Sun/>:<Moon/>}</Button>;
}
