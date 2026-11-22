/** Logotip de BookMeNow: monograma "bn" sobre índigo. */
export function LogoMark({ size = 32, className = '' }: { size?: number; className?: string }) {
  const s = { fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 8 } as const;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true" className={className}>
      <rect width="100" height="100" rx="23" fill="#5B5BD6" />
      <path d="M22 18 V78" stroke="#fff" {...s} />
      <circle cx="38" cy="62" r="16" stroke="#fff" {...s} />
      <path d="M54 78 V60 a12 12 0 0 1 24 0 V78" stroke="#B9B9FA" {...s} />
    </svg>
  );
}
