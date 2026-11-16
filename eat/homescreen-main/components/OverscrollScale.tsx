import { useRef, useEffect } from "preact/hooks";
import { Children } from "..";

export const OverscrollScale = (props: { children: Children }) => {
  const ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const elem = ref.current;
    if (elem) {
      const parent = elem.parentElement;
      const spring = (e: WheelEvent) => {
        if (elem) {
          const target = e.currentTarget as HTMLElement;
          const scale =
            target.scrollTop < 0
              ? 1 + Math.abs(target.scrollTop) / elem?.clientHeight
              : 1;
          elem.style.transformOrigin = `bottom center`;
          elem.style.transform = `scale(${scale})`;
        }
      };
      parent?.addEventListener("scroll", spring as EventListener);
      return () =>
        parent?.removeEventListener("scroll", spring as EventListener);
    }
  }, []);

  return (
    <div ref={ref} class="relative z-10">
      {props.children}
    </div>
  );
};
