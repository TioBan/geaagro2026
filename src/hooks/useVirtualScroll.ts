import { useState, useEffect, useRef, useCallback, useMemo, type RefObject } from 'react';

export interface UseVirtualScrollOptions {
  /** Total number of items in the list */
  totalCount: number;
  /** Estimated or fixed height of a single row in pixels */
  estimateRowHeight: number;
  /** Number of columns for grid layouts (default: 1 for list) */
  columns?: number;
  /** Number of extra rows to render above and below visible area */
  overscan?: number;
  /** Custom scroll container ref; if not provided, hook uses internal containerRef */
  parentRef?: RefObject<HTMLElement | null>;
}

export interface VirtualRow {
  index: number;
  offsetTop: number;
  height: number;
  itemIndices: number[];
}

export interface UseVirtualScrollReturn {
  containerRef: RefObject<HTMLDivElement | null>;
  virtualRows: VirtualRow[];
  totalHeight: number;
  startIndex: number;
  endIndex: number;
  visibleCount: number;
  totalRows: number;
  scrollTop: number;
  isScrolling: boolean;
  scrollToIndex: (itemIndex: number, align?: 'start' | 'center' | 'end') => void;
  scrollToTop: () => void;
  containerHeight: number;
  containerWidth: number;
  domSavingsPercentage: number;
}

export function useVirtualScroll({
  totalCount,
  estimateRowHeight,
  columns = 1,
  overscan = 2,
}: UseVirtualScrollOptions): UseVirtualScrollReturn {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(600);
  const [containerWidth, setContainerWidth] = useState(1024);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // 1. Calculate number of rows
  const safeColumns = Math.max(1, columns);
  const totalRows = Math.ceil(totalCount / safeColumns);
  const totalHeight = totalRows * estimateRowHeight;

  // 2. Measure container dimensions via ResizeObserver
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Initial measurement
    if (el.clientHeight > 0) setContainerHeight(el.clientHeight);
    if (el.clientWidth > 0) setContainerWidth(el.clientWidth);

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.height > 0) {
          setContainerHeight(entry.contentRect.height);
        }
        if (entry.contentRect.width > 0) {
          setContainerWidth(entry.contentRect.width);
        }
      }
    });

    resizeObserver.observe(el);
    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // 3. Optimized scroll listener using requestAnimationFrame
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleScroll = () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      animationFrameRef.current = requestAnimationFrame(() => {
        if (!el) return;
        setScrollTop(el.scrollTop);
        setIsScrolling(true);

        if (scrollTimeoutRef.current) {
          window.clearTimeout(scrollTimeoutRef.current);
        }
        scrollTimeoutRef.current = window.setTimeout(() => {
          setIsScrolling(false);
        }, 150);
      });
    };

    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', handleScroll);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  // 4. Calculate visible row indices and overscan boundaries
  const { startRowIndex, endRowIndex, virtualRows, startIndex, endIndex } = useMemo(() => {
    if (totalCount === 0 || totalRows === 0) {
      return {
        startRowIndex: 0,
        endRowIndex: 0,
        virtualRows: [],
        startIndex: 0,
        endIndex: 0,
      };
    }

    // Determine first and last visible rows based on scrollTop and container height
    const rawStartRow = Math.floor(scrollTop / estimateRowHeight);
    const visibleRowCount = Math.ceil(containerHeight / estimateRowHeight);
    const rawEndRow = rawStartRow + visibleRowCount;

    // Apply overscan
    const boundedStartRow = Math.max(0, rawStartRow - overscan);
    const boundedEndRow = Math.min(totalRows - 1, rawEndRow + overscan);

    const rows: VirtualRow[] = [];
    for (let r = boundedStartRow; r <= boundedEndRow; r++) {
      const rowItemIndices: number[] = [];
      for (let c = 0; c < safeColumns; c++) {
        const itemIdx = r * safeColumns + c;
        if (itemIdx < totalCount) {
          rowItemIndices.push(itemIdx);
        }
      }

      if (rowItemIndices.length > 0) {
        rows.push({
          index: r,
          offsetTop: r * estimateRowHeight,
          height: estimateRowHeight,
          itemIndices: rowItemIndices,
        });
      }
    }

    const calculatedStartIndex = boundedStartRow * safeColumns;
    const calculatedEndIndex = Math.min(totalCount - 1, (boundedEndRow + 1) * safeColumns - 1);

    return {
      startRowIndex: boundedStartRow,
      endRowIndex: boundedEndRow,
      virtualRows: rows,
      startIndex: calculatedStartIndex,
      endIndex: calculatedEndIndex,
    };
  }, [scrollTop, containerHeight, estimateRowHeight, overscan, totalCount, totalRows, safeColumns]);

  // 5. Scroll to a specific item index
  const scrollToIndex = useCallback(
    (itemIndex: number, align: 'start' | 'center' | 'end' = 'start') => {
      const el = containerRef.current;
      if (!el || totalCount === 0) return;

      const targetIndex = Math.max(0, Math.min(totalCount - 1, itemIndex));
      const targetRow = Math.floor(targetIndex / safeColumns);
      const targetTop = targetRow * estimateRowHeight;

      let scrollDestination = targetTop;
      if (align === 'center') {
        scrollDestination = targetTop - containerHeight / 2 + estimateRowHeight / 2;
      } else if (align === 'end') {
        scrollDestination = targetTop - containerHeight + estimateRowHeight;
      }

      el.scrollTo({
        top: Math.max(0, scrollDestination),
        behavior: 'smooth',
      });
    },
    [totalCount, safeColumns, estimateRowHeight, containerHeight]
  );

  // 6. Scroll to top shortcut
  const scrollToTop = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  // 7. Calculate DOM savings percentage
  const renderedItemsCount = virtualRows.reduce((acc: number, r: VirtualRow) => acc + r.itemIndices.length, 0);
  const domSavingsPercentage = totalCount > 0
    ? Math.max(0, Math.round(((totalCount - renderedItemsCount) / totalCount) * 1000) / 10)
    : 0;

  return {
    containerRef,
    virtualRows,
    totalHeight,
    startIndex,
    endIndex,
    visibleCount: renderedItemsCount,
    totalRows,
    scrollTop,
    isScrolling,
    scrollToIndex,
    scrollToTop,
    containerHeight,
    containerWidth,
    domSavingsPercentage,
  };
}
