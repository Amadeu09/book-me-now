'use client';

import { useEffect, useState } from 'react';
import { getDisponibilitatPublic, createReservaPublic } from '@/lib/api';
import type { Disponibilitat } from '@/types/empresa';

const DIES_SETMANA = ['Dl', 'Dt', 'Dc', 'Dj', 'Dv', 'Ds', 'Dg'];
const MESOS = [
  'Gener', 'Febrer', 'Març', 'Abril', 'Maig', 'Juny',
  'Juliol', 'Agost', 'Setembre', 'Octubre', 'Novembre', 'Desembre',
];

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

function formatDateDisplay(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

type Step = 'calendar' | 'form' | 'success' | 'conflict' | 'error';

interface FormData {
  nom: string;
  cognoms: string;
  email: string;
  telefon: string;
  observacions: string;
}

interface Props {
  treballadorId: number;
  serveiId: number;
  treballadorNom: string;
  serveiNom: string;
  onClose: () => void;
}

export function AvailabilityModal({ treballadorId, serveiId, treballadorNom, serveiNom, onClose }: Props) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [disponibilitat, setDisponibilitat] = useState<Disponibilitat | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [step, setStep] = useState<Step>('calendar');
  const [formData, setFormData] = useState<FormData>({ nom: '', cognoms: '', email: '', telefon: '', observacions: '' });
  const [formErrors, setFormErrors] = useState<Partial<FormData>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    getDisponibilitatPublic(treballadorId, serveiId)
      .then(setDisponibilitat)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [treballadorId, serveiId]);

  const availableDates = new Set(
    disponibilitat
      ? Object.entries(disponibilitat)
          .filter(([, slots]) => slots.length > 0)
          .map(([date]) => date)
      : [],
  );

  const calendarDays = buildCalendarDays(viewYear, viewMonth);

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

  function handleDayClick(date: Date) {
    const key = isoDate(date);
    if (!availableDates.has(key)) return;
    setSelectedDate(prev => prev === key ? null : key);
    setSelectedSlot(null);
  }

  const allSelectedSlots = selectedDate && disponibilitat ? disponibilitat[selectedDate] ?? [] : [];
  const selectedSlots = allSelectedSlots.reduce<string[]>((acc, slot) => {
    const hour = slot.split(':')[0];
    if (!acc.some(s => s.split(':')[0] === hour)) acc.push(slot);
    return acc;
  }, []);

  function validateForm(): boolean {
    const errors: Partial<FormData> = {};
    if (!formData.nom.trim()) errors.nom = 'Requerit';
    if (!formData.cognoms.trim()) errors.cognoms = 'Requerit';
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Email invàlid';
    if (!formData.telefon.trim()) errors.telefon = 'Requerit';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateForm() || !selectedDate || !selectedSlot) return;

    setSubmitting(true);
    try {
      await createReservaPublic({
        nom: formData.nom,
        cognoms: formData.cognoms,
        email: formData.email,
        telefon: formData.telefon,
        observacions: formData.observacions || undefined,
        data: selectedDate,
        hora: selectedSlot.split(' - ')[0],
        idServei: serveiId,
        idTreballador: treballadorId,
      });
      setStep('success');
    } catch (err: any) {
      setStep(err?.message === 'CONFLICT' ? 'conflict' : 'error');
    } finally {
      setSubmitting(false);
    }
  }

  function field(
    label: string,
    key: keyof FormData,
    type = 'text',
    required = true,
  ) {
    return (
      <div className="flex flex-col gap-1">
        <label className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">
          {label}{required && <span className="text-error ml-0.5">*</span>}
        </label>
        <input
          type={type}
          value={formData[key]}
          onChange={e => {
            setFormData(prev => ({ ...prev, [key]: e.target.value }));
            if (formErrors[key]) setFormErrors(prev => ({ ...prev, [key]: undefined }));
          }}
          className={`w-full px-3 py-2.5 rounded-xl border text-sm bg-surface-container-low outline-none transition-colors
            ${formErrors[key]
              ? 'border-error text-error focus:border-error'
              : 'border-outline-variant/30 text-on-surface focus:border-primary'}`}
        />
        {formErrors[key] && (
          <p className="text-[11px] text-error">{formErrors[key]}</p>
        )}
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget && step !== 'success') onClose(); }}
    >
      <div
        className="relative w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(24px)' }}
      >
        {/* ── Header ── */}
        <div className="px-6 pt-6 pb-4 border-b border-outline-variant/15">
          {step !== 'success' && step !== 'conflict' && step !== 'error' && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined text-on-surface-variant">close</span>
            </button>
          )}
          <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">
            {step === 'calendar' && 'Seleccionar data i hora'}
            {step === 'form' && 'Les teves dades'}
            {step === 'success' && 'Reserva confirmada'}
            {(step === 'conflict' || step === 'error') && 'No s\'ha pogut reservar'}
          </p>
          <h3 className="text-lg font-bold text-on-surface truncate">{serveiNom}</h3>
          <p className="text-sm text-on-surface-variant truncate">amb {treballadorNom}</p>
        </div>

        {/* ── STEP: Calendar ── */}
        {step === 'calendar' && (
          <>
            <div className="px-6 pt-5 pb-4">
              <div className="flex items-center justify-between mb-5">
                <button onClick={prevMonth} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors">
                  <span className="material-symbols-outlined text-on-surface-variant">chevron_left</span>
                </button>
                <span className="text-sm font-bold text-on-surface tracking-tight">
                  {MESOS[viewMonth]} {viewYear}
                </span>
                <button onClick={nextMonth} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors">
                  <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
                </button>
              </div>

              <div className="grid grid-cols-7 mb-2">
                {DIES_SETMANA.map(d => (
                  <div key={d} className="text-center text-[10px] font-bold uppercase tracking-widest text-on-surface-variant py-1">{d}</div>
                ))}
              </div>

              {loading ? (
                <div className="flex items-center justify-center h-40">
                  <span className="material-symbols-outlined animate-spin text-primary text-3xl">progress_activity</span>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center h-40 gap-2">
                  <span className="material-symbols-outlined text-error text-3xl">error</span>
                  <p className="text-sm text-on-surface-variant">Error carregant disponibilitat</p>
                </div>
              ) : (
                <div className="grid grid-cols-7 gap-y-1">
                  {calendarDays.map((date, i) => {
                    if (!date) return <div key={`empty-${i}`} />;
                    const key = isoDate(date);
                    const isAvailable = availableDates.has(key);
                    const isSelected = selectedDate === key;
                    const isPast = date < today;
                    const isToday = isoDate(date) === isoDate(today);
                    return (
                      <div key={key} className="flex flex-col items-center gap-0.5 py-0.5">
                        <button
                          onClick={() => handleDayClick(date)}
                          disabled={!isAvailable || isPast}
                          className={`relative w-9 h-9 rounded-full text-sm font-medium transition-all flex items-center justify-center
                            ${isSelected ? 'bg-primary text-white shadow-md'
                              : isAvailable && !isPast ? 'hover:bg-primary/10 text-on-surface cursor-pointer'
                              : 'text-on-surface-variant/40 cursor-default'}
                            ${isToday && !isSelected ? 'ring-1 ring-primary/40' : ''}`}
                        >
                          {date.getDate()}
                        </button>
                        {isAvailable && !isPast && (
                          <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-primary' : 'bg-primary/60'}`} />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {selectedDate && (
              <div className="px-6 pb-4 border-t border-outline-variant/15 pt-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-3">Hores disponibles</p>
                {selectedSlots.length === 0 ? (
                  <p className="text-sm text-on-surface-variant">No hi ha hores disponibles</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {selectedSlots.map(slot => (
                      <button
                        key={slot}
                        onClick={() => setSelectedSlot(prev => prev === slot ? null : slot)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                          selectedSlot === slot
                            ? 'bg-primary text-white shadow-sm'
                            : 'bg-surface-container text-on-surface hover:bg-primary/10 hover:text-primary'
                        }`}
                      >
                        {slot.split(' - ')[0]}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="px-6 pb-6">
              <button
                disabled={!selectedDate || !selectedSlot}
                onClick={() => setStep('form')}
                className="w-full py-4 bg-gradient-to-r from-primary to-primary-container text-white rounded-full font-bold tracking-tight shadow-lg hover:shadow-primary/20 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
              >
                {selectedSlot ? `Continuar amb ${selectedSlot.split(' - ')[0]}` : 'Selecciona una hora'}
              </button>
            </div>
          </>
        )}

        {/* ── STEP: Form ── */}
        {step === 'form' && (
          <form onSubmit={handleSubmit} noValidate>
            <div className="px-6 pt-5 pb-4 flex flex-col gap-4">
              {/* Resum selecció */}
              <div className="flex items-center gap-2 p-3 rounded-xl bg-primary/5 border border-primary/15">
                <span className="material-symbols-outlined text-primary text-base">event</span>
                <p className="text-sm font-semibold text-primary">
                  {formatDateDisplay(selectedDate!)} · {selectedSlot!.split(' - ')[0]}
                </p>
                <button
                  type="button"
                  onClick={() => setStep('calendar')}
                  className="ml-auto text-[11px] text-on-surface-variant underline underline-offset-2 hover:text-primary transition-colors"
                >
                  Canviar
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {field('Nom', 'nom')}
                {field('Cognoms', 'cognoms')}
              </div>
              {field('Email', 'email', 'email')}
              {field('Telèfon', 'telefon', 'tel')}
              {field('Observacions', 'observacions', 'text', false)}
            </div>

            <div className="px-6 pb-6 flex gap-3">
              <button
                type="button"
                onClick={() => setStep('calendar')}
                className="flex-1 py-3.5 rounded-full border border-outline-variant/30 text-sm font-semibold text-on-surface hover:bg-surface-container transition-colors"
              >
                Enrere
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-[2] py-3.5 bg-gradient-to-r from-primary to-primary-container text-white rounded-full font-bold tracking-tight shadow-lg hover:shadow-primary/20 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
              >
                {submitting ? 'Reservant...' : 'Confirmar reserva'}
              </button>
            </div>
          </form>
        )}

        {/* ── STEP: Success ── */}
        {step === 'success' && (
          <div className="px-6 py-10 flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <span className="material-symbols-outlined text-green-600 text-4xl">check_circle</span>
            </div>
            <div>
              <h4 className="text-xl font-bold text-on-surface mb-1">Reserva completada</h4>
              <p className="text-sm text-on-surface-variant">
                {serveiNom} · {formatDateDisplay(selectedDate!)} a les {selectedSlot!.split(' - ')[0]}
              </p>
              <p className="text-sm text-on-surface-variant mt-1">amb {treballadorNom}</p>
            </div>
            <p className="text-xs text-on-surface-variant/70 mt-2">
              Ens posarem en contacte amb tu per confirmar la cita.
            </p>
            <button
              onClick={onClose}
              className="mt-2 w-full py-4 bg-gradient-to-r from-primary to-primary-container text-white rounded-full font-bold tracking-tight shadow-lg hover:shadow-primary/20 transition-all active:scale-95"
            >
              Tancar
            </button>
          </div>
        )}

        {/* ── STEP: Conflict ── */}
        {step === 'conflict' && (
          <div className="px-6 py-10 flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
              <span className="material-symbols-outlined text-orange-500 text-4xl">event_busy</span>
            </div>
            <div>
              <h4 className="text-xl font-bold text-on-surface mb-1">Horari no disponible</h4>
              <p className="text-sm text-on-surface-variant">
                Un altre client ha reservat aquest horari moments abans. Torna a seleccionar una altra hora.
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 w-full py-4 bg-gradient-to-r from-primary to-primary-container text-white rounded-full font-bold tracking-tight shadow-lg hover:shadow-primary/20 transition-all active:scale-95"
            >
              Actualitzar disponibilitat
            </button>
          </div>
        )}

        {/* ── STEP: Error ── */}
        {step === 'error' && (
          <div className="px-6 py-10 flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
              <span className="material-symbols-outlined text-error text-4xl">error</span>
            </div>
            <div>
              <h4 className="text-xl font-bold text-on-surface mb-1">No s'ha pogut fer la reserva</h4>
              <p className="text-sm text-on-surface-variant">
                Hi ha hagut un error inesperat. Torna-ho a provar.
              </p>
            </div>
            <div className="flex gap-3 w-full mt-2">
              <button
                onClick={() => setStep('form')}
                className="flex-1 py-3.5 rounded-full border border-outline-variant/30 text-sm font-semibold text-on-surface hover:bg-surface-container transition-colors"
              >
                Tornar
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 py-3.5 bg-gradient-to-r from-primary to-primary-container text-white rounded-full font-bold tracking-tight shadow-lg transition-all active:scale-95"
              >
                Actualitzar pàgina
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
