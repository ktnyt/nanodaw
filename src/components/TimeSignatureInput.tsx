interface TimeSignatureInputProps {
  beats: number;
  subdivision: number;
  onBeatsChange: (beats: number) => void;
  onSubdivisionChange: (subdivision: number) => void;
}

export function TimeSignatureInput({
  beats,
  subdivision,
  onBeatsChange,
  onSubdivisionChange,
}: TimeSignatureInputProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label
          htmlFor="beats"
          className="block text-sm font-medium text-gray-700"
        >
          Beats
        </label>
        <input
          id="beats"
          type="number"
          value={beats}
          onChange={(e) => onBeatsChange(Number(e.target.value))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          min="1"
          max="16"
        />
      </div>
      <div>
        <label
          htmlFor="subdivision"
          className="block text-sm font-medium text-gray-700"
        >
          Subdivision
        </label>
        <input
          id="subdivision"
          type="number"
          value={subdivision}
          onChange={(e) => onSubdivisionChange(Number(e.target.value))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          min="1"
          max="16"
        />
      </div>
    </div>
  );
}
