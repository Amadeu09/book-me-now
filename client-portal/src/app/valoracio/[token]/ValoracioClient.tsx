'use client';

import { useState } from 'react';
import { createValoracioByToken } from '@/lib/api';
import type { ReservaValoracioInfo } from '@/types/empresa';

const CARD = 'bg-white rounded-2xl border border-gray-200/60 p-5 shadow-sm';
const LABEL = 'text-[11px] font-bold uppercase tracking-[0.06em] text-gray-400 mb-3';

interface Props {
  info: ReservaValoracioInfo;
  token: string;
}

function StarRating({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (v: number) => void;
  disabled: boolean;
}) {
  const [hovered, setHovered] = useState<number | null>(null);

  const display = hovered ?? value;

  return (
    <div className="flex gap-1" onMouseLeave={() => setHovered(null)}>
      {[1, 2, 3, 4, 5].map((star) => {
        const fullFill = display >= star;
        const halfFill = !fullFill && display >= star - 0.5;
        return (
          <div key={star} className="relative w-9 h-9 cursor-pointer select-none" style={{ cursor: disabled ? 'default' : 'pointer' }}>
            {/* Left half — X - 0.5 */}
            <div
              className="absolute left-0 top-0 w-1/2 h-full z-10"
              onMouseEnter={() => !disabled && setHovered(star - 0.5)}
              onClick={() => !disabled && onChange(star - 0.5)}
            />
            {/* Right half — X */}
            <div
              className="absolute right-0 top-0 w-1/2 h-full z-10"
              onMouseEnter={() => !disabled && setHovered(star)}
              onClick={() => !disabled && onChange(star)}
            />
            {/* Star SVG */}
            <svg viewBox="0 0 24 24" className="w-9 h-9 absolute inset-0" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id={`half-${star}`} x1="0" x2="1" y1="0" y2="0">
                  <stop offset="50%" stopColor={halfFill ? '#F59E0B' : (fullFill ? '#F59E0B' : '#E5E7EB')} />
                  <stop offset="50%" stopColor={fullFill ? '#F59E0B' : '#E5E7EB'} />
                </linearGradient>
              </defs>
              <path
                d="M12 2l2.9 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l7.1-1.01L12 2z"
                fill={halfFill ? `url(#half-${star})` : fullFill ? '#F59E0B' : '#E5E7EB'}
              />
            </svg>
          </div>
        );
      })}
      {display > 0 && (
        <span className="ml-1 text-sm font-bold text-amber-500 self-center">{display}</span>
      )}
    </div>
  );
}

