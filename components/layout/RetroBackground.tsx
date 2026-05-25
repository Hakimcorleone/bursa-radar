export function RetroBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-20 overflow-hidden bg-void">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(103,232,249,.18),transparent_26%),radial-gradient(circle_at_80%_10%,rgba(192,132,252,.16),transparent_24%),linear-gradient(135deg,#070914_0%,#0c1020_50%,#151129_100%)]" />
      <div className="absolute inset-0 animate-gridRun bg-[linear-gradient(rgba(103,232,249,.10)_1px,transparent_1px),linear-gradient(90deg,rgba(103,232,249,.10)_1px,transparent_1px)] bg-[size:48px_48px] opacity-45" />
      <div className="absolute bottom-[-18%] left-1/2 h-[42rem] w-[70rem] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(ellipse,rgba(45,212,191,.14),transparent_62%)] blur-2xl" />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-[linear-gradient(to_top,rgba(7,9,20,.92),transparent)]" />
    </div>
  );
}
