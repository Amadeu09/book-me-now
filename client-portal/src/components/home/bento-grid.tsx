import Image from "next/image";

export function BentoGrid() {
  return (
    <section className="px-6 md:px-12 max-w-[1920px] mx-auto mb-40">
      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
        <div className="max-w-xl">
          <p className="text-primary font-bold tracking-widest uppercase text-sm mb-4">
            El Software
          </p>
          <h2 className="text-5xl md:text-6xl font-black tracking-tighter leading-none">
            Todo lo que necesitas,{" "}
            <span className="italic font-light">en un solo lugar.</span>
          </h2>
        </div>
        <p className="text-on-surface-variant font-medium max-w-sm mb-2">
          Gestiona reservas, empleados, horarios y clientes desde una única
          plataforma. Sin complicaciones.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Large Feature Card — Reservas online */}
        <div className="md:col-span-7 bg-primary rounded-[4rem] rounded-br-[0px] p-12 flex flex-col justify-between min-h-[600px] overflow-hidden">
          <div>
            <span className="material-symbols-outlined text-5xl text-white/80 mb-6 block">
              calendar_month
            </span>
            <h3 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight mb-4">
              Reserva online,<br />24 horas al día.
            </h3>
            <p className="text-white/70 text-lg max-w-md">
              Tus clientes reservan cuando quieren, desde cualquier dispositivo.
              Sin llamadas, sin esperas.
            </p>
          </div>
          <div className="flex flex-col gap-3 mt-8">
            {[
              { icon: "check_circle", label: "El cliente elige servicio y horario" },
              { icon: "check_circle", label: "Confirmación automática por email" },
              { icon: "check_circle", label: "Recordatorio antes de la cita" },
            ].map((step) => (
              <div key={step.label} className="flex items-center gap-3">
                <span className="material-symbols-outlined text-white/90 text-xl">
                  {step.icon}
                </span>
                <span className="text-white/90 font-medium">{step.label}</span>
              </div>
            ))}
          </div>
          {/* Screenshot preview */}
          <div className="mt-8 rounded-2xl overflow-hidden border border-white/20 shadow-2xl">
            <Image
              src="/images/calendari-escriptori.png"
              alt="Vista del calendario de reservas"
              width={900}
              height={400}
              className="w-full object-cover object-top"
              style={{ maxHeight: "220px" }}
            />
          </div>
        </div>

        {/* Right column */}
        <div className="md:col-span-5 flex flex-col gap-8">
          {/* Gestió d'empleats */}
          <div className="bg-surface-container-low p-10 rounded-[3rem] flex-1 flex flex-col justify-between hover:bg-surface-container transition-colors duration-500 overflow-hidden">
            <div>
              <span className="material-symbols-outlined text-primary text-4xl mb-6 block">
                group
              </span>
              <h4 className="text-2xl font-bold mb-3 tracking-tight leading-tight">
                Gestión de empleados y horarios
              </h4>
              <p className="text-on-surface-variant text-sm leading-relaxed">
                Asigna servicios, define plantillas de jornada y gestiona
                ausencias. Cada empleado tiene su propia agenda sincronizada.
              </p>
            </div>
            {/* Schedule screenshot */}
            <div className="mt-6 rounded-2xl overflow-hidden border border-outline-variant/20 shadow-sm">
              <Image
                src="/images/crear-horari-mobil.png"
                alt="Creación de plantilla de horario"
                width={400}
                height={260}
                className="w-full object-cover object-top"
                style={{ maxHeight: "160px" }}
              />
            </div>
            <div className="pt-6 flex gap-3 flex-wrap">
              {["Plantillas", "Ausencias", "Turnos"].map((tag) => (
                <span
                  key={tag}
                  className="px-4 py-1.5 bg-primary-fixed text-on-primary-fixed rounded-full text-xs font-bold tracking-wide"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Estadísticas */}
          <div className="bg-surface-container-low p-10 rounded-[3rem] hover:bg-surface-container transition-colors duration-500 overflow-hidden">
            <span className="material-symbols-outlined text-primary text-4xl mb-6 block">
              bar_chart
            </span>
            <h4 className="text-2xl font-bold mb-3 tracking-tight">
              Estadísticas en tiempo real
            </h4>
            <p className="text-on-surface-variant text-sm leading-relaxed mb-6">
              Ingresos, reservas por mes, servicios más populares y valoraciones
              de clientes. Todo visible desde el panel de control.
            </p>
            <div className="rounded-2xl overflow-hidden border border-outline-variant/20 shadow-sm">
              <Image
                src="/images/estadistiques-escriptori.png"
                alt="Panel de estadísticas"
                width={600}
                height={260}
                className="w-full object-cover object-top"
                style={{ maxHeight: "180px" }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
