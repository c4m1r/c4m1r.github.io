import { useState, useLayoutEffect } from "preact/hooks";
import { JSX } from "preact/jsx-runtime";

export const Lazy = (props: {
  mod: () => Promise<{
    default: () => JSX.Element;
  }>;
}) => {
  const [Component, setComponent] = useState<() => JSX.Element>(() => () => (
    <div class="bg-transparent"></div>
  ));
  useLayoutEffect(() => {
    props.mod().then((x) => setComponent(() => x.default));
  }, []);
  return <Component />;
};
