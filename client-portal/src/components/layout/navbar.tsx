'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

export function Navbar() {
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      setVisible(currentY < lastScrollY.current || currentY < 10);
      lastScrollY.current = currentY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 bg-white dark:bg-white backdrop-blur-2xl transition-transform duration-300 ${
        visible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="flex justify-between items-center px-6 md:px-12 py-6 max-w-[1920px] mx-auto">
        <Link href="/" className="text-2xl font-bold tracking-tighter text-slate-900 font-headline hover:opacity-80 transition-opacity">
          BookMeNow
        </Link>
        <div className="hidden md:flex gap-8 items-center font-['Plus_Jakarta_Sans'] tracking-tight font-medium text-sm">
          <Link href="/#hero" className="text-slate-500 hover:text-primary transition-colors duration-200">Home</Link>
          <Link href="/#software" className="text-slate-500 hover:text-primary transition-colors duration-200">Software</Link>
          <Link href="/#como-funciona" className="text-slate-500 hover:text-primary transition-colors duration-200">Cómo funciona</Link>
          <Link href="/#proximamente" className="text-slate-500 hover:text-primary transition-colors duration-200">Próximamente</Link>
          <Link href="/#contacto" className="bg-primary text-white px-5 py-2.5 rounded-full hover:opacity-85 transition-opacity duration-200 font-semibold">Contact Us</Link>
        </div>
        <div />
      </div>
    </nav>
  );
}
