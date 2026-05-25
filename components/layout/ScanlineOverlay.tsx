export function ScanlineOverlay() {
  return (
    <div className="scanline-overlay pointer-events-none fixed inset-0 z-50 opacity-[0.16] mix-blend-screen">
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,.18)_1px,transparent_1px)] bg-[size:100%_4px]" />
      <div className="absolute inset-x-0 top-0 h-24 animate-scan bg-gradient-to-b from-transparent via-cyan/15 to-transparent" />
    </div>
  );
}
