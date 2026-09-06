import { ComponentChildren } from "preact";

export const childOfType = <T extends any>(
  node: Children | undefined,
  type: T
): T | null => {
  return (
    node &&
    (Array.isArray(node)
      ? node.find((x) => x.type === type)
      : (node as any)?.type === type
        ? node
        : null)
  );
};

export const examples = (list: Record<string, any>) =>
  Object.fromEntries(
    Object.entries(list).map(([k, v]) => [
      k.replace(/\.\/examples\/|\.tsx/g, ""),
      v,
    ])
  );

export type ArgsType<T> = T extends (...args: infer U) => any ? U : never;
export type Children = ComponentChildren | ComponentChildren[];
