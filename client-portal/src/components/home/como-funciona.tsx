const PASSOS = [
  { titol: 'Configura tu negocio', text: 'Añade servicios, precios, horario de apertura y tu equipo. Lo tienes listo en una tarde.' },
  { titol: 'Comparte tu página', text: 'Tus clientes ven tus servicios y huecos libres y reservan en segundos, sin llamar.' },
  { titol: 'Gestiona desde un lugar', text: 'Agenda, ausencias, cierres y estadísticas en el mismo panel, desde cualquier dispositivo.' },
];

const TIPUS = ['Peluquerías', 'Barberías', 'Centros de estética', 'Spas', 'Masajes', 'Fisioterapia', 'Pilates y yoga', 'Nutrición'];

export function ComoFunciona() {
  return (
    <section id="como-funciona" className="bg-brand-soft py-16 md:py-28 scroll-mt-20">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-6 flex flex-col gap-10">
        <div className="text-center flex flex-col items-center gap-3">
          <p className="m-0 text-[13px] font-extrabold tracking-[0.12em] uppercase text-brand">Cómo funciona</p>
          <h2 className="m-0 text-[28px] md:text-[40px] tracking-[-0.03em] font-extrabold text-brand-ink">De cero a reservas en tres pasos</h2>
          <p className="m-0 text-[17px] text-brand-muted">Sin instalaciones ni formación técnica.</p>
        </div>
        <ol className="m-0 p-0 list-none grid md:grid-cols-3 gap-5">
          {PASSOS.map((p, i) => (
            <li key={p.titol} className="bg-white border border-brand-line rounded-[20px] p-7 flex flex-col gap-3">
              <span className="w-10 h-10 rounded-full bg-brand text-white font-extrabold flex items-center justify-center" aria-hidden="true">{i + 1}</span>
              <h3 className="m-0 text-[18px] font-extrabold text-brand-ink">{p.titol}</h3>
              <p className="m-0 text-[15px] leading-relaxed text-brand-muted">{p.text}</p>
            </li>
          ))}
        </ol>
        <p className="m-0 text-center text-[15px] text-brand-muted">Pensado para {TIPUS.join(' · ')}.</p>
      </div>
    </section>
  );
}
