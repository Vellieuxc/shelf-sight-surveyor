
import { useEffect, useState, RefObject } from 'react';

interface ResizeObserverEntry {
  contentRect: DOMRectReadOnly;
  target: Element;
}

interface DimensionsState {
  width: number;
  height: number;
}

export function useResizeObserver(ref: RefObject<Element>): DimensionsState {
  const [dimensions, setDimensions] = useState<DimensionsState>({ width: 0, height: 0 });

  useEffect(() => {
    const observeTarget = ref.current;
    if (!observeTarget) return;

    const resizeObserver = new ResizeObserver((entries: ResizeObserverEntry[]) => {
      if (!Array.isArray(entries) || !entries.length) return;

      const entry = entries[0];
      const { width, height } = entry.contentRect;
      
      setDimensions({ width, height });
    });

    resizeObserver.observe(observeTarget);

    return () => {
      resizeObserver.disconnect();
    };
  }, [ref]);

  return dimensions;
}
