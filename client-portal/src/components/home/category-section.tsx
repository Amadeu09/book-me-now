import Image from "next/image";

const STEPS = [
  {
    number: "01",
    icon: "store",
    title: "Configura tu negocio",
    description:
      "Añade tus servicios, define precios y duración, crea las plantillas de horarios de tus empleados y personaliza tu perfil de empresa.",
    tags: ["Servicios", "Horarios", "Empleados"],
    image: "/images/horaris-escriptori-nou.png",
    imageAlt: "Pantalla de configuración de horarios",
  },
  {
    number: "02",
    icon: "smartphone",
    title: "Los clientes reservan online",
    description:
      "Tus clientes acceden a tu portal, eligen el servicio, el empleado y el horario disponible. Reserva confirmada en segundos, sin llamadas.",
    tags: ["Portal cliente", "Disponibilidad", "24/7"],
    image: "/images/calendari-escriptori-nou.png",
    imageAlt: "Calendario de reservas",
  },
  {
    number: "03",
    icon: "dashboard",
    title: "Tú gestionas todo desde un lugar",
    description:
      "Consulta el calendario de reservas, aprueba ausencias, revisa estadísticas de ingresos y lee las valoraciones de tus clientes.",
    tags: ["Calendario", "Estadísticas", "Valoraciones"],
    image: "/images/estadistiques-escriptori-nou.png",
    imageAlt: "Panel de estadísticas y clientes",
  },
];

export function CategorySection() {
  return (
    <section id="como-funciona" className="bg-surface-container-low py-32 px-6 md:px-12 mb-40 rounded-[4rem]">
      <div className="max-w-[1920px] mx-auto">
        {/* Header */}
        <div className="text-center mb-20 max-w-2xl mx-auto">
          <p className="text-primary font-bold tracking-widest uppercase text-sm mb-4">
            Cómo funciona
          </p>
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.85] mb-6">
            De cero a{" "}
            <span className="text-primary italic font-light">reservas</span>
            <br />
            en minutos.
          </h2>
          <p className="text-on-surface-variant text-lg">
            Sin instalaciones complicadas. Sin formación técnica.
            Solo configura y empieza.
          </p>
        </div>

        {/* Steps grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {STEPS.map((step) => (
            <div
              key={step.number}
              className="bg-white rounded-[2.5rem] overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              {/* Screenshot */}
              <div className="relative h-48 overflow-hidden bg-surface-container-low">
                <Image
                  src={step.image}
                  alt={step.imageAlt}
                  fill
                  className="object-cover object-top"
                />
              </div>

              <div className="p-10 flex flex-col gap-6 flex-1">
                {/* Number + icon */}
                <div className="flex items-center justify-between">
                  <span className="text-7xl font-black text-primary/10 leading-none select-none">
                    {step.number}
                  </span>
                  <div className="w-14 h-14 rounded-2xl bg-primary-fixed flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-3xl">
                      {step.icon}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-bold tracking-tight mb-3">
                    {step.title}
                  </h3>
                  <p className="text-on-surface-variant leading-relaxed">
                    {step.description}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 mt-auto pt-2">
                  {step.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-4 py-1.5 bg-surface-container-low rounded-full text-xs font-bold text-on-surface-variant tracking-wide"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
