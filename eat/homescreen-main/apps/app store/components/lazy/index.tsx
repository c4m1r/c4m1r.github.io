import { useState, useLayoutEffect } from "preact/hooks";
import { JSX } from "preact/jsx-runtime";

type DefaultModule = (props?: any) => JSX.Element;

export const Lazy = (props: {
  mod: () => Promise<{ default: DefaultModule }>;
  data?: Record<string, any>;
}) => {
  const [Component, setComponent] = useState<DefaultModule>(() => () => (
    <div class="bg-transparent"></div>
  ));
  useLayoutEffect(() => {
    props.mod().then((x) => setComponent(() => x.default));
  }, []);
  return <Component {...props.data} />;
};
