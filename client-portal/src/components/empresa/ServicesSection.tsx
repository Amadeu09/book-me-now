'use client';

import { useState } from 'react';
import type { ServeiPublic, Empresa } from '@/types/empresa';
import { BookingWidget } from './BookingWidget';

function formatDurada(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

function ServiceRow({
  servei,
  onReservar,
}: {
  servei: ServeiPublic;
  onReservar: () => void;
}) {
  const initial = servei.nom.charAt(0).toUpperCase();

  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-md bg-gray-50 border border-gray-100">
      {/* Avatar 36px */}
      <div className="shrink-0 w-9 h-9 rounded-full overflow-hidden">
        {servei.fotoUrl ? (
          <img src={servei.fotoUrl} alt={servei.nom} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-violet-100 flex items-center justify-center">
            <span className="text-xs font-bold text-violet-700">{initial}</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate leading-tight">{servei.nom}</p>
        <p className="text-xs text-gray-400 mt-0.5">
          {formatDurada(servei.duradaMin)} · {Number(servei.preu).toFixed(2)} €
        </p>
      </div>

      {/* Reservar pill */}
      <button
        onClick={onReservar}
        className="shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-violet-600 text-white hover:bg-violet-700 transition-colors"
        style={{ borderRadius: 999 }}
      >
        Reservar
      </button>
    </div>
  );
}

export function ServicesSection({
  serveis,
  empresa,
}: {
  serveis: ServeiPublic[];
  empresa: Empresa;
}) {
  const [popupServeiId, setPopupServeiId] = useState<number | null>(null);

  return (
    <>
      {serveis.length === 0 ? (
        <p className="text-sm text-gray-400">No hi ha serveis disponibles</p>
      ) : (
        <div className="space-y-2">
          {serveis.map((servei) => (
            <ServiceRow
              key={servei.id}
              servei={servei}
              onReservar={() => setPopupServeiId(servei.id)}
            />
          ))}
        </div>
      )}

      {popupServeiId !== null && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-6"
          style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setPopupServeiId(null); }}
        >
          <div className="w-full sm:max-w-md">
            <BookingWidget
              empresa={empresa}
              serveis={serveis}
              initialServeiId={popupServeiId}
              onClose={() => setPopupServeiId(null)}
            />
          </div>
        </div>
      )}
    </>
  );
}
