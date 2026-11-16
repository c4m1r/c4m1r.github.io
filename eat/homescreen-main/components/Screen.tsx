import { apply, css, cx } from "@twind/core";
import { Children } from "..";

export const Screen = (props: {
  children?: Children;
  class?: string;
  gutter?: string;
  gap?: string;
}) => {
  const { children, ...rest } = props;
  return (
    <div
      {...rest}
      class={cx(
        "fixed inset-0 w-screen h-screen",
        apply`bg-neutral-900`,
        props.class,
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
          `
      )}
    >
      {props.children}
    </div>
  );
};
