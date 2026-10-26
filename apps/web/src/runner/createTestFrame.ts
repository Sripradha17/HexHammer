// Makes the real sandboxed iframe used to run a web page strike's tests.
// sandbox="allow-scripts" and nothing else: the page inside can run its own JavaScript, but it
// cannot read cookies or storage, reach this parent page, submit a form anywhere, navigate the
// top window, or open a popup. Kept in its own file so tests never need a real iframe.
import type { IframeLike } from "./runIframeTests";
import type { RunResult } from "./execute";

export function createTestFrame(): IframeLike {
  const frame = document.createElement("iframe");
  frame.sandbox.add("allow-scripts");
  frame.title = "Checking your page";
  // Off-screen, not display:none: a hidden iframe can be throttled or skipped by the browser,
  // but one that is merely positioned off the visible page still runs normally.
  frame.style.position = "fixed";
  frame.style.left = "-9999px";
  frame.style.width = "1px";
  frame.style.height = "1px";
  document.body.appendChild(frame);

  const like: IframeLike = {
    setSrcdoc(html) {
      frame.srcdoc = html;
    },
    remove() {
      window.removeEventListener("message", onMessage);
      frame.remove();
    },
    onResult: null,
    onError: null,
  };

  // Only trust a message that really came from THIS iframe (its origin is "null", since it has
  // no allow-same-origin, so we check the source window instead of the usual origin string).
  function onMessage(event: MessageEvent) {
    if (event.source !== frame.contentWindow) return;
    const data = event.data as (RunResult & { hexhammer?: boolean }) | undefined;
    if (!data || data.hexhammer !== true) return;
    like.onResult?.({
      results: data.results,
      consoleLines: data.consoleLines,
      error: data.error,
      timedOut: false,
    });
  }
  window.addEventListener("message", onMessage);

  return like;
}
