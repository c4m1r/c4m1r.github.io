import { css, cx } from "@twind/core";

export const Switch = (props: {
  checked: boolean;
  onChange?: (checked: boolean) => void;
}) => {
  return (
    <label
      class={cx(
        "relative col jcc p-0.5 w-12 select-none bg-neutral-700 rounded-full cursor-pointer transition-all ease-in",
        css`
          &:has(> input:checked) {
            @apply bg-[#2bd157];
            & input {
              @apply ml-5;
            }
          }
        `
      )}
    >
      <input
        type="checkbox"
        name="toggle"
        id="toggle"
        defaultChecked={props.checked}
        onChange={(e) =>
          props.onChange?.((e.target as HTMLInputElement).checked)
        }
        class="ml-0 w-6 h-6 rounded-full bg-neutral-100 appearance-none cursor-pointer transition-all ease-in"
      />
    </label>
  );
};
