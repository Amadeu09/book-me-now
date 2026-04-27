export function BentoGrid() {
  return (
    <section className="px-6 md:px-12 max-w-[1920px] mx-auto mb-40">
      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
        <div className="max-w-xl">
          <p className="text-primary font-bold tracking-widest uppercase text-sm mb-4">
            La Selección
          </p>
          <h2 className="text-5xl md:text-6xl font-black tracking-tighter leading-none">
            Destinos a <span className="italic font-light">Medida</span> para los
            Exigentes.
          </h2>
        </div>
        <p className="text-on-surface-variant font-medium max-w-sm mb-2">
          Una colección seleccionada de maestros locales, santuarios estéticos y
          espacios de alto rendimiento.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 h-auto">
        {/* Large Feature Card */}
        <div className="md:col-span-7 group cursor-pointer">
          <div className="relative overflow-hidden rounded-[4rem] rounded-br-[0px] h-[600px] mb-6">
            <img
              alt="Luxury Gym"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              data-alt="Modern high-end gym with wooden panels, minimalist equipment, and expansive glass windows overlooking a city skyline"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAr3fyjjMKSXi8Oz1TPNTd0vC_xmqiVXY5Svu3XVU_AkAE1bMupSm3QaltNC9_RRFCUiLy4lRPIUHpLtiS3eI0pheGLJtF-dgbtsSpHe1gdF6afbdsaocEv30HVGa0-buPMM6Q90E6TSV-pwyKUzMQHMvEl_j1vc7q7yxbTgUgFj6xNXZnWsN9do4MgLfftLBVOVqZ5ZJxl9OKtDotXfWP51hpIvUMU991GcWXVnf23WjFOkIuRFc_CjHIAe3WEjcZRX8crLCNraPMX"
            />
            <div className="absolute top-8 right-8">
              <div className="bg-secondary-fixed text-on-secondary-fixed px-6 py-2 rounded-full font-bold text-sm">
                Mejor Valorado
              </div>
            </div>
          </div>
          <div className="flex justify-between items-start px-4">
            <div>
              <h3 className="text-3xl font-bold tracking-tight mb-2">
                The Iron Sanctuary
              </h3>
              <p className="text-on-surface-variant font-medium">
                Bienestar &amp; Rendimiento • Londres, UK
              </p>
            </div>
            <span className="material-symbols-outlined text-4xl text-primary p-2 bg-primary-fixed rounded-full group-hover:rotate-45 transition-transform duration-300">
              north_east
            </span>
          </div>
        </div>

        {/* Secondary Cluster */}
        <div className="md:col-span-5 flex flex-col gap-8">
          <div className="bg-surface-container-low p-10 rounded-[3rem] flex-1 flex flex-col justify-between hover:bg-surface-container transition-colors duration-500">
            <div>
              <div className="flex gap-2 mb-6">
                <span className="material-symbols-outlined text-primary" data-weight="fill">star</span>
                <span className="material-symbols-outlined text-primary" data-weight="fill">star</span>
                <span className="material-symbols-outlined text-primary" data-weight="fill">star</span>
                <span className="material-symbols-outlined text-primary" data-weight="fill">star</span>
                <span className="material-symbols-outlined text-primary" data-weight="fill">star</span>
              </div>
              <h4 className="text-2xl font-bold mb-4 tracking-tight leading-tight">
                &quot;An unparalleled experience of quiet luxury and aesthetic perfection.&quot;
              </h4>
              <p className="text-on-surface-variant text-sm uppercase tracking-widest font-bold">
                — ELIZA VOGUE
              </p>
            </div>
            <div className="pt-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden">
                  <img
                    alt="Reviewer"
                    className="w-full h-full object-cover"
                    data-alt="Portrait of a sophisticated woman with neutral makeup and soft natural lighting"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAZDXdGS3F-TAS72F_62PBMW6lSZPrZSRnYxOHNAsYokMCYYAdgL2kufV499VQfcZi-7Xmk7sRWewO-RS1rpzGSARn74ucDnpWCTftoKHsNL_KxczS2NavMi12cJPt1vHuKabj0sDAvwH6TI6RcZNQ4NEkN6sAEA-bNQ-wJ31augXPKhqGznc4dlJjz802kh2cXfRJP1gzU5IN-XpC-5LqssiBzj-5lHM67B8vrNSJtPZd7rkeDRcwI05mNUHnM-MYqd-PnWv3KN5oC"
                  />
                </div>
                <div>
                  <p className="font-bold">Reportaje</p>
                  <p className="text-xs text-on-surface-variant">Guía de Bienestar 2024</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative group cursor-pointer overflow-hidden rounded-[3rem] h-[300px]">
            <img
              alt="Luxury Spa"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              data-alt="Close up of essential oils and smooth river stones in a spa setting with soft steam and candle light"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuChBhnGCxw7sIJmpzgTutcQohEA1BZsstKWgvHex-AlV4KRNQaSfpYuMmyyGkk9cI3IAVFlAYR7235DWOVAhbAo7j1IHxY_JFr2Es04x5yg6Xff4r_vECSfCaaZWkRm3D5FUPd812KZLX4JkQdCywc3OOSeIintkgelZSLkmxzS5vgDyqsnsefuIqYQucgwvuZHHDp_eGdtXc47JB2g6Ns45Fp0szX-rac2s11AOOcQY7ZKM5Ncbd_bBhVJIeCEqR4iRZjILBN4RGZ7"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-on-surface/80 to-transparent flex items-end p-8">
              <div className="text-white">
                <p className="text-xs font-bold tracking-widest uppercase mb-1 opacity-70">
                  Nueva Apertura
                </p>
                <h4 className="text-2xl font-bold">Azure Thalasso</h4>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
