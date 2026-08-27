/**
 * Static full-viewport background layer.
 * The animated topography has been removed; PixelSnow remains as the
 * ambient motion layer above this.
 */
export function WaveBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 bg-background"
    />
  );
}
