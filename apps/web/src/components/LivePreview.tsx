// A little "browser window" that shows what a web page strike's HTML (or, for Level 6, a React
// component) actually looks like, live, as you type. It is a SEPARATE, always-visible iframe
// from the one used to run tests (see runIframeTests.ts / runReactTests.ts), so running tests
// never flickers or resets whatever is on screen. Same sandbox as the test iframe:
// allow-scripts only, nothing else.
import { useEffect, useRef, useState } from "react";
import { buildPreviewDoc } from "../runner/buildIframeDoc";

const DEBOUNCE_MS = 300;

export function LivePreview({
  html,
  buildDoc = buildPreviewDoc,
}: {
  html: string;
  // Level 6 passes buildReactPreviewDoc instead, so the preview also loads the React/Babel
  // vendor script. Defaults to the plain Level 4 builder.
  buildDoc?: (code: string) => string;
}) {
  const [doc, setDoc] = useState(() => buildDoc(html));
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false; // show the starter code immediately, no waiting on first render
      return;
    }
    const timer = setTimeout(() => setDoc(buildDoc(html)), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [html, buildDoc]);

  return (
    <iframe
      className="live-preview"
      title="Your page"
      sandbox="allow-scripts"
      srcDoc={doc}
    />
  );
}