export function ValoracioClient({ info, token }: Props) {
  const [puntuacioEmpresa, setPuntuacioEmpresa] = useState(0);
  const [comentariEmpresa, setComentariEmpresa] = useState('');
  const [puntuacioTreballador, setPuntuacioTreballador] = useState(0);
  const [comentariTreballador, setComentariTreballador] = useState('');
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'form' | 'success' | 'error'>(
    info.jaValorada ? 'success' : 'form'
  );
  const [errorMsg, setErrorMsg] = useState('');

  const teTreballador = info.treballador !== null;

  const dataFormatada = new Date(info.dataHora).toLocaleDateString('ca-ES', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
  const horaFormatada = new Date(info.dataHora).toLocaleTimeString('ca-ES', {
    hour: '2-digit', minute: '2-digit',
  });

  const empresaInitial = info.empresa.nom.charAt(0).toUpperCase();
  const treballadorInitial = info.treballador?.nom.charAt(0).toUpperCase() ?? '?';

  const canSubmit =
    puntuacioEmpresa > 0 &&
    comentariEmpresa.trim().length > 0 &&
    (!teTreballador || (puntuacioTreballador > 0 && comentariTreballador.trim().length > 0));

  async function handleSubmit() {
    if (!canSubmit) return;
    setLoading(true);
    try {
      await createValoracioByToken(token, {
        puntuacioEmpresa,
        comentariEmpresa: comentariEmpresa.trim(),
        ...(teTreballador && {
          puntuacioTreballador,
          comentariTreballador: comentariTreballador.trim(),
        }),
      });
      setView('success');
    } catch (err: any) {
      if (err?.message === 'JA_VALORADA') {
        setView('success');
      } else {
        setErrorMsg('No s\'ha pogut enviar la valoració. Torna-ho a provar.');
        setView('error');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen" style={{ background: '#F7F7F8' }}>
      {/* Header */}
      <div className="w-full" style={{ background: 'linear-gradient(135deg, #CC2222 0%, #1F2937 100%)', padding: '32px 0 48px' }}>
        <div className="max-w-lg mx-auto px-6 flex items-center gap-4">
          {info.empresa.fotoPerfil ? (
            <img src={info.empresa.fotoPerfil} alt={info.empresa.nom} className="w-14 h-14 rounded-full object-cover border-2 border-white/30" />
          ) : (
            <div className="w-14 h-14 rounded-full flex items-center justify-center border-2 border-white/30" style={{ background: 'rgba(99,102,241,0.4)' }}>
              <span className="text-xl font-bold text-white">{empresaInitial}</span>
            </div>
          )}
          <div>
            <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-0.5">Valoració de cita</p>
            <h1 className="text-white text-xl font-bold">{info.empresa.nom}</h1>
            <p className="text-white/60 text-xs mt-0.5 capitalize">{dataFormatada} · {horaFormatada}</p>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-6 -mt-6 pb-16 space-y-4">

        {/* SUCCESS */}
        {view === 'success' && (
          <div className={CARD}>
            <div className="flex flex-col items-center text-center gap-4 py-6">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-green-600 text-4xl">check_circle</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-1">
                  {info.jaValorada ? 'Ja has valorat aquesta cita' : 'Gràcies per la teva valoració!'}
                </h2>
                <p className="text-gray-500 text-sm">
                  {info.jaValorada
                    ? 'La teva opinió ja ha estat registrada anteriorment.'
                    : 'La teva opinió ens ajuda a millorar el servei i a altres clients a triar-nos.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ERROR */}
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
                onClick={() => setView('form')}
                className="w-full py-4 rounded-full font-bold text-sm text-white transition-all active:scale-95"
                style={{ background: 'linear-gradient(135deg, #6366F1, #4338CA)' }}
              >
                Tornar
              </button>
            </div>
          </div>
        )}

        {/* FORM */}
        {view === 'form' && (
          <>
            {/* Bloc empresa */}
            <div className={CARD}>
              <p className={LABEL}>Valoració de l'establiment</p>
              <div className="flex items-center gap-3 mb-4">
                {info.empresa.fotoPerfil ? (
                  <img src={info.empresa.fotoPerfil} alt={info.empresa.nom} className="w-10 h-10 rounded-full object-cover border border-gray-100" />
                ) : (
                  <div className="w-10 h-10 rounded-full flex items-center justify-center border border-gray-100" style={{ background: '#FFE8E8' }}>
                    <span className="text-sm font-bold" style={{ color: '#6366F1' }}>{empresaInitial}</span>
                  </div>
                )}
                <p className="font-semibold text-gray-800">{info.empresa.nom}</p>
              </div>

              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">Puntuació</p>
                <StarRating value={puntuacioEmpresa} onChange={setPuntuacioEmpresa} disabled={false} />
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-2">Comentari <span className="text-red-400">*</span></p>
                <textarea
                  value={comentariEmpresa}
                  onChange={(e) => setComentariEmpresa(e.target.value)}
                  placeholder="Com ha estat la teva experiència a l'establiment?"
                  rows={3}
                  className="w-full rounded-xl border border-gray-200 p-3 text-sm text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
                />
              </div>
            </div>

            {/* Bloc treballador */}
            {teTreballador && (
              <div className={CARD}>
                <p className={LABEL}>Valoració del professional</p>
                <div className="flex items-center gap-3 mb-4">
                  {info.treballador!.fotoPerfil ? (
                    <img src={info.treballador!.fotoPerfil} alt={info.treballador!.nom} className="w-10 h-10 rounded-full object-cover border border-gray-100" />
                  ) : (
                    <div className="w-10 h-10 rounded-full flex items-center justify-center border border-gray-100" style={{ background: '#FFE8E8' }}>
                      <span className="text-sm font-bold" style={{ color: '#6366F1' }}>{treballadorInitial}</span>
                    </div>
                  )}
                  <p className="font-semibold text-gray-800">{info.treballador!.nom}</p>
                </div>

                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-2">Puntuació</p>
                  <StarRating value={puntuacioTreballador} onChange={setPuntuacioTreballador} disabled={false} />
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-2">Comentari <span className="text-red-400">*</span></p>
                  <textarea
                    value={comentariTreballador}
                    onChange={(e) => setComentariTreballador(e.target.value)}
                    placeholder="Com ha estat l'atenció del professional?"
                    rows={3}
                    className="w-full rounded-xl border border-gray-200 p-3 text-sm text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
                  />
                </div>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={!canSubmit || loading}
              className="w-full py-4 rounded-full font-bold text-sm text-white transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg"
              style={{ background: 'linear-gradient(135deg, #6366F1, #4338CA)' }}
            >
              {loading ? 'Enviant...' : 'Enviar valoració'}
            </button>
          </>
        )}
      </div>
    </main>
  );
}
