// Makes the Monaco editor load from our own node_modules (no CDN, works offline).
import { loader } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";
import htmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker";
import cssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker";
import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";

// Monaco does some work in its own workers. Tell it where to find them.
// Each language with smart features needs ITS OWN worker. Before the HTML, CSS and JSON workers were
// listed here, the HTML editor (Level 4) fell back to the generic worker and threw
// "Cannot read properties of undefined (reading 'toUrl')" in the console.
self.MonacoEnvironment = {
  getWorker(_workerId: string, label: string) {
    if (label === "typescript" || label === "javascript") return new tsWorker();
    if (label === "html" || label === "handlebars" || label === "razor") return new htmlWorker();
    if (label === "css" || label === "scss" || label === "less") return new cssWorker();
    if (label === "json") return new jsonWorker();
    return new editorWorker();
  },
};

loader.config({ monaco });
