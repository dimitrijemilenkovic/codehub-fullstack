import { useEffect, useRef, useState } from "react";

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const v = localStorage.getItem(key);
      return v
        ? JSON.parse(v)
        : typeof initialValue === "function"
        ? initialValue()
        : initialValue;
    } catch {
      return typeof initialValue === "function" ? initialValue() : initialValue;
    }
  });
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e){
        console.log(e)
    }
  }, [key, value]);
  return [value, setValue];
}
