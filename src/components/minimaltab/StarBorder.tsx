import type { ElementType, ComponentPropsWithoutRef } from "react";

type StarBorderProps<T extends ElementType> = {
  as?: T;
  className?: string;
  color?: string;
  speed?: string;
  thickness?: number;
  children?: React.ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "color" | "children">;

export function StarBorder<T extends ElementType = "button">({
  as,
  className = "",
  color = "currentColor",
  speed = "6s",
  thickness = 1,
  children,
  ...rest
}: StarBorderProps<T>) {
  const Component = (as ?? "button") as ElementType;

  return (
    <Component
      className={`star-border-container ${className}`}
      style={{
        padding: `${thickness}px 0`,
        ...((rest as { style?: React.CSSProperties }).style ?? {}),
      }}
      {...rest}
    >
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
      <span className="star-border-inner">{children}</span>
    </Component>
  );
}

export default StarBorder;
