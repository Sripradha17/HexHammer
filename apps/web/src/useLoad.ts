// A tiny hook for "load some data when the page opens", with loading, error and reload.
// (Real apps often use a library for this; it is small enough to write and understand by hand.)
import { useCallback, useEffect, useState } from "react";

export function useLoad<T>(load: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(load, deps);

  useEffect(() => {
    let cancelled = false; // ignore answers that arrive after the page moved on
    setLoading(true);
    setError("");
    run()
      .then((value) => !cancelled && setData(value))
      .catch((e: Error) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [run, version]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);
  return { data, error, loading, reload, setData };
}
