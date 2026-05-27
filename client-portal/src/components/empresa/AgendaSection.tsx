'use client';

import { useState } from 'react';
import type { AgendaPublica, AbsenciaEmpresaPublic } from '@/types/empresa';

/* ── Constants ─────────────────────────── */

const DOW_SHORT = ['Dl', 'Dt', 'Dc', 'Dj', 'Dv', 'Ds', 'Dg'];
const DOW_FULL  = ['Dilluns', 'Dimarts', 'Dimecres', 'Dijous', 'Divendres', 'Dissabte', 'Diumenge'];

const TIPUS_LABEL: Record<AbsenciaEmpresaPublic['tipus'], string> = {
  FESTA_LOCAL:   'Festa local',
  FESTA_ESTATAL: 'Festa estatal',
  PONT:          'Pont',
  ALTRE:         'Tancat',
};

const TIPUS_COLOR: Record<AbsenciaEmpresaPublic['tipus'], string> = {
  FESTA_LOCAL:   'bg-amber-50 text-amber-700 border-amber-200',
  FESTA_ESTATAL: 'bg-indigo-50 text-indigo-600 border-indigo-200',
  PONT:          'bg-blue-50 text-blue-600 border-blue-200',
  ALTRE:         'bg-gray-100 text-gray-500 border-gray-200',
};

/* ── Helpers ───────────────────────────── */

const minsToHHMM = (mins: number) =>
  `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;

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

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const upcomingAbsencies = agenda.absencies;

  const blockedDows = new Set<number>();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - todayDow);
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
    <div>
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1 text-sm font-semibold transition-colors mb-1"
        style={{ color: '#6366F1' }}
      >
        {open ? 'Tancar agenda' : 'Consultar agenda'}
        <span
          className="material-symbols-outlined transition-transform duration-200"
          style={{ fontSize: '16px', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          expand_more
        </span>
      </button>

      {open && (
        <div className="mt-2 rounded-xl border border-gray-200/80 bg-white overflow-hidden shadow-sm">

          {/* ── Weekly schedule ── */}
          <div className="px-4 pt-4 pb-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-3">
              Horari setmanal
            </p>

            {/* Desktop: compact 7-column grid */}
            <div className="hidden md:grid grid-cols-7 gap-1.5">
              {tramsByDow.map((trams, dow) => {
                const isToday   = dow === todayDow;
                const isBlocked = blockedDows.has(dow);
                const isClosed  = trams.length === 0 || isBlocked;
                const isWeekend = dow >= 5;

                return (
                  <div
                    key={dow}
                    className={[
                      'rounded-lg flex flex-col items-center gap-1 py-2 px-1',
                      isToday
                        ? 'bg-indigo-50 ring-1 ring-indigo-200'
                        : isWeekend
                          ? 'bg-gray-50/60'
                          : 'bg-gray-50',
                    ].join(' ')}
                  >
                    {/* Day label */}
                    <span
                      className={[
                        'text-[10px] font-bold uppercase tracking-wider',
                        isToday ? 'text-indigo-600' : 'text-gray-400',
                      ].join(' ')}
                    >
                      {DOW_SHORT[dow]}
                    </span>

                    {/* Divider */}
                    <div className={`w-4 h-px ${isToday ? 'bg-indigo-200' : 'bg-gray-200'}`} />

                    {/* Times or closed */}
                    {isClosed ? (
                      <span className="text-[10px] text-gray-300 font-medium">—</span>
                    ) : (
                      <div className="flex flex-col items-center gap-0.5">
                        {trams.map(tr => (
                          <span
                            key={tr.id}
                            className={[
                              'text-[10px] font-semibold leading-snug tabular-nums',
                              isToday ? 'text-indigo-700' : 'text-gray-600',
                            ].join(' ')}
                          >
                            {minsToHHMM(tr.iniciMin)}
                            <br />
                            {minsToHHMM(tr.fiMin)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Mobile: stacked rows */}
            <div className="md:hidden flex flex-col">
              {tramsByDow.map((trams, dow) => {
                const isToday   = dow === todayDow;
                const isBlocked = blockedDows.has(dow);
                const isClosed  = trams.length === 0 || isBlocked;

                return (
                  <div
                    key={dow}
                    className={[
                      'flex items-center justify-between py-2 px-1',
                      dow < 6 ? 'border-b border-gray-100' : '',
                      isToday ? 'rounded-md bg-indigo-50/60' : '',
                    ].join(' ')}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={[
                          'w-6 text-[11px] font-bold uppercase',
                          isToday ? 'text-indigo-600' : 'text-gray-400',
                        ].join(' ')}
                      >
                        {DOW_SHORT[dow]}
                      </span>
                      <span
                        className={[
                          'text-sm',
                          isToday ? 'text-indigo-700 font-semibold' : 'text-gray-600 font-medium',
                        ].join(' ')}
                      >
                        {DOW_FULL[dow]}
                      </span>
                    </div>

                    {isClosed ? (
                      <span className="text-xs text-gray-300 font-medium">Tancat</span>
                    ) : (
                      <div className="flex flex-col items-end gap-0.5">
                        {trams.map(tr => (
                          <span
                            key={tr.id}
                            className={[
                              'text-sm font-semibold tabular-nums',
                              isToday ? 'text-indigo-700' : 'text-gray-700',
                            ].join(' ')}
                          >
                            {minsToHHMM(tr.iniciMin)} – {minsToHHMM(tr.fiMin)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Special closures ── */}
          {upcomingAbsencies.length > 0 && (
            <div className="border-t border-gray-100 px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2.5">
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
                      <span className="text-sm text-gray-600 truncate">{a.titol}</span>
                    </div>
                    <span className="text-xs text-gray-400 flex-shrink-0 whitespace-nowrap tabular-nums">
                      {a.inici.slice(0, 10) === a.fi.slice(0, 10)
                        ? formatDate(a.inici)
                        : `${formatDate(a.inici)} – ${formatDate(a.fi)}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Empty state ── */}
          {agenda.horaris.length === 0 && (
            <div className="px-4 py-6 flex flex-col items-center gap-1.5">
              <span className="material-symbols-outlined text-gray-300 text-3xl">schedule</span>
              <p className="text-sm text-gray-400">Horari no configurat</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
