import { useEffect, useState } from "react";
import type { ElementType, ComponentPropsWithoutRef } from "react";

type StarBorderProps<T extends ElementType> = {
  as?: T;
  className?: string;
  color?: string;
  speed?: string;
  thickness?: number;
  /** Tighter padding / smaller text for inline dashboard controls. */
  compact?: boolean;
  children?: React.ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "color" | "children">;

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

export function StarBorder<T extends ElementType = "button">({
  as,
  className = "",
  color = "currentColor",
  speed = "6s",
  thickness = 1,
  compact = false,
  children,
  ...rest
}: StarBorderProps<T>) {
  const Component = (as ?? "button") as ElementType;
  const reduced = usePrefersReducedMotion();

  return (
    <Component
      className={`star-border-container ${compact ? "compact" : ""} ${className}`}
      style={{
        padding: `${thickness}px 0`,
        ...((rest as { style?: React.CSSProperties }).style ?? {}),
      }}
      {...rest}
    >
      {!reduced && (
        <>
          <span
            className="border-gradient-bottom"
            style={{
              background: `radial-gradient(circle, ${color}, transparent 10%)`,
              animationDuration: speed,
            }}
          />
          <span
            className="border-gradient-top"
            style={{
              background: `radial-gradient(circle, ${color}, transparent 10%)`,
              animationDuration: speed,
            }}
          />
        </>
      )}
      <span className="star-border-inner">{children}</span>
    </Component>
  );
}

export default StarBorder;
