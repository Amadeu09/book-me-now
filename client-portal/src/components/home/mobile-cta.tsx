import Image from "next/image";

const PLATFORMS = [
  {
    icon: "phone_iphone",
    name: "iPhone",
    store: "App Store",
    os: "iOS",
    image: "/images/perfil-mobil.png",
    imageAlt: "BookMeNow en iPhone",
  },
  {
    icon: "phone_android",
    name: "Android",
    store: "Google Play",
    os: "Android",
    image: "/images/estadistiques-mobil-nou.png",
    imageAlt: "BookMeNow en Android",
  },
];

export function MobileCta() {
  return (
    <section id="proximamente" className="px-6 md:px-12 max-w-[1920px] mx-auto mb-40">
      <div className="bg-surface-container-low rounded-[4rem] px-12 md:px-24 py-20 flex flex-col md:flex-row items-center gap-16">

        {/* Text */}
        <div className="flex-1 max-w-xl">
          <div className="inline-flex items-center gap-2 bg-primary-fixed text-on-primary-fixed px-5 py-2 rounded-full text-xs font-black tracking-widest uppercase mb-8">
            <span className="material-symbols-outlined text-base">schedule</span>
            Próximamente
          </div>
          <h2 className="text-5xl md:text-6xl font-black tracking-tighter leading-[0.9] mb-6">
            BookMeNow<br />
            <span className="text-primary italic font-light">en tu bolsillo.</span>
          </h2>
          <p className="text-on-surface-variant text-lg leading-relaxed max-w-md">
            La app móvil de BookMeNow llegará pronto a iPhone y Android. Gestiona
            tu negocio y tus reservas desde cualquier lugar, en cualquier momento.
          </p>
        </div>

        {/* Platform cards */}
        <div className="flex flex-col sm:flex-row gap-6 flex-shrink-0">
          {PLATFORMS.map((p) => (
            <div
              key={p.os}
              className="bg-white rounded-[2rem] overflow-hidden flex flex-col items-center w-52 shadow-sm relative"
            >
              {/* Coming soon badge */}
              <div className="absolute top-4 right-4 z-10">
                <span className="bg-primary/10 text-primary text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full backdrop-blur-sm">
                  Pronto
                </span>
              </div>

              {/* Phone screenshot */}
              <div className="w-full h-72 relative overflow-hidden bg-surface-container-low">
                <Image
                  src={p.image}
                  alt={p.imageAlt}
                  fill
                  className="object-cover object-top"
                />
              </div>

              {/* Platform info */}
              <div className="w-full p-6 flex flex-col items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-xl">
                    {p.icon}
                  </span>
                  <div className="text-center">
                    <p className="font-black text-base tracking-tight leading-none">{p.name}</p>
                    <p className="text-on-surface-variant text-xs font-medium">{p.store}</p>
                  </div>
                </div>
                <div className="w-full h-px bg-outline-variant/20" />
                <div className="flex items-center gap-2 text-on-surface-variant">
                  <span className="material-symbols-outlined text-sm">lock_clock</span>
                  <span className="text-xs font-bold tracking-wide">En desarrollo</span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
