export function HeroSection() {
  return (
    <section className="relative min-h-[921px] flex items-center px-6 md:px-12 mb-32">
      <div className="absolute inset-0 z-0 overflow-hidden px-4 md:px-12 py-6">
        <div className="w-full h-full rounded-xl overflow-hidden relative">
          <img
            alt="Luxury Interior"
            className="w-full h-full object-cover"
            data-alt="Interior of a high-end minimalist luxury spa with warm ambient lighting, limestone walls, and architectural greenery"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBsIisqLbPCuD36ffKwns9OqTTPHl0rXnruqjOpO1ouaH9jS7iA4uwPudXyK-a810Fid6vY5vVrTsse1RunidGygTABtxRMpzVXdBLhiE6TuaoqELWVgf9v2DyL-PEye5YcRMlnS7nxWOp0FqO53eg6jagU04iHsTeTSbR41NwPyPrSA1u3HJg5shBGodpPobLvRWRK3rdPU0RuvTkYx5WFM8PZXHzUgozIcPtDFN3QnIzsTxh8XTZbi7vk-3qBmSGx0wMzKObfc7Xr"
          />
          <div className="absolute inset-0 bg-black/10"></div>
        </div>
      </div>
      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col items-start pt-20">
        <div className="inline-block px-4 py-1 bg-white/20 backdrop-blur-md rounded-full text-white text-xs font-bold tracking-[0.2em] uppercase mb-6">
          Curated Excellence
        </div>
        <h1 className="text-white text-6xl md:text-8xl font-black editorial-kern leading-[0.9] mb-12 max-w-3xl">
          Discover the <br /> <span className="text-secondary-fixed">Uncommon.</span>
        </h1>
        {/* Glassmorphism Floating Search */}
        <div className="glass-panel p-4 rounded-xl w-full max-w-3xl flex flex-col md:flex-row gap-4 shadow-2xl items-center">
          <div className="flex-1 w-full relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">
              search
            </span>
            <input
              className="w-full bg-surface-container-low border-none rounded-full py-4 pl-12 pr-6 focus:ring-2 focus:ring-primary/20 placeholder:text-on-surface-variant text-sm font-medium"
              placeholder="What are you seeking?"
              type="text"
            />
          </div>
          <div className="flex-1 w-full relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">
              location_on
            </span>
            <input
              className="w-full bg-surface-container-low border-none rounded-full py-4 pl-12 pr-6 focus:ring-2 focus:ring-primary/20 placeholder:text-on-surface-variant text-sm font-medium"
              placeholder="Location"
              type="text"
            />
          </div>
          <button className="w-full md:w-auto bg-primary text-white px-10 py-4 rounded-full font-bold hover:bg-primary-container transition-colors shadow-xl shadow-primary/10">
            Explore
          </button>
        </div>
      </div>
    </section>
  );
}
