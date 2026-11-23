'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getEmpresasPublic } from '@/lib/api';
import type { Empresa } from '@/types/empresa';
import { Icon } from '@/components/ui/icon';
import { CATEGORIES, TIPO_LABELS } from './tipus';

const PER_PAGINA = 6;

function BusinessCard({ empresa }: { empresa: Empresa }) {
  const tipo = empresa.tipo ? (TIPO_LABELS[empresa.tipo] ?? empresa.tipo) : null;
  return (
    <article className="group bg-white border border-brand-line rounded-[20px] overflow-hidden flex flex-col hover:shadow-[0_18px_40px_rgba(20,20,43,0.08)] transition-shadow">
      <div className="relative h-[180px] bg-brand-soft overflow-hidden">
        {empresa.bannerUrl ? (
          <img src={empresa.bannerUrl} alt="" className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500" />
        ) : (
          <div aria-hidden="true" className="w-full h-full flex items-center justify-center text-[56px] font-extrabold text-brand/25">
            {empresa.nom.charAt(0).toUpperCase()}
          </div>
        )}
        {empresa.fotoPerfil && (
          <img src={empresa.fotoPerfil} alt="" className="absolute left-5 -bottom-6 w-14 h-14 rounded-[14px] object-cover border-4 border-white shadow-sm" />
        )}
      </div>
      <div className={`px-5 pb-5 ${empresa.fotoPerfil ? 'pt-9' : 'pt-5'} flex flex-col gap-2.5 flex-1`}>
        {tipo && (
          <span className="self-start text-[12px] font-bold text-brand bg-brand-soft px-2.5 py-1 rounded-full">{tipo}</span>
        )}
        <h3 className="m-0 text-[18px] font-extrabold text-brand-ink line-clamp-1">{empresa.nom}</h3>
        {empresa.ubicacio && (
          <p className="m-0 flex items-center gap-1.5 text-[14px] text-brand-muted line-clamp-1">
            <Icon name="pin" size={15} className="shrink-0" />
            {empresa.ubicacio}
          </p>
        )}
        <Link
          href={`/empresa/${empresa.id}`}
          className="mt-auto pt-1 inline-flex items-center justify-center gap-2 min-h-[46px] rounded-[12px] border border-brand-line text-brand-ink text-[15px] font-bold hover:border-brand hover:text-brand transition-colors"
        >
          Ver horarios y reservar
          <span className="sr-only">en {empresa.nom}</span>
        </Link>
      </div>
    </article>
  );
}

interface Props {
  tipo: string | null;
  onTipo: (tipo: string | null) => void;
}

export function BusinessDirectorySection({ tipo, onTipo }: Props) {
  const [pagina, setPagina] = useState(1);
  const [negocis, setNegocis] = useState<Empresa[]>([]);
  const [totalPagines, setTotalPagines] = useState(1);
  const [carregant, setCarregant] = useState(true);
  const [error, setError] = useState(false);

  // En canviar de tipus, tornem a la primera pàgina abans de demanar res
  const [tipoPrevi, setTipoPrevi] = useState(tipo);
  if (tipo !== tipoPrevi) {
    setTipoPrevi(tipo);
    setPagina(1);
  }

  useEffect(() => {
    let cancel = false;
    setCarregant(true);
    setError(false);
    getEmpresasPublic(tipo, pagina, PER_PAGINA)
      .then((res) => {
        if (cancel) return;
        setNegocis((prev) => (pagina === 1 ? res.data : [...prev, ...res.data]));
        setTotalPagines(res.totalPages);
      })
      .catch(() => { if (!cancel) { setError(true); if (pagina === 1) setNegocis([]); } })
      .finally(() => { if (!cancel) setCarregant(false); });
    return () => { cancel = true; };
  }, [tipo, pagina]);

  return (
    <section id="negocios" className="py-16 md:py-24 scroll-mt-20">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-6 flex flex-col gap-8">
        <div>
          <p className="m-0 mb-2 text-[13px] font-extrabold tracking-[0.12em] uppercase text-brand">Negocios en BookMeNow</p>
          <h2 className="m-0 text-[28px] md:text-[40px] tracking-[-0.03em] font-extrabold text-brand-ink">Reserva donde ya confías</h2>
        </div>

        <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-5 px-5 sm:mx-0 sm:px-0 sm:flex-wrap" role="group" aria-label="Filtrar por tipo de negocio">
          {CATEGORIES.map((c) => {
            const actiu = tipo === c.value;
            return (
              <button
                key={c.value ?? 'tots'}
                type="button"
                aria-pressed={actiu}
                onClick={() => onTipo(c.value)}
                className={`shrink-0 inline-flex items-center gap-2 min-h-[40px] px-3.5 rounded-full border text-[14px] font-semibold transition-colors ${
                  actiu ? 'bg-brand border-brand text-white' : 'bg-white border-brand-line text-brand-ink hover:border-brand hover:text-brand'
                }`}
              >
                <Icon name={c.icon} size={16} />
                {c.label}
              </button>
            );
          })}
        </div>

        {carregant && pagina === 1 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6" aria-busy="true" aria-label="Cargando negocios">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-[360px] rounded-[20px] bg-brand-soft animate-pulse" />
            ))}
          </div>
        ) : negocis.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-14 text-center">
            <span className="w-14 h-14 rounded-full bg-brand-soft text-brand flex items-center justify-center"><Icon name="search" size={24} /></span>
            <p className="m-0 text-[15px] text-brand-muted">
              {error ? 'No hemos podido cargar los negocios. Vuelve a intentarlo en un momento.' : 'Todavía no hay negocios de este tipo.'}
            </p>
            {tipo && !error && (
              <button type="button" onClick={() => onTipo(null)} className="text-[15px] font-bold text-brand min-h-[44px]">Ver todos los negocios</button>
            )}
          </div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {negocis.map((e) => <BusinessCard key={e.id} empresa={e} />)}
            </div>
            {pagina < totalPagines && (
              <button
                type="button"
                onClick={() => setPagina((p) => p + 1)}
                disabled={carregant}
                className="self-center inline-flex items-center gap-2 min-h-[48px] px-6 rounded-[12px] border border-brand-line bg-white text-brand-ink text-[15px] font-bold hover:border-brand hover:text-brand transition-colors disabled:opacity-60"
              >
                {carregant ? 'Cargando…' : 'Ver más negocios'}
                {!carregant && <Icon name="arrow" size={18} />}
              </button>
            )}
          </>
        )}
      </div>
    </section>
  );
}
