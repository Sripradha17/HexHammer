import type { ReactNode } from "react";

// What a screen shows when there is nothing yet. Always says WHY it is empty and what to do next,
// instead of a blank area.
export function EmptyState({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="hh-empty">
      <h3 className="hh-empty__title">{title}</h3>
      {children && <p>{children}</p>}
      {action}
    </div>
  );
}
