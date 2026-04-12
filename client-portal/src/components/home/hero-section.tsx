'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { searchEmpreses } from '@/lib/api';
import type { Empresa } from '@/types/empresa';

export function HeroSection() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounce + AbortController: cancel·la la request anterior si l'usuari segueix escrivint
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
        if ((err as Error).name !== 'AbortError') {
          setResults([]);
        }
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  // Tanca el dropdown en clicar fora
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <section className="relative min-h-[921px] flex items-center px-6 md:px-12 mb-32">
      <div className="absolute inset-0 z-0 overflow-hidden px-4 md:px-12 py-6">
        <div className="w-full h-full rounded-xl overflow-hidden relative">
          <img
            alt="Luxury Interior"
            className="w-full h-full object-cover"
            data-alt="Interior of a high-end minimalist luxury spa with warm ambient lighting, limestone walls, and architectural greenery"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBsIisqLbPCuD36ffKwns9OqTTPHl0rXnruqjOpO1ouaH9jS7iA4uwPudXyK-a810Fid6vY5vVrTsse1RunidGygTABtxRMpzVXdBLhiE6TuaoqELWVgf9v2DyL-PEye5YcRMlnS7nxWOp0FqO53eg6jagU04iHsTeTSbR41NwPyPrSA1u3HJg5shBGodpPobLvRWRK3rdPU0RuvTkYx5WFM8PZXHzUgozIcPtDFN3QnIzsTxh8XTZbi7vk-3qBmSGx0wMzKObfc7Xr"
          />
          <div className="absolute inset-0 bg-black/10"></div>
        </div>
      </div>
      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col items-start pt-20">
        <div className="inline-block px-4 py-1 bg-white/20 backdrop-blur-md rounded-full text-white text-xs font-bold tracking-[0.2em] uppercase mb-6">
          Curated Excellence
        </div>
        <h1 className="text-white text-6xl md:text-8xl font-black editorial-kern leading-[0.9] mb-12 max-w-3xl">
          Discover the <br /> <span className="text-secondary-fixed">Uncommon.</span>
        </h1>
        {/* Glassmorphism Floating Search */}
        <div className="glass-panel p-4 rounded-xl w-full max-w-3xl flex flex-col md:flex-row gap-4 shadow-2xl items-center">
          {/* Search input with dropdown */}
          <div className="flex-1 w-full relative" ref={containerRef}>
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant z-10">
              {loading ? 'progress_activity' : 'search'}
            </span>
            <input
              className="w-full bg-surface-container-low border-none rounded-full py-4 pl-12 pr-6 focus:ring-2 focus:ring-primary/20 placeholder:text-on-surface-variant text-sm font-medium"
              placeholder="What are you seeking?"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => results.length > 0 && setIsOpen(true)}
            />

            {/* Dropdown de resultats */}
            {isOpen && (
              <ul className="absolute top-full left-0 right-0 mt-2 bg-surface-container-lowest rounded-2xl shadow-2xl overflow-hidden z-50 max-h-72 overflow-y-auto">
                {results.length === 0 ? (
                  <li className="px-4 py-3 text-sm text-on-surface-variant">
                    No s&apos;han trobat empreses
                  </li>
                ) : (
                  results.map((empresa) => (
                    <li key={empresa.id}>
                      <button
                        type="button"
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-container transition-colors text-left"
                        onClick={() => {
                          setIsOpen(false);
                          router.push(`/empresa/${empresa.id}`);
                        }}
                      >
                        {empresa.fotoPerfil ? (
                          <img
                            src={empresa.fotoPerfil}
                            alt={empresa.nom}
                            className="w-9 h-9 rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-primary-fixed flex items-center justify-center shrink-0">
                            <span className="text-on-primary-fixed-variant text-sm font-bold">
                              {empresa.nom.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-on-surface truncate">
                            {empresa.nom}
                          </p>
                          <p className="text-xs text-on-surface-variant truncate">
                            {empresa.ubicacio}
                          </p>
                        </div>
                      </button>
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>

          <div className="flex-1 w-full relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">
              location_on
            </span>
            <input
              className="w-full bg-surface-container-low border-none rounded-full py-4 pl-12 pr-6 focus:ring-2 focus:ring-primary/20 placeholder:text-on-surface-variant text-sm font-medium"
              placeholder="Location"
              type="text"
            />
          </div>
          <button className="w-full md:w-auto bg-primary text-white px-10 py-4 rounded-full font-bold hover:bg-primary-container transition-colors shadow-xl shadow-primary/10">
            Explore
          </button>
        </div>
      </div>
    </section>
  );
}
