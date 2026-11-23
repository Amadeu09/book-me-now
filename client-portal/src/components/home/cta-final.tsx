import { Icon } from '@/components/ui/icon';
import { REGISTRE_URL } from '@/lib/links';

export function CtaFinal() {
  return (
    <section id="proximamente" className="py-16 md:py-24 scroll-mt-20">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-6 grid md:grid-cols-2 gap-6">
        <div className="bg-brand rounded-[28px] p-8 md:p-12 flex flex-col gap-5 text-white">
          <h2 className="m-0 text-[26px] md:text-[34px] leading-[1.1] tracking-[-0.02em] font-extrabold">
            ¿Tienes un negocio?
            <br />
            Empieza a recibir reservas hoy.
          </h2>
          <p className="m-0 text-[16px] leading-relaxed text-[#E4E4FF]">Crea tu cuenta, añade tus servicios y comparte tu página con tus clientes.</p>
          <div className="flex flex-wrap gap-3">
            <a href={REGISTRE_URL} className="inline-flex items-center justify-center min-h-[48px] px-6 rounded-[12px] bg-white text-brand-ink text-[15px] font-bold hover:bg-brand-soft transition-colors">
              Registra tu negocio
            </a>
          </div>
        </div>
        <div className="bg-brand-soft rounded-[28px] p-8 md:p-12 flex flex-col gap-5">
          <span className="w-[52px] h-[52px] rounded-[14px] bg-white text-brand flex items-center justify-center"><Icon name="phone" size={24} /></span>
          <h2 className="m-0 text-[24px] md:text-[28px] tracking-[-0.02em] font-extrabold text-brand-ink">La app, muy pronto en tu móvil</h2>
          <p className="m-0 text-[16px] leading-relaxed text-brand-muted">Gestiona tu negocio desde el bolsillo. Llegará a iPhone y Android.</p>
          <div className="flex flex-wrap gap-2.5">
            <span className="text-[13px] font-bold px-3.5 py-2 rounded-full bg-white border border-brand-line text-brand-ink">iPhone · próximamente</span>
            <span className="text-[13px] font-bold px-3.5 py-2 rounded-full bg-white border border-brand-line text-brand-ink">Android · próximamente</span>
          </div>
        </div>
      </div>
    </section>
  );
}
