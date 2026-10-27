import type { ButtonHTMLAttributes } from "react";

// A toggle chip for filters. It is a real button with aria-pressed, so a screen reader says
// "Security, toggle button, pressed" instead of relying on color alone.
interface ChipProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  pressed: boolean;
  onToggle: () => void;
}

export function Chip({ pressed, onToggle, className = "", ...rest }: ChipProps) {
  return <button type="button" className={`hh-chip ${className}`} aria-pressed={pressed} onClick={onToggle} {...rest} />;
}
