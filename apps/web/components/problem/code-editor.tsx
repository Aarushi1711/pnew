interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function CodeEditor({ value, onChange, disabled }: CodeEditorProps) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      spellCheck={false}
      rows={16}
      className="block w-full rounded-xl border border-input bg-background px-4 py-3 font-mono text-sm leading-relaxed text-foreground outline-none transition-colors focus:border-ring focus:ring-3 focus:ring-ring/50 disabled:opacity-60"
    />
  );
}
