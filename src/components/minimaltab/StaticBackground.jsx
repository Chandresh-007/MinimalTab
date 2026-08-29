function StaticBackground({ palette }) {
  const { horizonColor, waveColor, crestColor } = palette;
  return <div
    aria-hidden="true"
    className="pointer-events-none fixed inset-0 z-0 bg-background"
  >
      <div
    className="absolute inset-0"
    style={{
      backgroundImage: `radial-gradient(120% 80% at 50% 110%, ${crestColor}55 0%, transparent 60%), linear-gradient(180deg, ${horizonColor} 0%, ${waveColor} 65%, ${crestColor}33 100%)`,
      opacity: 0.85
    }}
  />
      <div
    className="absolute inset-0"
    style={{
      backgroundImage: `repeating-linear-gradient(180deg, ${crestColor}14 0px, ${crestColor}14 1px, transparent 1px, transparent 26px)`,
      maskImage: "linear-gradient(180deg, transparent 30%, black 100%)",
      WebkitMaskImage: "linear-gradient(180deg, transparent 30%, black 100%)"
    }}
  />
    </div>;
}
export {
  StaticBackground
};
