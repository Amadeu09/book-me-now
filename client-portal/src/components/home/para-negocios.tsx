import { Icon, type IconName } from '@/components/ui/icon';
import { REGISTRE_URL } from '@/lib/links';
import { AgendaPreview } from './agenda-preview';

const AVANTATGES: { icon: IconName; titol: string; text: string }[] = [
  { icon: 'calendar', titol: 'Reservas online 24/7', text: 'Tus clientes reservan desde el móvil o el ordenador, también cuando estás cerrado.' },
  { icon: 'team', titol: 'Equipo y turnos', text: 'Plantillas de turnos con rotaciones, servicios por persona y vacaciones en un solo sitio.' },
  { icon: 'bell', titol: 'Confirmaciones y recordatorios', text: 'Cada reserva envía un email de confirmación y un recordatorio antes de la cita.' },
  { icon: 'chart', titol: 'Estadísticas claras', text: 'Ingresos, servicios más pedidos y valoraciones de tus clientes, de un vistazo.' },
];

export function ParaNegocios() {
  return (
    <section id="para-negocios" className="bg-brand-ink rounded-t-[28px] md:rounded-t-[40px] py-16 md:py-28 scroll-mt-20">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-6 grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-16 items-center">
        <div className="flex flex-col gap-7 min-w-0">
          <p className="m-0 text-[13px] font-extrabold tracking-[0.12em] uppercase text-brand-lila">Para negocios</p>
          <h2 className="m-0 text-[32px] md:text-[48px] leading-[1.06] tracking-[-0.03em] font-extrabold text-white">
            Tu agenda llena.
            <br />
            <span className="text-brand-lila">Tu tiempo, libre.</span>
          </h2>
          <p className="m-0 text-[17px] leading-relaxed text-[#C4C4DA] max-w-[520px]">
            BookMeNow es el panel de gestión para tu negocio: reservas, equipo, horarios y clientes, sin papeles ni hojas de cálculo.
          </p>
          <ul className="m-0 p-0 list-none flex flex-col gap-5">
            {AVANTATGES.map((a) => (
              <li key={a.titol} className="flex gap-4">
                <span className="w-11 h-11 shrink-0 rounded-[12px] bg-brand-lila/15 text-brand-lila flex items-center justify-center">
                  <Icon name={a.icon} size={20} />
                </span>
                <div>
                  <h3 className="m-0 mb-1 text-[16px] font-bold text-white">{a.titol}</h3>
                  <p className="m-0 text-[14px] leading-relaxed text-[#C4C4DA]">{a.text}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-3">
            <a href={REGISTRE_URL} className="inline-flex items-center justify-center min-h-[48px] px-6 rounded-[12px] bg-white text-brand-ink text-[15px] font-bold hover:bg-brand-soft transition-colors">
              Registra tu negocio
            </a>
            <a href="#como-funciona" className="inline-flex items-center justify-center min-h-[48px] px-6 rounded-[12px] border border-white/30 text-white text-[15px] font-bold hover:bg-white/10 transition-colors">
              Cómo funciona
            </a>
          </div>
        </div>
        <div className="min-w-0"><AgendaPreview /></div>
      </div>
    </section>
  );
}
