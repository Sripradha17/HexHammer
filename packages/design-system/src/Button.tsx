import type { ButtonHTMLAttributes } from "react";

// I will rebuild this by hand later.
// A big, wobbly, friendly button. It sinks when you hover and presses flat when you click.
// `level` (1 to 8) tints it with that level's marker color. `variant` picks the look.
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  size?: "normal" | "small";
  level?: number;
}

export function Button({
  variant = "primary",
  size = "normal",
  level,
  className = "",
  ...rest
}: ButtonProps) {
  const classes = `hh-button hh-button--${variant} ${size === "small" ? "hh-button--small" : ""} ${className}`;
  return <button data-level={level} className={classes} {...rest} />;
}
