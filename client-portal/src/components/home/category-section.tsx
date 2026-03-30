export function CategorySection() {
  return (
    <section className="bg-surface-container-low py-32 px-6 md:px-12 mb-40 rounded-[4rem]">
      <div className="max-w-[1920px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
          <div className="relative">
            <div className="absolute -top-12 -left-12 w-64 h-64 bg-primary-fixed rounded-full blur-3xl opacity-30"></div>
            <div className="relative z-10 space-y-8">
              <h2 className="text-5xl md:text-7xl font-black editorial-kern leading-[0.8]">
                Master <br /> Your <br />{" "}
                <span className="text-primary italic">Routine.</span>
              </h2>
              <p className="text-on-surface-variant text-lg max-w-md">
                Every journey is personal. Whether you seek the heat of the
                sauna or the rigor of the ring, we curate only the elite.
              </p>
              <div className="flex flex-wrap gap-4">
                <span className="px-8 py-3 bg-white rounded-full border border-outline-variant/20 font-bold text-sm hover:border-primary transition-colors cursor-pointer">
                  Sartorial Salons
                </span>
                <span className="px-8 py-3 bg-white rounded-full border border-outline-variant/20 font-bold text-sm hover:border-primary transition-colors cursor-pointer">
                  Recharge Retreats
                </span>
                <span className="px-8 py-3 bg-white rounded-full border border-outline-variant/20 font-bold text-sm hover:border-primary transition-colors cursor-pointer">
                  Performance Hubs
                </span>
              </div>
            </div>
          </div>
          <div className="relative grid grid-cols-2 gap-4">
            <div className="space-y-4 pt-12">
              <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-xl">
                <img
                  alt="Salon"
                  className="w-full h-full object-cover"
                  data-alt="Elegant hair salon with arched mirrors, velvet chairs, and soft warm lighting"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCfaRKbmaTb4XidvMAo994zNzvhsjT6Mllqkk6zR6lpUVyDFKpKVPDw5v7C1tyAH8I266BTMXeZKdQjViuocnuOPWkq2CNrpDk7HyQ0OrqR3g995AlQcWviGBpaAjydsiDaaGJ6ZD9df9IsCvjRpFPxGl6ejv-r_L1CYucDYcIlVCwHsmIFYNHecAIoq3J_zDC58snZp1HYJPv7BksCoTw09epou3ghQkETymFbVuByT8smKL1NqsrVm_JTC4mTtKWG_V4BI_amkyyZ"
                />
              </div>
              <div className="aspect-square rounded-2xl overflow-hidden shadow-xl">
                <img
                  alt="Yoga"
                  className="w-full h-full object-cover"
                  data-alt="Woman practicing yoga in a high-ceilinged white studio with light oak floors and large plants"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDMUBeAXWcR_t3EIjl_ii45tbcRePfboa0Rjeo96NodkhiOqJ86Hf9xr_23qg2CuSz7oDpo0vClXnXQrIN1QFzvxMeec7e7xmd9aQw81CRODL31WyGxc-olLW_40bj9IwgCKiCgoXERMQWaSNGzWd3IRVGIB2h9j1CVPSNNKBLGaP_gUoaafFXq5VAGlXJTkSgxMy0t04Cna5q6I82-nA8i2Qz47w-8uK_KMNSSg5irvOVRcBb05Bx_btoaVzqO0xonLMPIENm3DWzw"
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="aspect-square rounded-2xl overflow-hidden shadow-xl">
                <img
                  alt="Pilates"
                  className="w-full h-full object-cover"
                  data-alt="Close-up of a high-end pilates reformer machine in a bright studio with soft morning light"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuA_Z8Rfv8FwZ_8cV8G3E-rxfENGamijKr5k4WyRK_KEnebYa_QeoD8tdhsLci-yikevCJ8ljAXJ4fs7jwkf0vcDG4rosW4jouDFy87p_mkCM6939T2LkQtAY1GSR1EjAFVneM0b7JbX_pJ19HsLtLjaZkNfiLOavIs0AkVCpB8fJWqUaLDTmuOHvi4JdoIvCAE0JHhagMDSWYc8SkHBd_j6czq3cb1NGTrc6RmVJ9xiAvOwGarE04-kTulWi8kfyEf5p7jUhN78Cv7I"
                />
              </div>
              <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-xl">
                <img
                  alt="Massage"
                  className="w-full h-full object-cover"
                  data-alt="Minimalist therapy room with a wooden table, warm linens, and a singular spotlight"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAC0-Rf2vX35fdlLST2FPQNxaOSiBztu7r34gqsD4o5g8DW-zONz7DYQdPhAc9jYMQ9HEfmGAa_z-SlxEqzRKcPwm5KWkd1EPjoQVqHdgQj-MugQqdPEH2kz-o7WqOaUsvGqID-Nsxxwv7B_3y8a7kD9mFrHaaY1Q3K3buz23eUygY5Ab0T-qwAL_tokyqkmuMUUAPCfyMrUxb2telxR-KjV3bmwBBZhIKc7pVYz1lamkIkKqbiTklYF6nag1X3SlDlCyabDRTgMZOT"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
