'use client';

import { useState } from 'react';
import { cancellarReservaByToken, modificarReservaByToken, getDisponibilitatPublic } from '@/lib/api';
import type { ReservaGestio, Disponibilitat } from '@/types/empresa';

const DIES_SETMANA = ['Dl', 'Dt', 'Dc', 'Dj', 'Dv', 'Ds', 'Dg'];
const MESOS = ['Gener', 'Febrer', 'Març', 'Abril', 'Maig', 'Juny', 'Juliol', 'Agost', 'Setembre', 'Octubre', 'Novembre', 'Desembre'];

function isoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function buildCalendarDays(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDow = (firstDay.getDay() + 6) % 7;
  const days: (Date | null)[] = [];
  for (let i = 0; i < startDow; i++) days.push(null);
  for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(year, month, d));
  while (days.length % 7 !== 0) days.push(null);
  return days;
}

function formatDataHora(iso: string): { data: string; hora: string } {
  const date = new Date(iso);
  const data = date.toLocaleDateString('ca-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const hora = date.toLocaleTimeString('ca-ES', { hour: '2-digit', minute: '2-digit' });
  return { data, hora };
}

const CARD = 'bg-white rounded-2xl border border-gray-200/60 p-5 shadow-sm';
const LABEL = 'text-[11px] font-bold uppercase tracking-[0.06em] text-gray-400 mb-3';

interface Props {
  reserva: ReservaGestio;
  token: string;
}

type View = 'detall' | 'cancellar-confirm' | 'modificar-calendar' | 'modificar-confirm' | 'cancel·lada' | 'modificada' | 'error';

export function GestioReservaClient({ reserva, token }: Props) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const esPasada = new Date(reserva.dataHora) < new Date();
  const esCancellada = reserva.estat === 'CANCELLADA';

  const [view, setView] = useState<View>('detall');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Calendari de modificació
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [disponibilitat, setDisponibilitat] = useState<Disponibilitat | null>(null);
  const [loadingCal, setLoadingCal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const { data: dataActual, hora: horaActual } = formatDataHora(reserva.dataHora);
  const initial = reserva.empresa.nom.charAt(0).toUpperCase();
  const tInitial = reserva.treballador?.nom.charAt(0).toUpperCase() ?? '?';

  async function handleCancellar() {
    setLoading(true);
    try {
      await cancellarReservaByToken(token);
      setView('cancel·lada');
    } catch {
      setErrorMsg('No s\'ha pogut cancel·lar la reserva. Torna-ho a provar.');
      setView('error');
    } finally {
      setLoading(false);
    }
  }

  async function openModificar() {
    if (!reserva.treballador) return;
    setLoadingCal(true);
    setView('modificar-calendar');
    try {
      const disp = await getDisponibilitatPublic(reserva.treballador.id, reserva.servei.id);
      setDisponibilitat(disp);
    } catch {
      setErrorMsg('No s\'ha pogut carregar la disponibilitat.');
      setView('error');
    } finally {
      setLoadingCal(false);
    }
  }

  async function handleModificar() {
    if (!selectedDate || !selectedSlot) return;
    setLoading(true);
    try {
      await modificarReservaByToken(token, selectedDate, selectedSlot.split(' - ')[0]);
      setView('modificada');
    } catch (err: any) {
      if (err?.message === 'CONFLICT') {
        setErrorMsg('Aquest horari ja no està disponible. Torna a seleccionar una altra hora.');
      } else {
        setErrorMsg('No s\'ha pogut modificar la reserva. Torna-ho a provar.');
      }
      setView('error');
    } finally {
      setLoading(false);
    }
  }

  const calendarDays = buildCalendarDays(viewYear, viewMonth);
  const availableDates = new Set(
    disponibilitat ? Object.entries(disponibilitat).filter(([, s]) => s.length > 0).map(([d]) => d) : []
  );
  const selectedSlots = selectedDate && disponibilitat ? disponibilitat[selectedDate] ?? [] : [];

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
    setSelectedDate(null); setSelectedSlot(null);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
    setSelectedDate(null); setSelectedSlot(null);
  }

  return (
    <main className="min-h-screen" style={{ background: '#F7F7F8' }}>

      {/* ── Header empresa ── */}
      <div className="w-full" style={{ background: 'linear-gradient(135deg, #3B0764 0%, #1F2937 100%)', padding: '32px 0 48px' }}>
        <div className="max-w-lg mx-auto px-6 flex items-center gap-4">
          {reserva.empresa.fotoPerfil ? (
            <img src={reserva.empresa.fotoPerfil} alt={reserva.empresa.nom} className="w-14 h-14 rounded-full object-cover border-2 border-white/30" />
          ) : (
            <div className="w-14 h-14 rounded-full flex items-center justify-center border-2 border-white/30" style={{ background: 'rgba(124,58,237,0.4)' }}>
              <span className="text-xl font-bold text-white">{initial}</span>
            </div>
          )}
          <div>
            <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-0.5">Gestió de cita</p>
            <h1 className="text-white text-xl font-bold">{reserva.empresa.nom}</h1>
            {reserva.empresa.ubicacio && (
              <p className="text-white/60 text-xs mt-0.5 flex items-center gap-1">
                <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>location_on</span>
                {reserva.empresa.ubicacio}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-6 -mt-6 pb-16 space-y-4">

        {/* ── ESTAT: Cancel·lada ── */}
        {esCancellada && view !== 'cancel·lada' && (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-start gap-3">
            <span className="material-symbols-outlined text-orange-500 mt-0.5">event_busy</span>
            <div>
              <p className="font-semibold text-orange-800 text-sm">Reserva cancel·lada</p>
              <p className="text-orange-700 text-xs mt-0.5">Aquesta cita ja ha estat cancel·lada.</p>
            </div>
          </div>
        )}

        {/* ── ESTAT: Cita passada ── */}
        {esPasada && !esCancellada && view === 'detall' && (
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex items-start gap-3">
            <span className="material-symbols-outlined text-gray-400 mt-0.5">history</span>
            <div>
              <p className="font-semibold text-gray-700 text-sm">Cita finalitzada</p>
              <p className="text-gray-500 text-xs mt-0.5">Aquesta cita ja ha passat i no es pot modificar.</p>
            </div>
          </div>
        )}

        {/* ── VIEW: Detall ── */}
        {view === 'detall' && (
          <>
            {/* Card detalls cita */}
            <div className={CARD}>
              <p className={LABEL}>Detalls de la cita</p>
              <div className="space-y-3">
                <div className="flex items-start gap-3 pb-3 border-b border-gray-100">
                  <span className="material-symbols-outlined text-purple-600 mt-0.5">medical_services</span>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{reserva.servei.nom}</p>
                    <p className="text-gray-400 text-xs">{reserva.servei.duradaMin} min · {Number(reserva.servei.preu).toFixed(2)} €</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 pb-3 border-b border-gray-100">
                  <span className="material-symbols-outlined text-purple-600 mt-0.5">calendar_today</span>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm capitalize">{dataActual}</p>
                    <p className="text-gray-400 text-xs">a les {horaActual}</p>
                  </div>
                </div>

                {reserva.treballador && (
                  <div className="flex items-center gap-3">
                    <div>
                      {reserva.treballador.Usuari.fotoPerfil ? (
                        <img src={reserva.treballador.Usuari.fotoPerfil} alt={reserva.treballador.nom} className="w-8 h-8 rounded-full object-cover border border-gray-100" />
                      ) : (
                        <div className="w-8 h-8 rounded-full flex items-center justify-center border border-gray-100" style={{ background: '#EDE9FE' }}>
                          <span className="text-xs font-bold" style={{ color: '#6D28D9' }}>{tInitial}</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{reserva.treballador.nom}</p>
                      <p className="text-gray-400 text-xs">Professional</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Card estat */}
            <div className={CARD}>
              <p className={LABEL}>Estat</p>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${
                  reserva.estat === 'CONFIRMADA' ? 'bg-green-500' :
                  reserva.estat === 'CANCELLADA' ? 'bg-orange-400' :
                  reserva.estat === 'FINALITZADA' ? 'bg-gray-400' : 'bg-yellow-400'
                }`} />
                <span className="text-sm font-semibold text-gray-700 capitalize">{reserva.estat.toLowerCase()}</span>
              </div>
            </div>

            {/* Botons d'acció */}
            {!esCancellada && !esPasada && (
              <div className="space-y-3 pt-1">
                <button
                  onClick={openModificar}
                  className="w-full py-4 rounded-full font-bold text-sm tracking-tight shadow-lg transition-all active:scale-95"
                  style={{ background: 'linear-gradient(135deg, #7C3AED, #4C1D95)', color: 'white' }}
                >
                  Modificar cita
                </button>
                <button
                  onClick={() => setView('cancellar-confirm')}
                  className="w-full py-4 rounded-full font-bold text-sm tracking-tight border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                >
                  Cancel·lar cita
                </button>
              </div>
            )}
          </>
        )}

        {/* ── VIEW: Confirmar cancel·lació ── */}
        {view === 'cancellar-confirm' && (
          <div className={CARD}>
            <div className="flex flex-col items-center text-center gap-4 py-4">
              <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-red-500 text-3xl">event_busy</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800 mb-1">Cancel·lar la cita?</h2>
                <p className="text-gray-500 text-sm">
                  Estàs segur que vols cancel·lar la cita de <strong>{reserva.servei.nom}</strong> del <span className="capitalize">{dataActual}</span> a les {horaActual}?
                </p>
                <p className="text-gray-400 text-xs mt-2">Aquesta acció no es pot desfer.</p>
              </div>
              <div className="flex gap-3 w-full mt-2">
                <button
                  onClick={() => setView('detall')}
                  disabled={loading}
                  className="flex-1 py-3.5 rounded-full border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Tornar
                </button>
                <button
                  onClick={handleCancellar}
                  disabled={loading}
                  className="flex-1 py-3.5 rounded-full bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-colors active:scale-95 disabled:opacity-60"
                >
                  {loading ? 'Cancel·lant...' : 'Sí, cancel·lar'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── VIEW: Calendari de modificació ── */}
        {view === 'modificar-calendar' && (
          <div className={CARD}>
            <p className={LABEL}>Selecciona la nova data i hora</p>

            <div className="flex items-center justify-between mb-5">
              <button onClick={prevMonth} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
                <span className="material-symbols-outlined text-gray-500">chevron_left</span>
              </button>
              <span className="text-sm font-bold text-gray-800">{MESOS[viewMonth]} {viewYear}</span>
              <button onClick={nextMonth} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
                <span className="material-symbols-outlined text-gray-500">chevron_right</span>
              </button>
            </div>

            <div className="grid grid-cols-7 mb-2">
              {DIES_SETMANA.map(d => (
                <div key={d} className="text-center text-[10px] font-bold uppercase tracking-widest text-gray-400 py-1">{d}</div>
              ))}
            </div>

            {loadingCal ? (
              <div className="flex items-center justify-center h-40">
                <span className="material-symbols-outlined text-purple-600 text-3xl" style={{ animation: 'spin 1s linear infinite' }}>progress_activity</span>
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-y-1">
                {calendarDays.map((date, i) => {
                  if (!date) return <div key={`e-${i}`} />;
                  const key = isoDate(date);
                  const isAvailable = availableDates.has(key);
                  const isSelected = selectedDate === key;
                  const isPast = date < today;
                  const isToday = key === isoDate(today);
                  return (
                    <div key={key} className="flex flex-col items-center gap-0.5 py-0.5">
                      <button
                        onClick={() => { if (isAvailable && !isPast) { setSelectedDate(prev => prev === key ? null : key); setSelectedSlot(null); } }}
                        disabled={!isAvailable || isPast}
                        className={`w-9 h-9 rounded-full text-sm font-medium transition-all flex items-center justify-center
                          ${isSelected ? 'text-white shadow-md' : ''}
                          ${isAvailable && !isPast && !isSelected ? 'hover:bg-purple-50 text-gray-800 cursor-pointer' : ''}
                          ${!isAvailable || isPast ? 'text-gray-300 cursor-default' : ''}
                          ${isToday && !isSelected ? 'ring-1 ring-purple-400' : ''}`}
                        style={isSelected ? { background: 'linear-gradient(135deg, #7C3AED, #4C1D95)' } : {}}
                      >
                        {date.getDate()}
                      </button>
                      {isAvailable && !isPast && (
                        <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-purple-600' : 'bg-purple-400'}`} />
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {selectedDate && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Hores disponibles</p>
                {selectedSlots.length === 0 ? (
                  <p className="text-sm text-gray-400">No hi ha hores disponibles</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {selectedSlots.map(slot => (
                      <button
                        key={slot}
                        onClick={() => setSelectedSlot(prev => prev === slot ? null : slot)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                          selectedSlot === slot
                            ? 'text-white shadow-sm'
                            : 'bg-gray-100 text-gray-700 hover:bg-purple-50 hover:text-purple-700'
                        }`}
                        style={selectedSlot === slot ? { background: 'linear-gradient(135deg, #7C3AED, #4C1D95)' } : {}}
                      >
                        {slot.split(' - ')[0]}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setView('detall')}
                className="flex-1 py-3.5 rounded-full border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Tornar
              </button>
              <button
                disabled={!selectedDate || !selectedSlot}
                onClick={() => setView('modificar-confirm')}
                className="flex-[2] py-3.5 rounded-full font-bold text-sm text-white transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg, #7C3AED, #4C1D95)' }}
              >
                {selectedSlot ? `Continuar amb ${selectedSlot.split(' - ')[0]}` : 'Selecciona una hora'}
              </button>
            </div>
          </div>
        )}

        {/* ── VIEW: Confirmar modificació ── */}
        {view === 'modificar-confirm' && selectedDate && selectedSlot && (
          <div className={CARD}>
            <div className="flex flex-col items-center text-center gap-4 py-4">
              <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: '#EDE9FE' }}>
                <span className="material-symbols-outlined text-3xl" style={{ color: '#7C3AED' }}>edit_calendar</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800 mb-1">Confirmar canvi</h2>
                <p className="text-gray-500 text-sm mb-3">La teva cita passarà a ser:</p>
                <div className="bg-purple-50 border border-purple-100 rounded-xl p-3 text-left">
                  <p className="text-sm font-semibold text-purple-800 capitalize">
                    {new Date(`${selectedDate}T00:00:00`).toLocaleDateString('ca-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                  <p className="text-purple-600 text-sm">a les {selectedSlot.split(' - ')[0]}</p>
                </div>
              </div>
              <div className="flex gap-3 w-full mt-2">
                <button
                  onClick={() => setView('modificar-calendar')}
                  disabled={loading}
                  className="flex-1 py-3.5 rounded-full border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Tornar
                </button>
                <button
                  onClick={handleModificar}
                  disabled={loading}
                  className="flex-[2] py-3.5 rounded-full font-bold text-sm text-white transition-all active:scale-95 disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #7C3AED, #4C1D95)' }}
                >
                  {loading ? 'Guardant...' : 'Confirmar canvi'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── VIEW: Cancel·lació confirmada ── */}
        {view === 'cancel·lada' && (
          <div className={CARD}>
            <div className="flex flex-col items-center text-center gap-4 py-6">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-green-600 text-4xl">check_circle</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-1">Cita cancel·lada</h2>
                <p className="text-gray-500 text-sm">La teva cita ha estat cancel·lada correctament.</p>
              </div>
            </div>
          </div>
        )}

        {/* ── VIEW: Modificació confirmada ── */}
        {view === 'modificada' && selectedDate && selectedSlot && (
          <div className={CARD}>
            <div className="flex flex-col items-center text-center gap-4 py-6">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-green-600 text-4xl">check_circle</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-1">Cita modificada</h2>
                <p className="text-gray-500 text-sm">La teva cita s'ha canviat correctament a:</p>
                <div className="bg-green-50 border border-green-100 rounded-xl p-3 mt-3 text-left">
                  <p className="text-sm font-semibold text-green-800 capitalize">
                    {new Date(`${selectedDate}T00:00:00`).toLocaleDateString('ca-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                  <p className="text-green-600 text-sm">a les {selectedSlot.split(' - ')[0]}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── VIEW: Error ── */}
        {view === 'error' && (
          <div className={CARD}>
            <div className="flex flex-col items-center text-center gap-4 py-6">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-red-500 text-4xl">error</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-1">S'ha produït un error</h2>
                <p className="text-gray-500 text-sm">{errorMsg}</p>
              </div>
              <button
                onClick={() => setView('detall')}
                className="w-full py-4 rounded-full font-bold text-sm text-white transition-all active:scale-95"
                style={{ background: 'linear-gradient(135deg, #7C3AED, #4C1D95)' }}
              >
                Tornar
              </button>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
