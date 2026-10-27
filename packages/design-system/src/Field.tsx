import { useId, type ReactNode } from "react";

// A form row: a visible label, the control, an optional hint and an error message.
// The control is passed as a function, so Field can connect the label, hint and error to it by id
// (screen readers then read all three together).
//
// <Field label="Title" error={errors.title}>{(props) => <input className="hh-input" {...props} />}</Field>
interface FieldProps {
  label: ReactNode;
  hint?: ReactNode;
  error?: string;
  children: (props: { id: string; "aria-describedby"?: string; "aria-invalid"?: boolean }) => ReactNode;
}

export function Field({ label, hint, error, children }: FieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
  return (
    <div className={`hh-field ${error ? "hh-field--invalid" : ""}`}>
      <label className="hh-field__label" htmlFor={id}>
        {label}
      </label>
      {children({ id, "aria-describedby": describedBy, "aria-invalid": error ? true : undefined })}
      {hint && (
        <span id={hintId} className="hh-field__hint">
          {hint}
        </span>
      )}
      {error && (
        <span id={errorId} className="hh-field__error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
