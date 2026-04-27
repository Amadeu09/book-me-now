'use client';

import { useState } from 'react';
import type { Empresa, ServeiPublic, TreballadorPublic } from '@/types/empresa';
import { AvailabilityModal } from './AvailabilityModal';

function formatDurada(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

function ServeiCard({
  servei,
  selected,
  onSelect,
}: {
  servei: ServeiPublic;
  selected: boolean;
  onSelect: () => void;
}) {
  const initial = servei.nom.charAt(0).toUpperCase();
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
        selected
          ? 'border-primary bg-primary/5 shadow-sm'
          : 'border-outline-variant/20 bg-surface-container-low hover:border-outline-variant/40 hover:bg-surface-container'
      }`}
    >
      <div className="shrink-0 w-11 h-11 rounded-lg overflow-hidden">
        {servei.fotoUrl ? (
          <img src={servei.fotoUrl} alt={servei.nom} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-primary-fixed flex items-center justify-center">
            <span className="text-base font-bold text-on-primary-fixed-variant">{initial}</span>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`font-semibold text-sm truncate ${selected ? 'text-primary' : 'text-on-surface'}`}>
          {servei.nom}
        </p>
        <p className="text-xs text-on-surface-variant mt-0.5">
          {formatDurada(servei.duradaMin)} · {Number(servei.preu).toFixed(2)} €
        </p>
      </div>
      {/* Radio indicator */}
      <div className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
        selected ? 'border-primary bg-primary' : 'border-outline-variant/50'
      }`}>
        {selected && <div className="w-2 h-2 rounded-full bg-white" />}
      </div>
    </button>
  );
}

export const QUALSEVOL_ID = -1;

function TreballadorCard({
  treballador,
  selected,
  onSelect,
}: {
  treballador: TreballadorPublic;
  selected: boolean;
  onSelect: () => void;
}) {
  const initial = treballador.nom.charAt(0).toUpperCase();
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all text-left ${
        selected
          ? 'border-primary bg-primary/5 shadow-sm'
          : 'border-outline-variant/20 bg-surface-container-low hover:border-primary/30 hover:bg-primary/[0.03]'
      }`}
    >
      <div className="shrink-0 w-11 h-11 rounded-full overflow-hidden">
        {treballador.Usuari.fotoPerfil ? (
          <img src={treballador.Usuari.fotoPerfil} alt={treballador.nom} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-secondary-fixed flex items-center justify-center">
            <span className="text-base font-bold text-on-secondary-fixed">{initial}</span>
          </div>
        )}
      </div>
      <p className={`flex-1 font-semibold text-sm truncate ${selected ? 'text-primary' : 'text-on-surface'}`}>
        {treballador.nom}
      </p>
      <div className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
        selected ? 'border-primary bg-primary' : 'border-outline-variant/50'
      }`}>
        {selected && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
      </div>
    </button>
  );
}

function QualsevolCard({ selected, onSelect }: { selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all text-left ${
        selected
          ? 'border-primary bg-primary/5 shadow-sm'
          : 'border-outline-variant/20 bg-surface-container-low hover:border-primary/30 hover:bg-primary/[0.03]'
      }`}
    >
      <div className="shrink-0 w-11 h-11 rounded-full bg-secondary-fixed flex items-center justify-center">
        <span className="material-symbols-outlined text-on-secondary-fixed" style={{ fontSize: '22px' }}>shuffle</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className={`font-semibold text-sm ${selected ? 'text-primary' : 'text-on-surface'}`}>
          Qualsevol professional
        </p>
        <p className="text-xs text-on-surface-variant mt-0.5">Assignació aleatòria disponible</p>
      </div>
      <div className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
        selected ? 'border-primary bg-primary' : 'border-outline-variant/50'
      }`}>
        {selected && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
      </div>
    </button>
  );
}

