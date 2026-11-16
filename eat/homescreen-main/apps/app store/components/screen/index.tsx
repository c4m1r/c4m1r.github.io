import { apply, css, cx } from "@twind/core";
import { Children, childOfType } from "../../utils";
import { useRef } from "preact/hooks";

export const Header = (props: { children?: Children; class?: string }) => {
  return (
    <header class={cx(apply`row pt-safe-t z-10`, props.class)}>
      {props.children}
    </header>
  );
};

export const Body = (props: { children?: Children; class?: string }) => {
  return <div class={cx(apply`flex-1 col`, props.class)}>{props.children}</div>;
};

export const Footer = (props: { children?: Children; class?: string }) => {
  // const ref = useRef<HTMLDivElement>(null);

  // useLayoutEffect(() => {
  //   const update = () => {
  //     const height = ref.current?.clientHeight;
  //     const root = ref.current?.parentElement as HTMLElement;
  //     const closest = ref.current?.closest("footer.sticky") as HTMLElement;
  //     console.log({ closest });
  //     if (closest) {
  //       root.style.setProperty("--footer-height", `${height}px`);
  //     }
  //   };
  //   const observer = new ResizeObserver(update);
  //   observer.observe(ref.current!);
  //   return () => observer.disconnect();
  // }, []);

  return <footer class={cx(apply`row`, props.class)}>{props.children}</footer>;
};

export const Screen = (props: {
  children?: Children;
  class?: string;
  gutter?: string;
  gap?: string;
}) => {
  const header = childOfType(props.children, Header);
  const body = childOfType(props.children, Body);
  const footer = childOfType(props.children, Footer);
  return (
    <div
      class={cx(
        apply`relative col h-full pb-footer`,
        props.gutter &&
          css`
            & > * > * {
              @apply px-${props.gutter};
            }
          `,
        props.gap &&
          css`
            & {
              @apply gap-${props.gap};
            }
            & > * {
              @apply gap-${props.gap};
            }
          `,
        props.class
      )}
    >
      {header ?? <Header />}
      {body ?? <Body />}
      {footer ?? <Footer />}
    </div>
  );
};
