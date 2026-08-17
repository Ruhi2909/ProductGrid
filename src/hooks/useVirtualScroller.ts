import { useState, useRef, useCallback, useEffect } from 'react';

export const ROW_HEIGHT = 56; // px — keep in sync with CSS .grid-row height
const OVERSCAN = 3; // extra rows above and below the visible window

export interface VirtualItem {
  /** 0-based index into the products array */
  index: number;
  /** Absolute pixel offset from top of the scroll container */
  top: number;
}

export interface UseVirtualScrollerResult {
  /** Only the rows currently in (or near) the viewport */
  virtualItems: VirtualItem[];
  /** Total pixel height of all rows — used to size the spacer div */
  totalHeight: number;
  /** Attach to the scrollable container's onScroll */
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  /** Attach as ref to the scrollable container */
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export function useVirtualScroller(
  itemCount: number,
  onNearBottom?: () => void,
): UseVirtualScrollerResult {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(600);

  // Measure container height via ResizeObserver so it stays correct on resize
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      setContainerHeight(entries[0].contentRect.height);
    });
    ro.observe(el);
    setContainerHeight(el.clientHeight);
    return () => ro.disconnect();
  }, []);

  const totalHeight = itemCount * ROW_HEIGHT;

  const onScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const el = e.currentTarget;
      setScrollTop(el.scrollTop);

      if (onNearBottom) {
        const distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
        if (distanceToBottom < ROW_HEIGHT * 5) {
          onNearBottom();
        }
      }
    },
    [onNearBottom],
  );

  // Compute which rows are visible (plus overscan buffer)
  const startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN);
  const endIndex = Math.min(
    itemCount - 1,
    Math.ceil((scrollTop + containerHeight) / ROW_HEIGHT) + OVERSCAN,
  );

  const virtualItems: VirtualItem[] = [];
  for (let i = startIndex; i <= endIndex; i++) {
    virtualItems.push({ index: i, top: i * ROW_HEIGHT });
  }

  return { virtualItems, totalHeight, onScroll, containerRef };
}