export function BookingWidget({
  empresa,
  serveis,
  initialServeiId,
  onClose,
}: {
  empresa: Empresa;
  serveis: ServeiPublic[];
  initialServeiId?: number;
  onClose?: () => void;
}) {
  const [selectedServeiId, setSelectedServeiId] = useState<number | null>(initialServeiId ?? null);
  const [selectedTreballadorId, setSelectedTreballadorId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const isPopup = initialServeiId !== undefined;
  const selectedServei = serveis.find((s) => s.id === selectedServeiId) ?? null;
  const treballadors = selectedServei?.treballadors.map((t) => t.treballador) ?? [];
  const canProceed = selectedServeiId !== null && selectedTreballadorId !== null;

  function handleSelectServei(id: number) {
    if (selectedServeiId === id) {
      setSelectedServeiId(null);
      setSelectedTreballadorId(null);
    } else {
      setSelectedServeiId(id);
      setSelectedTreballadorId(null);
    }
  }

  return (
    <div
      className="flex flex-col rounded-2xl border border-white/30 w-full max-w-md"
      style={{
        background: 'rgba(255,255,255,0.98)',
        boxShadow: '0 24px 64px rgba(0,0,0,0.20), 0 4px 16px rgba(0,0,0,0.08)',
        maxHeight: '90vh',
      }}
    >
      {/* ── Header (non-scrolling) ── */}
      <div className="flex items-center justify-between px-6 pt-5 pb-4 shrink-0 border-b border-outline-variant/10">
        <div>
          <h3 className="text-lg font-bold tracking-tight text-on-surface leading-tight">
            Reserva Concierge
          </h3>
          {isPopup && (
            <p className="text-xs text-on-surface-variant mt-0.5">{empresa.nom}</p>
          )}
        </div>
        {isPopup && onClose ? (
          <button
            onClick={onClose}
            className="shrink-0 ml-3 w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors"
            aria-label="Tancar"
          >
            <span className="material-symbols-outlined text-xl text-on-surface-variant">close</span>
          </button>
        ) : (
          <div className="shrink-0 bg-secondary-fixed text-on-secondary-fixed px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
            Disponible
          </div>
        )}
      </div>

      {/* ── Scrollable body ── */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 min-h-0">

        {/* Servei preseleccionat (popup) o selector (mode normal) */}
        {isPopup && selectedServei ? (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">
              Servei
            </p>
            <div className="flex items-center gap-3 px-3 py-2.5 bg-primary/5 border border-primary/20 rounded-xl">
              {selectedServei.fotoUrl ? (
                <img
                  src={selectedServei.fotoUrl}
                  alt={selectedServei.nom}
                  className="shrink-0 w-9 h-9 rounded-lg object-cover"
                />
              ) : (
                <div className="shrink-0 w-9 h-9 rounded-lg bg-primary-fixed flex items-center justify-center">
                  <span className="text-sm font-bold text-on-primary-fixed-variant">
                    {selectedServei.nom.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="min-w-0">
                <p className="font-semibold text-sm text-primary truncate">{selectedServei.nom}</p>
                <p className="text-xs text-on-surface-variant">
                  {formatDurada(selectedServei.duradaMin)} · {Number(selectedServei.preu).toFixed(2)} €
                </p>
              </div>
            </div>
          </div>
        ) : !isPopup && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-3">
              Seleccionar Servei
            </p>
            {serveis.length === 0 ? (
              <p className="text-sm text-on-surface-variant">No hi ha serveis disponibles</p>
            ) : (
              <div className="space-y-2">
                {serveis.map((servei) => (
                  <ServeiCard
                    key={servei.id}
                    servei={servei}
                    selected={selectedServeiId === servei.id}
                    onSelect={() => handleSelectServei(servei.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Selector professional */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-3">
            Seleccionar Professional
          </p>
          {!selectedServei ? (
            <p className="text-sm text-on-surface-variant">
              Disponible un cop seleccionat el servei
            </p>
          ) : treballadors.length === 0 ? (
            <p className="text-sm text-on-surface-variant">
              No hi ha professionals assignats a aquest servei
            </p>
          ) : (
            <div className="space-y-2">
              <QualsevolCard
                selected={selectedTreballadorId === QUALSEVOL_ID}
                onSelect={() => setSelectedTreballadorId(selectedTreballadorId === QUALSEVOL_ID ? null : QUALSEVOL_ID)}
              />
              {treballadors.map((t) => (
                <TreballadorCard
                  key={t.id}
                  treballador={t}
                  selected={selectedTreballadorId === t.id}
                  onSelect={() =>
                    setSelectedTreballadorId(selectedTreballadorId === t.id ? null : t.id)
                  }
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Footer with CTA — always visible ── */}
      <div className="shrink-0 px-6 pb-5 pt-3 border-t border-outline-variant/10">
        <button
          disabled={!canProceed}
          onClick={() => setModalOpen(true)}
          className={`w-full py-4 rounded-full font-bold text-sm tracking-tight transition-all ${
            canProceed
              ? 'bg-gradient-to-r from-primary to-primary-container text-white shadow-lg hover:opacity-90 active:scale-[0.98] cursor-pointer'
              : 'bg-surface-container text-on-surface-variant cursor-not-allowed'
          }`}
        >
          {canProceed ? 'Sol·licitar Cita' : 'Selecciona un professional'}
        </button>
      </div>

      {modalOpen && selectedServeiId && selectedTreballadorId !== null && (
        <AvailabilityModal
          treballadorId={selectedTreballadorId}
          allTreballadors={selectedTreballadorId === QUALSEVOL_ID ? treballadors : undefined}
          serveiId={selectedServeiId}
          treballadorNom={
            selectedTreballadorId === QUALSEVOL_ID
              ? 'Qualsevol professional'
              : treballadors.find((t) => t.id === selectedTreballadorId)?.nom ?? ''
          }
          serveiNom={selectedServei?.nom ?? ''}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
