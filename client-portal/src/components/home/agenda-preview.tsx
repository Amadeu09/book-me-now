import { Icon, type IconName } from '@/components/ui/icon';
import { LogoMark } from '@/components/layout/logo';

const DIES = ['Lun 23', 'Mar 24', 'Mié 25', 'Jue 26', 'Vie 27'];
type Cita = { fila: number; text: string; to: 'brand' | 'mint' | 'amber' };
const CITES: Cita[][] = [
  [{ fila: 0, text: 'Corte · Laura', to: 'brand' }, { fila: 3, text: 'Color · Núria', to: 'brand' }],
  [{ fila: 1, text: 'Barba · Jordi', to: 'mint' }],
  [{ fila: 0, text: 'Manicura · Ana', to: 'amber' }, { fila: 2, text: 'Corte · Pau', to: 'brand' }],
  [{ fila: 2, text: 'Masaje · Marc', to: 'mint' }],
  [{ fila: 1, text: 'Corte · Clara', to: 'brand' }, { fila: 3, text: 'Peinado · Eva', to: 'amber' }],
];
const TONS = {
  brand: 'bg-[#E3E3FB] text-brand',
  mint: 'bg-[#E3F7EF] text-[#0F8A66]',
  amber: 'bg-[#FFF1DC] text-[#8A5300]',
};
const NAV: IconName[] = ['calendar', 'team', 'clock', 'chart'];

/** Il·lustració del panell de gestió (agenda setmanal). */
export function AgendaPreview() {
  return (
    <div role="img" aria-label="Vista de la agenda semanal en el panel de BookMeNow" className="bg-white rounded-[20px] overflow-hidden flex shadow-[0_40px_90px_rgba(0,0,0,0.35)]">
      <div aria-hidden="true" className="w-16 shrink-0 bg-brand-ink flex flex-col items-center gap-2.5 py-4">
        <LogoMark size={34} />
        <div className="h-2" />
        {NAV.map((n, i) => (
          <div key={n} className={`w-[34px] h-[34px] rounded-[10px] flex items-center justify-center ${i === 0 ? 'bg-white/10 text-white' : 'text-[#9A9AC0]'}`}>
            <Icon name={n} size={18} />
          </div>
        ))}
      </div>
      <div aria-hidden="true" className="flex-1 min-w-0 p-4 sm:p-5 flex flex-col gap-3.5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-extrabold text-[16px] text-brand-ink">Reservas</p>
            <p className="text-[12px] text-brand-muted">Semana del 23 al 27</p>
          </div>
          <span className="bg-brand text-white text-[12px] font-bold px-3 py-2 rounded-[9px] whitespace-nowrap">+ Nueva reserva</span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {DIES.map((dia, c) => (
            <div key={dia} className={`${c >= 3 ? 'hidden sm:flex' : 'flex'} flex-col gap-1.5 min-w-0`}>
              <p className="text-[11px] font-bold text-brand-muted pb-1">{dia}</p>
              {[0, 1, 2, 3].map((f) => {
                const cita = CITES[c].find((x) => x.fila === f);
                return cita ? (
                  <div key={f} className={`h-[46px] rounded-[8px] px-2 py-1.5 text-[11px] font-bold truncate ${TONS[cita.to]}`}>{cita.text}</div>
                ) : (
                  <div key={f} className="h-[46px] rounded-[8px] border border-dashed border-[#E4E4EE]" />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
