import { useEffect, useRef, useState } from "react";
import * as Tone from "tone";

interface Note {
  name: string;
  duration: number;
}

interface TimeSignature {
  beats: number;
  subdivision: number;
}

export function useAudioEngine() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [bpm, setBpm] = useState(120);
  const [pitchShift, setPitchShift] = useState(0);
  const [timeSignature, setTimeSignatureState] = useState<TimeSignature>({
    beats: 4,
    subdivision: 4,
  });
  const synth = useRef<Tone.Synth | null>(null);
  const transport = useRef<ReturnType<typeof Tone.getTransport> | null>(null);
  const part = useRef<Tone.Part | null>(null);

  useEffect(() => {
    synth.current = new Tone.Synth().toDestination();
    transport.current = Tone.getTransport();
    transport.current.on("stop", () => {
      setIsPlaying(false);
    });

    return () => {
      synth.current?.dispose();
      if (part.current) {
        part.current.dispose();
      }
    };
  }, []);

  useEffect(() => {
    if (transport.current) {
      transport.current.loop = isLooping;
    }
  }, [isLooping]);

  const setBPM = (newBpm: number) => {
    setBpm(newBpm);
    if (transport.current) {
      transport.current.bpm.value = newBpm;
    }
  };

  const setTimeSignature = (beats: number, subdivision: number) => {
    setTimeSignatureState({ beats, subdivision });
    if (transport.current) {
      transport.current.timeSignature = [beats, subdivision];
    }
  };

  const parseNoteString = (noteString: string): Note => {
    const match = noteString.match(/^([A-G]#?b?)(\d+)(?:x(\d+))?$/);
    if (!match) {
      throw new Error('Invalid note format. Use format like "C4" or "C4x2"');
    }

    const [, name, octave, duration] = match;
    return {
      name: `${name}${octave}`,
      duration: duration ? Number.parseInt(duration, 10) : 1,
    };
  };

  const calculateNoteDuration = (duration: number): number => {
    // 4分音符の長さを基準に計算
    // 例: BPM=120の場合、4分音符は0.5秒
    const quarterNoteDuration = 60 / bpm;
    // 拍子に基づいて音の長さを調整
    // 例: 4/4拍子の場合、1拍 = 4分音符
    const beatDuration = quarterNoteDuration * (4 / timeSignature.subdivision);
    return beatDuration * duration;
  };

  const shiftNote = (note: string, semitones: number): string => {
    const notes = [
      "C",
      "Db",
      "D",
      "Eb",
      "E",
      "F",
      "Gb",
      "G",
      "Ab",
      "A",
      "Bb",
      "B",
    ];
    const match = note.match(/^([A-G]#?b?)(\d+)$/);
    if (!match) return note;

    const [, name, octave] = match;
    const noteIndex = notes.indexOf(name);
    if (noteIndex === -1) return note;

    const newIndex = (noteIndex + semitones + 12) % 12;
    const octaveShift = Math.floor((noteIndex + semitones) / 12);
    const newOctave = Number(octave) + octaveShift;

    return `${notes[newIndex]}${newOctave}`;
  };

  const getShiftedNotes = (notesText: string): string => {
    if (!notesText.trim() || pitchShift === 0) return notesText;

    try {
      const noteStrings = notesText.split(/\s+/).filter(Boolean);
      const notes = noteStrings.map((noteString) =>
        parseNoteString(noteString)
      );
      return notes
        .map((note) => {
          const shiftedName = shiftNote(note.name, pitchShift);
          return note.duration > 1
            ? `${shiftedName}x${note.duration}`
            : shiftedName;
        })
        .join(" ");
    } catch (error) {
      return notesText;
    }
  };

  const play = (notesText: string) => {
    if (!synth.current || !transport.current) return;
    try {
      const noteStrings = notesText.split(/\s+/).filter(Boolean);
      const notes = noteStrings.map(
        (noteString) =>
          parseNoteString(noteString) ?? {
            name: "",
            duration: 0,
          }
      );

      if (part.current) {
        part.current.dispose();
      }

      // 各ノートの開始時間を計算
      const events = notes.map((note, index) => {
        const startTime = notes
          .slice(0, index)
          .reduce((sum, n) => sum + calculateNoteDuration(n.duration), 0);
        return {
          time: startTime,
          note: pitchShift !== 0 ? shiftNote(note.name, pitchShift) : note.name,
          duration: calculateNoteDuration(note.duration),
        };
      });

      part.current = new Tone.Part((time, event) => {
        synth.current?.triggerAttackRelease(event.note, event.duration, time);
      }, events).start(0);

      part.current.loop = isLooping;
      transport.current.start();
      setIsPlaying(true);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Invalid note format");
    }
  };

  const stop = () => {
    if (!transport.current) return;
    transport.current.stop();
    setIsPlaying(false);
  };

  const togglePlayback = (notesText: string) => {
    if (isPlaying) {
      stop();
    } else {
      play(notesText);
    }
  };

  const shiftPitch = (semitones: number) => {
    setPitchShift((prev) => prev + semitones);
  };

  return {
    isPlaying,
    isLooping,
    setIsLooping,
    setBPM,
    setTimeSignature,
    play,
    stop,
    togglePlayback,
    shiftPitch,
    pitchShift,
    getShiftedNotes,
  };
}
