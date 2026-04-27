'use client';

import { useState } from 'react';
import type { AgendaPublica, AbsenciaEmpresaPublic } from '@/types/empresa';

/* ── Constants ─────────────────────────── */

const DOW_FULL = ['Dilluns', 'Dimarts', 'Dimecres', 'Dijous', 'Divendres', 'Dissabte', 'Diumenge'];

const TIPUS_LABEL: Record<AbsenciaEmpresaPublic['tipus'], string> = {
  FESTA_LOCAL:   'Festa local',
  FESTA_ESTATAL: 'Festa estatal',
  PONT:          'Pont',
  ALTRE:         'Tancat',
};

const TIPUS_COLOR: Record<AbsenciaEmpresaPublic['tipus'], string> = {
  FESTA_LOCAL:   'bg-amber-50 text-amber-700 border-amber-200',
  FESTA_ESTATAL: 'bg-purple-50 text-purple-700 border-purple-200',
  PONT:          'bg-blue-50 text-blue-700 border-blue-200',
  ALTRE:         'bg-gray-50 text-gray-600 border-gray-200',
};

/* ── Helpers ───────────────────────────── */

const minsToHHMM = (mins: number) =>
  `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;

/** JS getDay() → our dow (0=Mon … 6=Sun) */
const jsDayToDow = (d: Date) => (d.getDay() + 6) % 7;

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('ca-ES', { day: 'numeric', month: 'short' });

/* ── AgendaSection ─────────────────────── */

interface AgendaSectionProps {
  agenda: AgendaPublica;
}

export function AgendaSection({ agenda }: AgendaSectionProps) {
  const [open, setOpen] = useState(false);

  const todayDow = jsDayToDow(new Date());
  const tramsByDow = Array.from({ length: 7 }, (_, i) =>
    agenda.horaris.filter(t => t.dow === i),
  );

  /* Days covered by an active or upcoming absència this week */
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  /* Absències that START today or in the future (already filtered by backend) */
  const upcomingAbsencies = agenda.absencies;

  /* Which DOWs are blocked by an absència active THIS week? */
  const blockedDows = new Set<number>();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - todayDow); // Monday of this week
  for (let d = 0; d < 7; d++) {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + d);
    const blocked = upcomingAbsencies.some(a => {
      const ini = new Date(a.inici); ini.setHours(0, 0, 0, 0);
      const fi  = new Date(a.fi);   fi.setHours(23, 59, 59, 999);
      return date >= ini && date <= fi;
    });
    if (blocked) blockedDows.add(d);
  }

  return (
    <>
      {/* Trigger row — replaces the static "Consultar agenda" text */}
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1 text-sm font-semibold transition-colors"
        style={{ color: '#7C3AED' }}
      >
        {open ? 'Tancar agenda' : 'Consultar agenda'}
        <span
          className="material-symbols-outlined transition-transform duration-200"
          style={{ fontSize: '16px', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          expand_more
        </span>
      </button>

      {/* Panel */}
      {open && (
        <div className="mt-4 rounded-xl border border-gray-200/80 bg-white overflow-hidden shadow-sm">

          {/* Weekly schedule */}
          <div className="px-4 pt-4 pb-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-gray-400 mb-3">
              Horari setmanal
            </p>

            {/* Desktop: 7-column grid — Mobile: stacked rows */}
            <div className="hidden md:grid grid-cols-7 gap-2">
              {tramsByDow.map((trams, dow) => {
                const isToday    = dow === todayDow;
                const isBlocked  = blockedDows.has(dow);
                const isClosed   = trams.length === 0 || isBlocked;

                return (
                  <div
                    key={dow}
                    className={`rounded-lg p-2.5 flex flex-col gap-1 border ${
                      isToday
                        ? 'border-violet-300 bg-violet-50'
                        : 'border-gray-100 bg-gray-50'
                    }`}
                  >
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wide ${
                        isToday ? 'text-violet-600' : 'text-gray-400'
                      }`}
                    >
                      {DOW_FULL[dow].slice(0, 2)}
                    </span>

                    {isClosed ? (
                      <span className="text-[11px] text-gray-400 italic">
                        {isBlocked ? 'Tancat' : 'Tancat'}
                      </span>
                    ) : (
                      trams.map(t => (
                        <span key={t.id} className="text-[11px] font-semibold text-gray-700 leading-tight">
                          {minsToHHMM(t.iniciMin)}–{minsToHHMM(t.fiMin)}
                        </span>
                      ))
                    )}
                  </div>
                );
              })}
            </div>

            {/* Mobile: stacked rows */}
            <div className="md:hidden flex flex-col divide-y divide-gray-100">
              {tramsByDow.map((trams, dow) => {
                const isToday   = dow === todayDow;
                const isBlocked = blockedDows.has(dow);
                const isClosed  = trams.length === 0 || isBlocked;

                return (
                  <div
                    key={dow}
                    className={`flex items-center justify-between py-2.5 ${
                      isToday ? 'text-violet-700' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {isToday && (
                        <span className="w-1.5 h-1.5 rounded-full bg-violet-500 flex-shrink-0" />
                      )}
                      <span
                        className={`text-sm font-medium w-24 ${
                          isToday ? 'text-violet-700 font-semibold' : 'text-gray-700'
                        }`}
                      >
                        {DOW_FULL[dow]}
                      </span>
                    </div>

                    {isClosed ? (
                      <span className="text-sm text-gray-400 italic">Tancat</span>
                    ) : (
                      <div className="flex flex-col items-end gap-0.5">
                        {trams.map(t => (
                          <span key={t.id} className="text-sm font-semibold text-gray-700">
                            {minsToHHMM(t.iniciMin)} – {minsToHHMM(t.fiMin)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Upcoming closures */}
          {upcomingAbsencies.length > 0 && (
            <div className="border-t border-gray-100 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-gray-400 mb-2.5">
                Tancaments especials
              </p>
              <div className="flex flex-col gap-2">
                {upcomingAbsencies.map(a => (
                  <div key={a.id} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border flex-shrink-0 ${TIPUS_COLOR[a.tipus]}`}
                      >
                        {TIPUS_LABEL[a.tipus]}
                      </span>
                      <span className="text-sm text-gray-700 truncate">{a.titol}</span>
                    </div>
                    <span className="text-xs text-gray-400 flex-shrink-0 whitespace-nowrap">
                      {a.inici.slice(0, 10) === a.fi.slice(0, 10)
                        ? formatDate(a.inici)
                        : `${formatDate(a.inici)} – ${formatDate(a.fi)}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {agenda.horaris.length === 0 && (
            <div className="px-4 pb-4 flex flex-col items-center py-6 gap-1.5">
              <span className="material-symbols-outlined text-gray-300 text-3xl">schedule</span>
              <p className="text-sm text-gray-400">Horari no configurat</p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
