'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { LogoMark } from './logo';
import { Wordmark } from './wordmark';
import { Icon } from '@/components/ui/icon';
import { ACCES_URL, REGISTRE_URL } from '@/lib/links';

const ENLLACOS = [
  { href: '/#negocios', label: 'Buscar negocios' },
  { href: '/#para-negocios', label: 'Para negocios' },
  { href: '/#como-funciona', label: 'Cómo funciona' },
];

export function Navbar() {
  const [visible, setVisible] = useState(true);
  const [menuObert, setMenuObert] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setVisible(y < lastScrollY.current || y < 10);
      lastScrollY.current = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!menuObert) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuObert(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuObert]);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 bg-white/95 backdrop-blur border-b border-brand-line transition-transform duration-300 ${
        visible || menuObert ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <nav aria-label="Principal" className="max-w-[1200px] mx-auto px-5 sm:px-6 h-[72px] flex items-center justify-between gap-6">
        <Link href="/" aria-label="BookMeNow, inicio" className="flex items-center gap-2.5 hover:opacity-85 transition-opacity">
          <LogoMark size={34} />
          <Wordmark className="text-[21px]" />
        </Link>

        <div className="hidden md:flex items-center gap-7 text-[15px] font-semibold">
          {ENLLACOS.map((e) => (
            <Link key={e.href} href={e.href} className="text-brand-muted hover:text-brand transition-colors">{e.label}</Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2">
          <a href={ACCES_URL} className="px-3 min-h-[44px] inline-flex items-center text-[15px] font-bold text-brand-ink hover:text-brand transition-colors">Acceso negocios</a>
          <a href={REGISTRE_URL} className="min-h-[44px] px-5 inline-flex items-center rounded-[12px] bg-brand text-white text-[15px] font-bold hover:bg-[#4A4AC4] transition-colors">Registra tu negocio</a>
        </div>

        <button
          type="button"
          className="md:hidden w-11 h-11 rounded-[12px] border border-brand-line text-brand-ink flex items-center justify-center"
          aria-label={menuObert ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={menuObert}
          aria-controls="menu-mobil"
          onClick={() => setMenuObert((o) => !o)}
        >
          <Icon name={menuObert ? 'close' : 'menu'} size={20} />
        </button>
      </nav>

      {menuObert && (
        <div id="menu-mobil" className="md:hidden border-t border-brand-line bg-white px-5 pb-5 pt-2 flex flex-col">
          {ENLLACOS.map((e) => (
            <Link key={e.href} href={e.href} onClick={() => setMenuObert(false)} className="min-h-[48px] flex items-center text-[16px] font-semibold text-brand-ink border-b border-brand-line">
              {e.label}
            </Link>
          ))}
          <a href={ACCES_URL} className="min-h-[48px] flex items-center text-[16px] font-semibold text-brand-ink">Acceso negocios</a>
          <a href={REGISTRE_URL} className="mt-2 min-h-[48px] flex items-center justify-center rounded-[12px] bg-brand text-white text-[16px] font-bold">Registra tu negocio</a>
        </div>
      )}
    </header>
  );
}
