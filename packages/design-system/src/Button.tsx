import type { ButtonHTMLAttributes, Ref } from "react";

// I will rebuild this by hand later.
// A button. Use ONE "primary" per screen: the thing to do next.
//   variant  primary (ember) | secondary (outline) | ghost (text-like) | danger
//   size     normal | small
//   level    tints a primary button with a classic level's color (1 to 8)
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  ref?: Ref<HTMLButtonElement>; // React 19: a ref is a normal prop
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "normal" | "small";
  level?: number;
}

export function Button({ variant = "primary", size = "normal", level, className = "", type = "button", ...rest }: ButtonProps) {
  const classes = `hh-button hh-button--${variant} ${size === "small" ? "hh-button--small" : ""} ${className}`;
  return <button type={type} data-level={level} className={classes} {...rest} />;
}
