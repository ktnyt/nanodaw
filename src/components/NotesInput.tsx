import { useAutoResize } from "../hooks/useAutoResize";

interface NotesInputProps {
  value: string;
  onChange: (value: string) => void;
  shiftedValue?: string;
}

export function NotesInput({ value, onChange, shiftedValue }: NotesInputProps) {
  const textareaRef = useAutoResize();

  return (
    <div className="space-y-2">
      <label
        htmlFor="notes"
        className="block text-sm font-medium text-gray-700"
      >
        Notes
      </label>
      <div className="space-y-2">
        <textarea
          ref={textareaRef}
          id="notes"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 resize-none overflow-hidden"
          placeholder="C4 D4 E4 F4"
        />
        {shiftedValue && shiftedValue !== value && (
          <div className="text-sm text-gray-500">Shifted: {shiftedValue}</div>
        )}
      </div>
    </div>
  );
}
