import { cx } from "@twind/core";
import { Children } from "..";
import { useRef, useLayoutEffect } from "preact/hooks";
import { CSSProperties } from "preact/compat";

export const Footer = (props: {
  children: Children;
  class?: string;
  fixed?: boolean;
  transparent?: boolean;
  style?: CSSProperties;
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const update = () => {
      const height = ref.current?.clientHeight;
      const root = ref.current?.parentElement as HTMLElement;
      root.style.setProperty("--footer-height", `${height}px`);
    };
    const observer = new ResizeObserver(update);
    observer.observe(ref.current!);
    return () => observer.disconnect();
  }, []);

  return (
    <footer
      ref={ref}
      class={cx(
        "absolute bottom-0",
        "w-full col aic pb-4",
        !props.transparent && "bg-neutral-900/50 backdrop-blur-lg",
        !props.transparent && "border-t border-white/5",
        "text-neutral-400",
        props.class
      )}
      style={props.style}
    >
      {props.children}
    </footer>
  );
};
