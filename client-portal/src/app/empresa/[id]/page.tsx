import { notFound } from 'next/navigation';
import { getEmpresaPublic, getServeisPublic, getAgendaPublic } from '@/lib/api';
import { ServicesSection } from '@/components/empresa/ServicesSection';
import { AgendaSection } from '@/components/empresa/AgendaSection';
import type { TreballadorPublic, AgendaPublica } from '@/types/empresa';

const CARD = 'bg-white rounded-lg border border-gray-200/60 p-5';
const LABEL = 'text-[11px] font-medium uppercase tracking-[0.06em] text-gray-400 mb-3';

export default async function EmpresaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const empresaId = parseInt(id, 10);
  if (isNaN(empresaId)) notFound();

  let empresa;
  let serveis;
  let agenda: AgendaPublica = { horaris: [], absencies: [] };
  try {
    [empresa, serveis] = await Promise.all([
      getEmpresaPublic(empresaId),
      getServeisPublic(empresaId),
    ]);
  } catch {
    notFound();
  }
  try {
    agenda = await getAgendaPublic(empresaId);
  } catch {
    // agenda stays empty — non-critical, page still renders
  }

  const initial = empresa.nom.charAt(0).toUpperCase();

  // Unique professionals derived from services
  const professionals: TreballadorPublic[] = Array.from(
    new Map(
      serveis
        .flatMap((s) => s.treballadors.map((t) => t.treballador))
        .map((t) => [t.id, t]),
    ).values(),
  );

  return (
    <main className="min-h-screen" style={{ background: '#F7F7F8' }}>

      {/* ── Hero ── */}
      <div className="relative">

        {/* Banner */}
        <div className="relative w-full overflow-hidden" style={{ height: '320px' }}>
          {empresa.bannerUrl ? (
            <img
              src={empresa.bannerUrl}
              alt={`Banner de ${empresa.nom}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="w-full h-full"
              style={{ background: 'linear-gradient(135deg, #4F46E5 0%, #1F2937 100%)' }}
            />
          )}

          {/* Dark overlay */}
          <div
            className="absolute inset-0"
            style={{ background: 'rgba(0,0,0,0.40)' }}
          />

          {/* Bottom fade → page bg */}
          <div
            className="absolute bottom-0 left-0 right-0"
            style={{ height: '64px', background: 'linear-gradient(to bottom, transparent, #F7F7F8)' }}
          />

          {/* Text content inside banner — above the fade */}
          <div className="absolute left-6 md:left-10" style={{ bottom: '72px' }}>
            {/* Verified badge */}
            <span
              className="inline-flex items-center gap-1 px-2.5 py-1 mb-2 text-[10px] font-semibold uppercase tracking-widest rounded-full border"
              style={{
                background: 'rgba(99,102,241,0.25)',
                borderColor: 'rgba(99,102,241,0.45)',
                color: '#C7D2FE',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>verified</span>
              Negoci Verificat
            </span>

            {/* Name */}
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
              {empresa.nom}
            </h1>

            {/* Location */}
            {empresa.ubicacio && (
              <p className="flex items-center gap-1 text-white/70 text-sm mt-1">
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>location_on</span>
                {empresa.ubicacio}
              </p>
            )}
          </div>
        </div>

        {/* Avatar — overlaps the bottom fade */}
        <div
          className="absolute left-6 md:left-10"
          style={{ bottom: 0, transform: 'translateY(50%)' }}
        >
          {empresa.fotoPerfil ? (
            <img
              src={empresa.fotoPerfil}
              alt={empresa.nom}
              className="w-20 h-20 rounded-full object-cover"
              style={{ border: '3px solid white' }}
            />
          ) : (
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{
                border: '3px solid white',
                background: 'linear-gradient(135deg, #6366F1, #4338CA)',
              }}
            >
              <span className="text-2xl font-bold text-white">{initial}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Content grid ── */}
      {/* pt-14 clears the avatar (80px / 2 = 40px overlap + 16px gap) */}
      <div className="max-w-5xl mx-auto px-6 md:px-10 pt-14 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_340px] gap-5">

          {/* ── Left column ── */}
          <div className="space-y-4">

            {/* Sobre el negoci */}
            <div className={CARD}>
              <p className={LABEL}>Sobre el negoci</p>
              <p className="text-sm text-gray-600 leading-relaxed">
                {empresa.descripcio ?? 'Servei professional de qualitat. Reserva la teva cita en línia.'}
              </p>
            </div>

            {/* Professionals */}
            {professionals.length > 0 && (
              <div className={CARD}>
                <p className={LABEL}>Professionals</p>
                <div className="flex flex-wrap gap-4">
                  {professionals.map((t) => {
                    const tInitial = t.nom.charAt(0).toUpperCase();
                    return (
                      <div key={t.id} className="flex flex-col items-center gap-1.5">
                        {t.Usuari.fotoPerfil ? (
                          <img
                            src={t.Usuari.fotoPerfil}
                            alt={t.nom}
                            className="w-12 h-12 rounded-full object-cover border border-gray-100"
                          />
                        ) : (
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center border border-gray-100"
                            style={{ background: '#EEF2FF' }}
                          >
                            <span className="text-sm font-bold" style={{ color: '#6366F1' }}>
                              {tInitial}
                            </span>
                          </div>
                        )}
                        <span className="text-xs text-gray-500 text-center max-w-[56px] leading-tight truncate">
                          {t.nom}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Valoracions */}
            <div className={CARD}>
              <p className={LABEL}>Valoracions</p>
              <div className="flex flex-col items-center py-4 gap-1.5">
                <span className="material-symbols-outlined text-gray-300 text-3xl">star</span>
                <p className="text-sm text-gray-400">Encara no hi ha valoracions</p>
              </div>
            </div>

          </div>

          {/* ── Right column ── */}
          <div className="space-y-4">

            {/* Informació */}
            <div className={CARD}>
              <p className={LABEL}>Informació</p>
              <div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <div className="flex items-center gap-2 text-gray-400">
                    <span className="material-symbols-outlined text-base">location_on</span>
                    <span className="text-sm">Adreça</span>
                  </div>
                  <span className="text-sm font-medium text-gray-700 text-right max-w-[180px]">
                    {empresa.ubicacio || '—'}
                  </span>
                </div>
                <div className="pt-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 text-gray-400">
                      <span className="material-symbols-outlined text-base">schedule</span>
                      <span className="text-sm">Disponibilitat</span>
                    </div>
                    <AgendaSection agenda={agenda} />
                  </div>
                </div>
              </div>
            </div>

            {/* Serveis */}
            <div className={CARD}>
              <p className={LABEL}>Serveis</p>
              <ServicesSection empresa={empresa} serveis={serveis} />
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}
