import { useEffect, useRef } from "react";

export function useAutoResize() {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const adjustHeight = () => {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    };

    // 初期表示時と値が変更された時に高さを調整
    adjustHeight();
    textarea.addEventListener("input", adjustHeight);

    return () => {
      textarea.removeEventListener("input", adjustHeight);
    };
  }, [textareaRef.current?.value]); // valueが変更された時にも高さを調整

  return textareaRef;
}
