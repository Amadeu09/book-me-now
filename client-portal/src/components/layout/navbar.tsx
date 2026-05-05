import Link from 'next/link';

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-white backdrop-blur-2xl flex justify-between items-center px-6 md:px-12 py-6 max-w-[1920px] mx-auto">
      <div className="text-2xl font-bold tracking-tighter text-slate-900 dark:text-white font-headline">
        BookMeNow
      </div>
      <div className="hidden md:flex gap-10 items-center font-['Plus_Jakarta_Sans'] tracking-tight font-medium">
        {/* Changed from Destinations to Home */}
        <Link href="/" className="text-primary dark:text-primary font-semibold transition-opacity duration-300 hover:opacity-80">
          Home
        </Link>
        {/*
        <Link href="#" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-opacity duration-300">
          Experiences
        </Link>
        <Link href="#" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-opacity duration-300">
          Journal
        </Link>
        <Link href="#" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-opacity duration-300">
          About
        </Link>
        */}
      </div>
      <div>

      </div>
    </nav>
  );
}
