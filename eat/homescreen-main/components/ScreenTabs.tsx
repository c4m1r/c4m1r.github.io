import { Signal } from "@preact/signals";
import { StackedScreen, vals } from "./ScreenStack";
import { Icon } from "../elements/Icon";

export const ScreenTabs = (props: {
  screens: Signal<Record<string, StackedScreen>>;
  accent?: string;
}) => {
  const screens = vals(props.screens!.value);
  const top = Math.max(...screens.map((x) => x.order ?? 0));

  const stack = (screen: (typeof screens)[0]) => {
    props.screens!.value = {
      ...props.screens.value,
      [screen.id]: { ...screen, order: top + 1 },
    };
  };

  return (
    <>
      {screens.map((screen) => {
        const focus = screen.order === top;
        return (
          <div
            class={
              focus ? `text-${props.accent ?? "white"}` : "text-neutral-500"
            }
            onClick={() => stack(screen)}
          >
            <Icon id={screen.icon} size="9" />
            <span class="leading-none">{screen.name}</span>
          </div>
        );
      })}
    </>
  );
};
