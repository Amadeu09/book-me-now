import { Icon } from '@/components/ui/icon';

const DIES = [['Lun', '23'], ['Mar', '24'], ['Mié', '25'], ['Jue', '26'], ['Vie', '27'], ['Sáb', '28']];
const HORES = ['09:00', '09:45', '10:30', '11:15', '12:00', '16:00', '16:45', '17:30'];

/** Il·lustració d'una reserva (no interactiva): mostra el producte d'un cop d'ull. */
export function BookingPreview() {
  return (
    <div className="relative w-full max-w-[480px] mx-auto" role="img" aria-label="Ejemplo de reserva: eliges día y hora y la reserva queda confirmada al momento">
      <div aria-hidden="true" className="bg-white rounded-[24px] border border-brand-line shadow-[0_30px_80px_rgba(20,20,43,0.14)] p-5 sm:p-6 flex flex-col gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-[52px] h-[52px] rounded-[14px] bg-brand-soft text-brand flex items-center justify-center">
            <Icon name="scissors" size={24} />
          </div>
          <div className="min-w-0">
            <p className="font-extrabold text-[16px] text-brand-ink">Corte y peinado</p>
            <p className="text-[13px] text-brand-muted">Peluquería · 45 min</p>
          </div>
        </div>
        <p className="text-[13px] font-bold text-brand-muted">Elige día</p>
        <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
          {DIES.map(([d, n], i) => (
            <div
              key={n}
              className={`${i === 5 ? 'hidden sm:flex' : 'flex'} min-h-[56px] rounded-[12px] border flex-col items-center justify-center text-[12px] font-semibold ${
                i === 1 ? 'bg-brand border-brand text-white' : 'bg-white border-brand-line text-brand-ink'
              }`}
            >
              <span className="opacity-80">{d}</span>
              <span className="text-[16px] font-extrabold">{n}</span>
            </div>
          ))}
        </div>
        <p className="text-[13px] font-bold text-brand-muted">Elige hora</p>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {HORES.map((h, i) => (
            <div
              key={h}
              className={`${i >= 6 ? 'hidden sm:flex' : 'flex'} min-h-[44px] rounded-[10px] border items-center justify-center text-[14px] font-bold ${
                h === '10:30' ? 'bg-brand-soft border-brand text-brand' : 'bg-white border-brand-line text-brand-ink'
              }`}
            >
              {h}
            </div>
          ))}
        </div>
        <div className="min-h-[48px] rounded-[12px] bg-brand text-white font-bold text-[15px] flex items-center justify-center">
          Confirmar reserva
        </div>
      </div>

      <div aria-hidden="true" className="absolute -top-[60px] right-0 sm:-top-6 sm:-right-9 flex items-center gap-3 bg-white border border-brand-line rounded-[16px] px-4 py-3 shadow-[0_16px_40px_rgba(20,20,43,0.14)]">
        <div className="w-9 h-9 rounded-full bg-[#E3F7EF] text-[#0F8A66] flex items-center justify-center">
          <Icon name="check" size={18} strokeWidth={2.6} />
        </div>
        <div>
          <p className="font-extrabold text-[14px] text-brand-ink">Reserva confirmada</p>
          <p className="text-[12px] text-brand-muted">Mar 24 · 10:30 · Te llegará un email</p>
        </div>
      </div>
    </div>
  );
}
