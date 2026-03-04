import { useCallback, useRef, useState } from "react";

export function useAutoSave(onSave, delay = 900) {
  const [status, setStatus] = useState("idle"); // idle | saving | saved | error
  const timer = useRef(null);

  const save = useCallback((data) => {
    setStatus("saving");
    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      try {
        await onSave(data);
        setStatus("saved");
        setTimeout(() => setStatus("idle"), 2500);
      } catch {
        setStatus("error");
        setTimeout(() => setStatus("idle"), 3000);
      }
    }, delay);
  }, [onSave, delay]);

  return { save, status };
}
