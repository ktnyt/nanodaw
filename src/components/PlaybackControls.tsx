interface PlaybackControlsProps {
  isPlaying: boolean;
  isLooping: boolean;
  onLoopChange: (isLooping: boolean) => void;
  onPlay: () => void;
  onStop: () => void;
  isPlayDisabled: boolean;
}

export function PlaybackControls({
  isPlaying,
  isLooping,
  onLoopChange,
  onPlay,
  onStop,
  isPlayDisabled,
}: PlaybackControlsProps) {
  return (
    <div className="flex items-center justify-between mt-6">
      <div className="flex items-center">
        <input
          type="checkbox"
          id="loop"
          checked={isLooping}
          onChange={(e) => onLoopChange(e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="loop" className="ml-2 block text-sm text-gray-900">
          Loop
        </label>
      </div>

      <div className="flex space-x-4">
        <button
          type="button"
          onClick={onPlay}
          disabled={isPlayDisabled}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
        >
          Play
        </button>
        <button
          type="button"
          onClick={onStop}
          disabled={!isPlaying}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
        >
          Stop
        </button>
      </div>
    </div>
  );
}
