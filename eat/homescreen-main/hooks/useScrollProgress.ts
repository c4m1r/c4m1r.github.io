import { useRef, useState, useEffect } from "preact/hooks";

export const useScrollProgress = () => {
  // Ref for the scrollable element
  const ref = useRef<HTMLDivElement>(null);
  // State for progress
  const [progress, setProgress] = useState({
    percent: 0,
    page: {
      current: 1,
      total: 1,
    },
  });
  // Subscribe to events that trigger update of state
  useEffect(() => {
    const el = ref.current;
    if (el) {
      const update = () => {
        const progress = el.scrollLeft / (el.scrollWidth - el.clientWidth);
        const pageCount = Math.round(el.scrollWidth / el.clientWidth);
        setProgress({
          percent: progress * 100,
          page: {
            current: Math.round(progress / (1 / pageCount)) || 1,
            total: pageCount,
          },
        });
      };
      // Update progress on parent element resizing
      const resizeObserver = new ResizeObserver(update);
      resizeObserver.observe(el);
      // Update progress on scroll
      el.addEventListener("scroll", update);
      return () => {
        resizeObserver.disconnect();
        el.removeEventListener("scroll", update);
      };
    }
  }, [ref]);
  // Return the ref and state
  return { ref, ...progress };
};
