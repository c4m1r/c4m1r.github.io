import { cx, apply } from "@twind/core";
import { Children } from "../../utils";

export const List = (props: { children?: Children; class?: string }) => {
  return (
    <ul class={cx(apply`w-full row gap-3 overflow-x-scroll`, props.class)}>
      {props.children}
    </ul>
  );
};
