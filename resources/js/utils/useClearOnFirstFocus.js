import { useRef } from "react";

export default function useClearOnFirstFocus() {
  const clearedMap = useRef(new WeakSet());
  return {
    onFocusOnce: (setter) => () => {
      if (!clearedMap.current.has(setter)) {
        setter("");
        clearedMap.current.add(setter);
      }
    }
  };
}
