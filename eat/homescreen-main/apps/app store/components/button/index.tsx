import { apply, cx } from "@twind/core";
import { ArgsType, Children, examples } from "../../utils";
import { Lazy } from "../lazy";

const variants = examples(import.meta.glob("./examples/*.tsx"));

export const Button = (props: {
  children?: Children;
  class?: string;
  onClick?: () => void;
  size?: "sm" | "lg" | "xl";
  dir?: "rtl" | "ltr";
  x?:
    | ArgsType<typeof import("./examples/b").default>[0]
    | ArgsType<typeof import("./examples/a").default>[0]
    | ArgsType<typeof import("./examples/c").default>[0]
    | ArgsType<typeof import("./examples/d").default>[0]
    | ArgsType<typeof import("./examples/f").default>[0];
}) => {
  if (props.x && variants[props.x.type]) {
    return <Lazy mod={variants[props.x.type]} data={props.x} />;
  }
  return (
    <button
      dir={props.dir || "ltr"}
      class={cx(
        apply`row aic gap-[0.5em] text-${props.size ?? "base"}`,
        props.class
      )}
      onClick={props.onClick}
    >
      {props.children ?? "Button"}
    </button>
  );
};
