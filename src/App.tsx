import { useEffect, useRef, useState } from "react";
import { NotesInput } from "./components/NotesInput";
import { PlaybackControls } from "./components/PlaybackControls";
import { TimeSignatureInput } from "./components/TimeSignatureInput";
import { useAudioEngine } from "./hooks/useAudioEngine";
import { useCopyToClipboard } from "./hooks/useCopyToClipboard";
import { useUrlParams } from "./hooks/useUrlParams";

interface SavedState {
  bpm: number;
  timeSignature: {
    beats: number;
    subdivision: number;
  };
  notesText: string;
  isLooping: boolean;
  pitchShift: number;
}

const STORAGE_KEY = "nanodaw-state";

function App() {
  const [bpm, setBpm] = useState(120);
  const [timeSignature, setTimeSignature] = useState({
    beats: 4,
    subdivision: 4,
  });
  const [notesText, setNotesText] = useState("");
  const isFirstMount = useRef(true);
  const { getParams, setParams } = useUrlParams();
  const { copyToClipboard, isCopied } = useCopyToClipboard();
  const {
    isPlaying,
    isLooping,
    setIsLooping,
    setBPM,
    setTimeSignature: setAudioTimeSignature,
    play,
    stop,
    togglePlayback,
    shiftPitch,
    pitchShift,
    getShiftedNotes,
  } = useAudioEngine();

  // キーボードイベントリスナー
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Cmd+Enter (Mac) または Ctrl+Enter (Windows)
      if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
        event.preventDefault();
        togglePlayback(notesText);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [notesText, togglePlayback]);

  // URLパラメータから状態を復元
  useEffect(() => {
    if (!isFirstMount.current) return;

    const params = getParams();
    if (params.bpm) {
      const newBpm = Number(params.bpm);
      if (!isNaN(newBpm)) {
        setBpm(newBpm);
        setBPM(newBpm);
      }
    }
    if (params.beats) {
      const newBeats = Number(params.beats);
      if (!isNaN(newBeats)) {
        setTimeSignature((prev) => ({ ...prev, beats: newBeats }));
        setAudioTimeSignature(newBeats, timeSignature.subdivision);
      }
    }
    if (params.subdivision) {
      const newSubdivision = Number(params.subdivision);
      if (!isNaN(newSubdivision)) {
        setTimeSignature((prev) => ({ ...prev, subdivision: newSubdivision }));
        setAudioTimeSignature(timeSignature.beats, newSubdivision);
      }
    }
    if (params.notes) {
      setNotesText(decodeURIComponent(params.notes));
    }
    if (params.isLooping) {
      setIsLooping(params.isLooping === "true");
    }
    if (params.pitchShift) {
      const newPitchShift = Number(params.pitchShift);
      if (!isNaN(newPitchShift)) {
        for (let i = 0; i < newPitchShift; i++) {
          shiftPitch(1);
        }
      }
    }

    // ローカルストレージから状態を復元
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      try {
        const state: SavedState = JSON.parse(savedState);
        setBpm(state.bpm);
        setTimeSignature(state.timeSignature);
        setNotesText(state.notesText);
        setIsLooping(state.isLooping);
        setBPM(state.bpm);
        setAudioTimeSignature(
          state.timeSignature.beats,
          state.timeSignature.subdivision
        );
        if (state.pitchShift) {
          for (let i = 0; i < state.pitchShift; i++) {
            shiftPitch(1);
          }
        }
      } catch (error) {
        console.error("Failed to restore state:", error);
      }
    }
    isFirstMount.current = false;
  }, []);

  // 状態を保存
  useEffect(() => {
    const state: SavedState = {
      bpm,
      timeSignature,
      notesText,
      isLooping,
      pitchShift,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

    // URLパラメータを更新
    setParams({
      bpm: bpm.toString(),
      beats: timeSignature.beats.toString(),
      subdivision: timeSignature.subdivision.toString(),
      notes: encodeURIComponent(notesText),
      isLooping: isLooping.toString(),
      pitchShift: pitchShift.toString(),
    });
  }, [bpm, timeSignature, notesText, isLooping, pitchShift]);

  const handleBPMChange = (newBpm: number) => {
    setBpm(newBpm);
    setBPM(newBpm);
  };

  const handleBeatsChange = (beats: number) => {
    setTimeSignature((prev) => ({ ...prev, beats }));
    setAudioTimeSignature(beats, timeSignature.subdivision);
  };

  const handleSubdivisionChange = (subdivision: number) => {
    setTimeSignature((prev) => ({ ...prev, subdivision }));
    setAudioTimeSignature(timeSignature.beats, subdivision);
  };

  const handlePlay = () => {
    play(notesText);
  };

  const handleCopyUrl = () => {
    copyToClipboard(window.location.href);
  };

  const shiftedNotes = getShiftedNotes(notesText);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center">
      <div className="flex-1 flex items-center justify-center py-6">
        <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow-lg rounded-3xl p-6 sm:p-8 lg:p-12">
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900">NanoDAW</h1>
                <button
                  type="button"
                  onClick={handleCopyUrl}
                  className="inline-flex items-center px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  {isCopied ? "Copied!" : "Copy URL"}
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="bpm"
                    className="block text-sm font-medium text-gray-700"
                  >
                    BPM
                  </label>
                  <input
                    id="bpm"
                    type="number"
                    value={bpm}
                    onChange={(e) => handleBPMChange(Number(e.target.value))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    min="20"
                    max="240"
                  />
                </div>

                <TimeSignatureInput
                  beats={timeSignature.beats}
                  subdivision={timeSignature.subdivision}
                  onBeatsChange={handleBeatsChange}
                  onSubdivisionChange={handleSubdivisionChange}
                />

                <NotesInput
                  value={notesText}
                  onChange={setNotesText}
                  shiftedValue={shiftedNotes}
                />

                <div className="flex items-center space-x-4">
                  <button
                    type="button"
                    onClick={() => shiftPitch(-1)}
                    className="px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    -1
                  </button>
                  <span className="text-sm font-medium text-gray-700">
                    {pitchShift > 0 ? `+${pitchShift}` : pitchShift} semitones
                  </span>
                  <button
                    type="button"
                    onClick={() => shiftPitch(1)}
                    className="px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    +1
                  </button>
                </div>

                <PlaybackControls
                  isPlaying={isPlaying}
                  isLooping={isLooping}
                  onLoopChange={setIsLooping}
                  onPlay={handlePlay}
                  onStop={stop}
                  isPlayDisabled={isPlaying || !notesText.trim()}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
