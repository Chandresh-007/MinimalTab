import { useEffect, useState } from "react";
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);
  return reduced;
}
function StarBorder({
  as,
  className = "",
  color = "currentColor",
  speed = "6s",
  thickness = 1,
  compact = false,
  children,
  ...rest
}) {
  const Component = as ?? "button";
  const reduced = usePrefersReducedMotion();
  return <Component
    className={`star-border-container ${compact ? "compact" : ""} ${className}`}
    style={{
      padding: `${thickness}px 0`,
      ...rest.style ?? {}
    }}
    {...rest}
  >
      {!reduced && <>
          <span
    className="border-gradient-bottom"
    style={{
      background: `radial-gradient(circle, ${color}, transparent 10%)`,
      animationDuration: speed
    }}
  />
          <span
    className="border-gradient-top"
    style={{
      background: `radial-gradient(circle, ${color}, transparent 10%)`,
      animationDuration: speed
    }}
  />
        </>}
      <span className="star-border-inner">{children}</span>
    </Component>;
}
var stdin_default = StarBorder;
export {
  StarBorder,
  stdin_default as default
};
