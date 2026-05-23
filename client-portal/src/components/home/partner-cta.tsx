export function PartnerCta() {
  return (
    <section id="contacto" className="px-6 md:px-12 max-w-[1920px] mx-auto mb-40">
      <div className="relative bg-on-surface text-white rounded-[4rem] overflow-hidden p-12 md:p-24 flex flex-col md:flex-row items-center gap-16">
        <div className="w-full md:w-1/2 z-10">
          <p className="text-primary-fixed font-bold tracking-[0.2em] uppercase text-xs mb-6">
            Programa de Socios
          </p>
          <h2 className="text-5xl md:text-7xl font-black mb-8 leading-[1.1]">
            Eleva tu <br /> Presencia <br /> Local.
          </h2>
          <p className="text-surface-variant text-lg max-w-md mb-12">
            ¿Eres un experto en tu oficio? Únete al círculo selecto de negocios
            destacados en BookMeNow.
          </p>
          <button className="bg-white text-on-surface px-12 py-5 rounded-full font-bold text-lg hover:bg-primary-fixed transition-colors">
            Solicitar Alta
          </button>
        </div>
        <div className="w-full md:w-1/2 relative h-[500px]">
          <div className="absolute top-0 right-0 w-4/5 h-4/5 rounded-3xl overflow-hidden rotate-3 z-0">
            <img
              alt="Barber"
              className="w-full h-full object-cover opacity-50"
              data-alt="Professional barber at work in a dark-themed high-end shop with leather chairs and vintage accents"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDJqUZ9iNTesa_qePQTEzEuH8U8ueDjofUMm4-8U6Wgd7XnmeSv92IYdZCEs8jA9ogMilvV8Jvtv1bUzp6W5nsNwbQ2A6XJPUbxayLf2dIxN3KQmXwK_EGd-RtBwWdGTX2VY78ttT5vvT0tctp0kMF8Pa0Ns_d2aeKRVTZTlqogaH4fO2cgm0DupQL8fBpvgS8qYGcxAnjCXAgwgCUVCpGPMWVnS8wxM9NsyvYePjNtaBNF9jlBC-1_zOT6pPlaK5bhukkuDVPRr96E"
            />
          </div>
          <div className="absolute bottom-0 left-0 w-3/4 h-3/4 rounded-3xl overflow-hidden -rotate-6 z-10 border-[12px] border-on-surface">
            <img
              alt="Skincare"
              className="w-full h-full object-cover"
              data-alt="Beautifully packaged skincare products arranged on a marble surface with soft pastel lighting"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDaaIdP1e7iSBOU-HJ1hlBA61WEPEneIF7zZTYvvZFPBAt2qRpX-lEfE_MqK6Kqa0CyjCdmPke_n3YFZJP5_1rO4mVWbF1InGEU3VhBZ2mZS7A3NzJ7FhRAEdBB73bwQ-fTMG9AISlKNC-BI9eKvcOPPohugrdAee5Y-44QPfhSxQdfb6aFf4fE1mATK3TvwI3MLcotWv8AIC2hXVka2ZWH_2IC55Hc0_Z9pyuyVHJHty3mgFJES5iLVc8MegtIqZUpxzGFIgnm3-h8"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
