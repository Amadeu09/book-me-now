'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getEmpresasPublic } from '@/lib/api';
import type { Empresa } from '@/types/empresa';

const CATEGORIES: { label: string; value: string | null; icon: string }[] = [
  { label: 'Peluquería', value: 'PERRUQUERIA', icon: 'content_cut' },
  { label: 'Barbería', value: 'BARBERIA', icon: 'face_retouching_natural' },
  { label: 'Estética', value: 'ESTETICA', icon: 'auto_awesome' },
  { label: 'Spa', value: 'SPA', icon: 'spa' },
  { label: 'Dental', value: 'DENTAL', icon: 'dentistry' },
  { label: 'Fisioterapia', value: 'FISIOTERAPIA', icon: 'accessibility_new' },
  { label: 'Más', value: null, icon: 'grid_view' },
];

const TIPO_LABELS: Record<string, string> = {
  PERRUQUERIA: 'Peluquería',
  BARBERIA: 'Barbería',
  ESTETICA: 'Estética',
  SPA: 'Spa',
  MASSATGES: 'Masajes',
  FITNESS: 'Fitness',
  PILATES: 'Pilates',
  IOGA: 'Yoga',
  NUTRICIONISTA: 'Nutricionista',
  FISIOTERAPIA: 'Fisioterapia',
  DENTAL: 'Dental',
  VETERINARIA: 'Veterinaria',
  ALTRES: 'Otros',
  OTROS: 'Otros',
};

const LIMIT = 3;

function BusinessCard({ empresa }: { empresa: Empresa }) {
  const router = useRouter();
  const initial = empresa.nom.charAt(0).toUpperCase();
  const tipoLabel = empresa.tipo ? (TIPO_LABELS[empresa.tipo] ?? empresa.tipo) : null;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => router.push(`/empresa/${empresa.id}`)}
      onKeyDown={(e) => e.key === 'Enter' && router.push(`/empresa/${empresa.id}`)}
      className="group bg-white rounded-[2rem] border border-gray-200/80 overflow-hidden hover:border-primary/30 transition-colors duration-200 flex flex-col cursor-pointer"
    >
      {/* Banner */}
      <div className="relative h-44 shrink-0 overflow-hidden">
        {empresa.bannerUrl ? (
          <img
            src={empresa.bannerUrl}
            alt={empresa.nom}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-5xl font-black text-white/30 select-none"
            style={{ background: 'linear-gradient(135deg, #FF6B6B 0%, #1F2937 100%)' }}
          >
            {initial}
          </div>
        )}
        {tipoLabel && (
          <span className="absolute top-4 right-4 text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/90 text-primary backdrop-blur-sm">
            {tipoLabel}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-bold text-gray-900 text-base leading-tight line-clamp-1 mb-1.5">
          {empresa.nom}
        </h3>

        {empresa.ubicacio && (
          <p className="flex items-center gap-1 text-xs text-gray-400 line-clamp-1 mb-4">
            <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>location_on</span>
            {empresa.ubicacio}
          </p>
        )}

        <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs font-semibold text-primary group-hover:text-primary transition-colors">
            Ver perfil
          </span>
          <span className="material-symbols-outlined text-primary/30 group-hover:text-primary transition-colors" style={{ fontSize: '18px' }}>
            north_east
          </span>
        </div>
      </div>
    </div>
  );
}

function NavArrow({
  direction,
  disabled,
  onClick,
}: {
  direction: 'left' | 'right';
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === 'left' ? 'Anterior' : 'Siguiente'}
      className={[
        'shrink-0 w-11 h-11 rounded-full border flex items-center justify-center transition-colors duration-150',
        disabled
          ? 'border-gray-100 text-gray-300 cursor-not-allowed bg-white'
          : 'border-gray-200 text-gray-600 bg-white hover:border-primary hover:text-primary',
      ].join(' ')}
    >
      <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
        {direction === 'left' ? 'chevron_left' : 'chevron_right'}
      </span>
    </button>
  );
}

export function BusinessDirectorySection() {
  const [selectedTipo, setSelectedTipo] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [businesses, setBusinesses] = useState<Empresa[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    getEmpresasPublic(selectedTipo, currentPage, LIMIT)
      .then((res) => {
        if (cancelled) return;
        setBusinesses(res.data);
        setTotalPages(res.totalPages);
      })
      .catch(() => {
        if (!cancelled) setBusinesses([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [selectedTipo, currentPage]);

  const handleCategorySelect = (value: string | null) => {
    setSelectedTipo(value);
    setCurrentPage(1);
  };

  return (
    <section className="px-6 md:px-12 max-w-[1920px] mx-auto mb-8">

      {/* Pill bar */}
      <div className="mb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-gray-400 mb-3">
          Tipo de negocio
        </p>
        <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-hide">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedTipo === cat.value;
            return (
              <button
                key={cat.value ?? 'all'}
                onClick={() => handleCategorySelect(cat.value)}
                className={[
                  'flex items-center gap-1.5 px-4 py-2.5 rounded-full whitespace-nowrap text-sm font-medium transition-colors duration-150 shrink-0 border',
                  isSelected
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-primary/30 hover:text-primary',
                ].join(' ')}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                  {cat.icon}
                </span>
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Row with side arrows */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <span
            className="material-symbols-outlined text-gray-300"
            style={{ fontSize: '40px', animation: 'spin 1s linear infinite' }}
          >
            progress_activity
          </span>
        </div>
      ) : businesses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <span className="material-symbols-outlined text-gray-300" style={{ fontSize: '48px' }}>
            store_mall_directory
          </span>
          <p className="text-sm text-gray-400">No hay negocios de este tipo todavía.</p>
        </div>
      ) : (
        <div className="flex items-stretch gap-4">
          {/* Left arrow */}
          <div className="flex items-center">
            <NavArrow
              direction="left"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            />
          </div>

          {/* Cards — always 3 columns */}
          <div className="flex-1 grid grid-cols-3 gap-5">
            {businesses.map((empresa) => (
              <BusinessCard key={empresa.id} empresa={empresa} />
            ))}
          </div>

          {/* Right arrow */}
          <div className="flex items-center">
            <NavArrow
              direction="right"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            />
          </div>
        </div>
      )}

      {/* Page indicator dots */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-5">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              aria-label={`Página ${i + 1}`}
              style={{
                width: i + 1 === currentPage ? '24px' : '8px',
                height: '8px',
                borderRadius: '999px',
                backgroundColor: i + 1 === currentPage ? '#FF6B6B' : '#e5e7eb',
                transition: 'all 0.3s ease',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}
