import { cx } from "@twind/core";

export const Icon = (props: {
  id: string;
  size: string;
  fill?: string;
  class?: string;
}) => {
  return (
    <svg
      class={cx(
        `w-${props.size} h-${props.size} children:(w-full h-full)`,
        props.fill && `text-${props.fill}`,
        props.class
      )}
    >
      <use href={`/icons/${props.id}.svg#icon`} />
    </svg>
  );
};
