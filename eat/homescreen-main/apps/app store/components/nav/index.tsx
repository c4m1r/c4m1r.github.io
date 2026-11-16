import { css, cx } from "@twind/core";
import { Children, childOfType } from "../../utils";
import { Icon } from "../../../../elements/Icon";
import { Button } from "../../components/button";

export const Left = (props: { children?: Children; class?: string }) => {
  return <div class={cx("row jcfs", props.class)}>{props.children}</div>;
};
export const Center = (props: { children?: Children; class?: string }) => {
  return (
    <div class={cx("row jcsa font-medium", props.class)}>{props.children}</div>
  );
};
export const Right = (props: { children?: Children; class?: string }) => {
  return (
    <div
      class={cx("row aic jcfe gap-2 children:(flex-row-reverse)", props.class)}
    >
      {props.children}
    </div>
  );
};

export const Nav = (props: {
  children?: Children;
  class?: string;
  pill?: boolean;
}) => {
  const left = childOfType(props.children, Left);
  const center = childOfType(props.children, Center);
  const right = childOfType(props.children, Right);
  return (
    <nav
      class={cx(
        "w-full grid aic pt-2 pb-3 z-10",
        props.pill &&
          "mx-2 max-w-[calc(100vw-1rem)] rounded-full bg-neutral-900/40 backdrop-blur-lg p-3",
        css`
          ${left || right
            ? "grid-template-columns: 1fr auto 1fr;"
            : "grid-template-columns: auto 1fr auto;"}
        `,
        props.class
      )}
    >
      {left ?? <Left />}
      {center ?? <Center />}
      {right ?? <Right />}
    </nav>
  );
};

export const Back = (props: {
  children?: Children;
  class?: string;
  to?: string;
}) => {
  return (
    <Button class="-ml-2">
      <Icon id="chevron-backward" size="5" />
      {props.children}
    </Button>
  );
};
