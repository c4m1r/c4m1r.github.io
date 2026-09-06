import { cx } from "@twind/core";
import { Children } from "..";
import { useLayoutEffect, useRef } from "preact/hooks";

export const Header = (props: {
  children?: Children;
  class?: string;
  fixed?: boolean;
  transparent?: boolean;
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const update = () => {
      const height = ref.current?.clientHeight;
      const root = ref.current?.parentElement as HTMLElement;
      root.style.setProperty("--header-height", `${height}px`);
    };
    const observer = new ResizeObserver(update);
    observer.observe(ref.current!);
    return () => observer.disconnect();
  }, []);

  return (
    <header
      ref={ref}
      class={cx(
        "absolute top-0 z-20",
        "w-full row aic pt-safe-t pb-2",
        !props.transparent && "bg-neutral-900/80 backdrop-blur-lg",
        !props.transparent && "border-b border-white/10",
        "text-sm text-neutral-200",
        props.class
      )}
    >
      {props.children}
    </header>
  );
};
