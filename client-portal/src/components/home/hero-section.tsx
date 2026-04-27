'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { searchEmpreses } from '@/lib/api';
import type { Empresa } from '@/types/empresa';

const TYPEWRITER_WORDS = [
  'Extraordinario.',
  'Único.',
  'Exclusivo.',
  'Inigualable.',
  'Tuyo.',
];

const TYPING_SPEED = 80;   // ms per character while typing
const DELETING_SPEED = 45;   // ms per character while deleting
const PAUSE_AFTER = 2000; // ms to hold full word before deleting

function useTypewriter(words: string[]) {
  const [displayed, setDisplayed] = useState('');
  const [wordIdx, setWordIdx] = useState(0);
  const [phase, setPhase] = useState<'typing' | 'pausing' | 'deleting'>('typing');

  useEffect(() => {
    const word = words[wordIdx];

    if (phase === 'typing') {
      if (displayed.length < word.length) {
        const t = setTimeout(
          () => setDisplayed(word.slice(0, displayed.length + 1)),
          TYPING_SPEED,
        );
        return () => clearTimeout(t);
      }
      const t = setTimeout(() => setPhase('deleting'), PAUSE_AFTER);
      return () => clearTimeout(t);
    }

    if (phase === 'deleting') {
      if (displayed.length > 0) {
        const t = setTimeout(
          () => setDisplayed(displayed.slice(0, -1)),
          DELETING_SPEED,
        );
        return () => clearTimeout(t);
      }
      setWordIdx((i) => (i + 1) % words.length);
      setPhase('typing');
    }
  }, [displayed, phase, wordIdx, words]);

  return displayed;
}

export function HeroSection() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const typedText = useTypewriter(TYPEWRITER_WORDS);

  const HERO_IMAGES = [
    '/images/bookmenowFoto.png',
    '/images/bookmenowdental.png',
    '/images/bookmenowspa.png',
  ];
  const [heroIdx, setHeroIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setHeroIdx((i) => (i + 1) % HERO_IMAGES.length), 5000);
    return () => clearInterval(t);
  }, []);

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
    <section className="relative min-h-[580px] flex items-center px-6 md:px-12 mb-7">
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="w-full h-full overflow-hidden relative">
          {HERO_IMAGES.map((src, i) => (
            <img
              key={src}
              alt="Interior de lujo"
              className="absolute inset-0 w-full h-full object-cover"
              src={src}
              style={{
                opacity: i === heroIdx ? 1 : 0,
                transition: 'opacity 1.2s ease-in-out',
              }}
            />
          ))}
          {/* Base dark overlay */}
          <div className="absolute inset-0 bg-black/40" />
          {/* Left-side directional gradient for text contrast */}
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.70) 0%, rgba(0,0,0,0.15) 60%, transparent 100%)' }}
          />
        </div>
      </div>
      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col items-start pt-20">
        <div className="inline-block px-4 py-1 bg-white/20 backdrop-blur-md rounded-full text-white text-xs font-bold tracking-[0.2em] uppercase mb-6">
          Selección Exclusiva
        </div>
        <h1
          className="text-white text-6xl md:text-8xl font-black editorial-kern leading-[0.9] mb-12 max-w-3xl"
          style={{ textShadow: '0 2px 20px rgba(0,0,0,0.6)' }}
        >
          Descubre lo <br />
          <span className="text-secondary-fixed" style={{ textShadow: '0 2px 20px rgba(0,0,0,0.6)' }}>
            {typedText}
            <span
              style={{
                display: 'inline-block',
                width: '3px',
                marginLeft: '4px',
                background: 'currentColor',
                verticalAlign: 'baseline',
                animation: 'blink 1s step-end infinite',
              }}
            >&nbsp;</span>
          </span>
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
              placeholder="¿Qué estás buscando?"
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

          <button className="w-full md:w-auto bg-primary text-white px-10 py-4 rounded-full font-bold hover:bg-primary-container transition-colors shadow-xl shadow-primary/10">
            Explorar
          </button>
        </div>

        {/* Slideshow dots */}
        <div className="flex items-center gap-2.5 mt-5">
          {HERO_IMAGES.map((_, i) => (
            <button
              key={i}
              onClick={() => setHeroIdx(i)}
              aria-label={`Imagen ${i + 1}`}
              style={{
                width: i === heroIdx ? '28px' : '8px',
                height: '8px',
                borderRadius: '999px',
                backgroundColor: i === heroIdx ? 'var(--color-secondary-fixed, #e9c46a)' : 'rgba(255,255,255,0.4)',
                transition: 'all 0.4s ease',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
