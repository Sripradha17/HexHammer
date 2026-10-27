// What a page shows while it waits, or when something went wrong (always with a way out).
import { Button } from "@hexhammer/design-system";

export function Loading({ label = "Loading" }: { label?: string }) {
  return (
    <div className="page-state" role="status">
      <span className="spinner" aria-hidden="true" />
      <span>{label}…</span>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="page-state page-state--error" role="alert">
      <p>
        <strong>Something went wrong.</strong> {message}
      </p>
      {onRetry && (
        <Button variant="secondary" size="small" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
