'use client';

import { useEffect, useRef, useState } from 'react';
import { Icon } from '@/components/ui/icon';

/**
 * Franja de vídeos que es van alternant amb negocis treballant.
 * Cada clip té una foto (poster) que es veu mentre carrega o si el vídeo no hi és.
 */
// `video`: fitxer a public/videos/ (MP4 H.264, sense so, 720p, ~6-10 s). Sense vídeo es mostra la foto.
const CLIPS: { tipo: string; tipus: string; accio: string; video: string | null; poster: string; boto: string }[] = [
  { tipo: 'PERRUQUERIA', tipus: 'Peluquería', accio: 'Corte y peinado', video: null, poster: '/images/bookmenowFoto.jpg', boto: 'Ver peluquerías' },
  { tipo: 'SPA', tipus: 'Spa', accio: 'Circuito de aguas y relax', video: null, poster: '/images/bookmenowSpa.jpg', boto: 'Ver spas' },
  { tipo: 'DENTAL', tipus: 'Clínica dental', accio: 'Revisión con tu dentista', video: null, poster: '/images/bookmenowDental.jpg', boto: 'Ver clínicas dentales' },
];

const DURACIO_MS = 7000;

export function NegocisEnAccio({ onTipo }: { onTipo: (tipo: string) => void }) {
  const [actiu, setActiu] = useState(0);
  const [pausat, setPausat] = useState(false);
  const videos = useRef<(HTMLVideoElement | null)[]>([]);

  // Qui prefereix menys moviment no veu el canvi automàtic
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) setPausat(true);
  }, []);

  useEffect(() => {
    if (pausat) return;
    const t = setTimeout(() => setActiu((i) => (i + 1) % CLIPS.length), DURACIO_MS);
    return () => clearTimeout(t);
  }, [actiu, pausat]);

  // Només es reprodueix el vídeo visible
  useEffect(() => {
    videos.current.forEach((v, i) => {
      if (!v) return;
      if (i === actiu && !pausat) {
        v.currentTime = 0;
        v.play().catch(() => {});
      } else {
        v.pause();
      }
    });
  }, [actiu, pausat]);

  const clip = CLIPS[actiu];

  return (
    <section aria-labelledby="titol-en-accio" className="bg-brand-soft pb-16 md:pb-24">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-6 flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <p className="m-0 mb-2 text-[13px] font-extrabold tracking-[0.12em] uppercase text-brand">En acción</p>
            <h2 id="titol-en-accio" className="m-0 text-[26px] md:text-[34px] tracking-[-0.03em] font-extrabold text-brand-ink">
              Peluquerías, spas, clínicas y mucho más
            </h2>
          </div>
        </div>

        <div className="relative rounded-[24px] md:rounded-[32px] overflow-hidden bg-brand-ink aspect-[4/5] sm:aspect-[16/9] lg:aspect-[21/9]">
          {CLIPS.map((c, i) => (
            c.video ? (
            <video
              key={c.tipo}
              ref={(el) => { videos.current[i] = el; }}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${i === actiu ? 'opacity-100' : 'opacity-0'}`}
              poster={c.poster}
              muted
              loop
              playsInline
              preload={i === 0 ? 'auto' : 'metadata'}
              aria-hidden="true"
              tabIndex={-1}
            >
              <source src={c.video} type="video/mp4" />
            </video>
            ) : (
              <img
                key={c.tipo}
                src={c.poster}
                alt=""
                className={`absolute inset-0 w-full h-full object-cover transition-[opacity,transform] duration-[1000ms,8000ms] ease-out ${i === actiu ? 'opacity-100 scale-105' : 'opacity-0 scale-100'}`}
              />
            )
          ))}

          <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />

          <div className="absolute left-0 right-0 bottom-0 p-5 sm:p-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div aria-live="polite" className="flex flex-col gap-2">
              <span className="self-start text-[12px] font-bold text-brand-ink bg-white/90 px-3 py-1 rounded-full">{clip.tipus}</span>
              <p className="m-0 text-white text-[22px] sm:text-[30px] font-extrabold tracking-[-0.02em] drop-shadow">{clip.accio}</p>
              <button
                type="button"
                onClick={() => onTipo(clip.tipo)}
                className="self-start inline-flex items-center gap-2 min-h-[44px] text-white text-[15px] font-bold hover:underline underline-offset-4"
              >
                {clip.boto}
                <Icon name="arrow" size={18} />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5" role="group" aria-label="Elegir vídeo">
                {CLIPS.map((c, i) => (
                  <button
                    key={c.tipo}
                    type="button"
                    onClick={() => setActiu(i)}
                    aria-label={`${c.tipus}: ${c.accio}`}
                    aria-current={i === actiu}
                    className="h-11 flex items-center px-1"
                  >
                    <span className={`block h-1.5 rounded-full transition-all duration-300 ${i === actiu ? 'w-10 bg-white' : 'w-5 bg-white/45'}`} />
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setPausat((p) => !p)}
                aria-label={pausat ? 'Reproducir vídeos' : 'Pausar vídeos'}
                className="w-11 h-11 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center backdrop-blur"
              >
                {pausat ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 5v14l12-7z" /></svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 5h4v14H7zM13 5h4v14h-4z" /></svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
