import type { TextareaHTMLAttributes } from "react";

// I will rebuild this by hand later.
// A writing box pressed into the page. It is a normal <textarea>, just styled.
// Always give it a label (aria-label or a <label>) so screen readers know what it is for.
export function TextArea({
  className = "",
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`hh-textarea ${className}`} {...rest} />;
}
