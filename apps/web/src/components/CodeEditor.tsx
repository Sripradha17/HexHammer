// The Monaco code editor. The AI-style suggestion features are turned OFF on purpose:
// the whole point is that I type everything by hand.
import Editor from "@monaco-editor/react";

interface CodeEditorProps {
  value: string;
  onChange: (code: string) => void;
  height?: string;
}

export function CodeEditor({ value, onChange, height = "420px" }: CodeEditorProps) {
  return (
    <Editor
      height={height}
      language="javascript"
      theme="vs-dark"
      value={value}
      onChange={(newValue) => onChange(newValue ?? "")}
      options={{
        fontSize: 16,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        tabSize: 2,
        // No helpers that write code for me:
        quickSuggestions: false,
        suggestOnTriggerCharacters: false,
        acceptSuggestionOnEnter: "off",
        inlineSuggest: { enabled: false },
        parameterHints: { enabled: false },
        wordBasedSuggestions: "off",
      }}
    />
  );
}
