'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { searchEmpreses } from '@/lib/api';
import type { Empresa } from '@/types/empresa';
import { Icon } from '@/components/ui/icon';
import { BookingPreview } from './booking-preview';
import { CATEGORIES } from './tipus';

interface Props {
  /** Filtra el directori per tipus i hi baixa. */
  onTipo: (tipo: string | null) => void;
}

export function HeroSection({ onTipo }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLFormElement>(null);

  // Cerca amb debounce; cancel·la la petició anterior si l'usuari continua escrivint
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await searchEmpreses(query, controller.signal);
        setResults(data);
        setIsOpen(true);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (results.length === 1) router.push(`/empresa/${results[0].id}`);
    else if (results.length > 1) setIsOpen(true);
    else onTipo(null);
  };

  return (
    <section id="hero" className="bg-brand-soft">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-6 pt-10 pb-12 md:pt-20 md:pb-16 grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-14 lg:gap-16 items-center">
        <div className="flex flex-col gap-6 min-w-0">
          <span className="self-start inline-flex items-center gap-2 bg-white border border-brand-line rounded-full px-3.5 py-1.5 text-[13px] font-bold text-brand">
            <Icon name="clock" size={15} />
            Reservas online para negocios de proximidad
          </span>
          <h1 className="m-0 text-[40px] sm:text-[52px] lg:text-[64px] leading-[1.03] tracking-[-0.035em] font-extrabold text-brand-ink">
            Tu próxima cita,
            <br />
            <span className="text-brand">reservada ahora.</span>
          </h1>
          <p className="m-0 text-[17px] sm:text-[19px] leading-relaxed text-brand-muted max-w-[520px]">
            Encuentra peluquerías, barberías, centros de estética y mucho más. Mira sus huecos libres y reserva en segundos, sin llamadas.
          </p>

          <form ref={containerRef} role="search" onSubmit={onSubmit} className="relative flex flex-col sm:flex-row gap-2 bg-white border border-brand-line rounded-[18px] p-2 shadow-[0_12px_30px_rgba(20,20,43,0.08)]">
            <label className="flex-1 flex items-center gap-2.5 px-3 text-brand-muted">
              {loading ? <Icon name="spinner" size={18} className="animate-spin" /> : <Icon name="search" size={18} />}
              <span className="sr-only">Busca un negocio o una ciudad</span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => results.length > 0 && setIsOpen(true)}
                onKeyDown={(e) => e.key === 'Escape' && setIsOpen(false)}
                placeholder="Busca un negocio o una ciudad"
                autoComplete="off"
                role="combobox"
                aria-autocomplete="list"
                aria-expanded={isOpen}
                aria-controls="resultats-cerca"
                className="w-full min-h-[44px] bg-transparent border-0 outline-none text-[15px] text-brand-ink placeholder:text-brand-muted"
              />
            </label>
            <button type="submit" className="min-h-[48px] px-6 rounded-[12px] bg-brand text-white text-[15px] font-bold hover:bg-[#4A4AC4] transition-colors">
              Buscar
            </button>

            {isOpen && (
              <ul id="resultats-cerca" className="absolute top-full left-0 right-0 mt-2 bg-white border border-brand-line rounded-[16px] shadow-[0_20px_50px_rgba(20,20,43,0.14)] overflow-hidden z-40 max-h-72 overflow-y-auto">
                {results.length === 0 ? (
                  <li className="px-4 py-3 text-sm text-brand-muted">No hemos encontrado negocios con ese nombre.</li>
                ) : (
                  results.map((empresa) => (
                    <li key={empresa.id}>
                      <button
                        type="button"
                        onClick={() => { setIsOpen(false); router.push(`/empresa/${empresa.id}`); }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-brand-soft transition-colors text-left"
                      >
                        {empresa.fotoPerfil ? (
                          <img src={empresa.fotoPerfil} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
                        ) : (
                          <span className="w-9 h-9 rounded-full bg-brand-soft text-brand flex items-center justify-center shrink-0 text-sm font-bold">
                            {empresa.nom.charAt(0).toUpperCase()}
                          </span>
                        )}
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold text-brand-ink truncate">{empresa.nom}</span>
                          <span className="block text-xs text-brand-muted truncate">{empresa.ubicacio}</span>
                        </span>
                      </button>
                    </li>
                  ))
                )}
              </ul>
            )}
          </form>

          <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-5 px-5 sm:mx-0 sm:px-0 sm:flex-wrap" aria-label="Tipos de negocio">
            {CATEGORIES.filter((c) => c.value).map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => onTipo(c.value)}
                className="shrink-0 inline-flex items-center gap-2 min-h-[40px] px-3.5 rounded-full bg-white border border-brand-line text-brand-ink text-[14px] font-semibold hover:border-brand hover:text-brand transition-colors"
              >
                <Icon name={c.icon} size={16} />
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-16 sm:pt-8 lg:pt-0 min-w-0">
          <BookingPreview />
        </div>
      </div>
    </section>
  );
}
