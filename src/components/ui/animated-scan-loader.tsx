type AnimatedScanLoaderProps = {
  label?: string;
  className?: string;
};

export function AnimatedScanLoader({
  label = 'RAHI BOOT HOUSE',
  className = '',
}: AnimatedScanLoaderProps) {
  return (
    <div
      className={`relative max-w-fit font-century text-[clamp(1.5rem,4.5vw,2.35rem)] font-semibold uppercase tracking-[0.22em] text-[#f8f6f2] transition-colors duration-1000 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] [--scan-travel:2.5rem]${className ? ` ${className}` : ''}`}
    >
      <span className="relative z-[2] animate-cut transition-all duration-1000 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]">
        {label}
      </span>
      <div
        className="absolute left-0 top-0 z-0 h-[5px] w-full animate-scan rounded bg-[#d4af3759] blur-[10px] transition-all duration-1000 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]"
        aria-hidden="true"
      />
      <div
        className="absolute left-0 top-0 z-[1] h-[4px] w-full animate-scan rounded bg-[#d4af37] opacity-90 transition-all duration-1000 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]"
        aria-hidden="true"
      />
    </div>
  );
}

export default AnimatedScanLoader;
