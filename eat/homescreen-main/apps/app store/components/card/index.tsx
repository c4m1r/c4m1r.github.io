import { apply, cx } from "@twind/core";
import { ArgsType, Children, childOfType, examples } from "../../utils";
import { Lazy } from "../lazy";

const variants = examples(import.meta.glob("./examples/*.tsx"));

export const Header = (props: { children?: Children; class?: string }) => {
  return <div class={cx(apply`row`, props.class)}>{props.children}</div>;
};

export const Body = (props: { children?: Children; class?: string }) => {
  return <div class={cx(apply`row flex-1`, props.class)}>{props.children}</div>;
};

export const Footer = (props: { children?: Children; class?: string }) => {
  return <div class={cx(apply`row`, props.class)}>{props.children}</div>;
};

const aspectRatios = {};

export const Card = (props: {
  children?: Children;
  class?: string;
  aspect?: keyof typeof aspectRatios;
  x?:
    | ArgsType<typeof import("./examples/a").default>[0]
    | ArgsType<typeof import("./examples/b").default>[0]
    | ArgsType<typeof import("./examples/c").default>[0]
    | ArgsType<typeof import("./examples/d").default>[0]
    | ArgsType<typeof import("./examples/e").default>[0];
}) => {
  const header = childOfType(props.children, Header);
  const body = childOfType(props.children, Body);
  const footer = childOfType(props.children, Footer);

  if (props.x && variants[props.x.type]) {
    return <Lazy mod={variants[props.x.type]} data={props.x} />;
  }

  return (
    <div
      class={cx(
        apply`col w-full h-full p-4 text-neutral-200 bg-neutral-600 overflow-hidden`,
        props.aspect && aspectRatios[props.aspect],
        props.class
      )}
    >
      {header ?? <Header />}
      {body ?? <Body />}
      {footer ?? null}
    </div>
  );
};
