import { useCallback } from "react";

interface Params {
  bpm?: string;
  beats?: string;
  subdivision?: string;
  notes?: string;
  isLooping?: string;
  pitchShift?: string;
}

export function useUrlParams() {
  const getParams = useCallback((): Params => {
    const params = new URLSearchParams(window.location.search);
    return {
      bpm: params.get("bpm") || undefined,
      beats: params.get("beats") || undefined,
      subdivision: params.get("subdivision") || undefined,
      notes: params.get("notes") || undefined,
      isLooping: params.get("isLooping") || undefined,
      pitchShift: params.get("pitchShift") || undefined,
    };
  }, []);

  const setParams = useCallback((params: Partial<Params>) => {
    const currentParams = new URLSearchParams(window.location.search);
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined) {
        currentParams.delete(key);
      } else {
        currentParams.set(key, value);
      }
    });
    const newUrl = `${window.location.pathname}${
      currentParams.toString() ? `?${currentParams.toString()}` : ""
    }`;
    window.history.replaceState({}, "", newUrl);
  }, []);

  return { getParams, setParams };
}
