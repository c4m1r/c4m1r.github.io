import { Signal } from "@preact/signals";
import { cx } from "@twind/core";
import { Lazy } from "./Lazy";
import { Screen } from "./Screen";
import { JSX } from "preact/jsx-runtime";
import { DeepSignal, RevertDeepSignal } from "deepsignal";

export type StackedScreen = {
  name: string;
  icon: string;
  order?: number;
  id: string;
  mod?: () => Promise<{ default: () => JSX.Element }>;
};

export const ScreenStack = (props: {
  screens: Signal<Record<string, StackedScreen>>;
}) => {
  const screens = vals(props.screens!.value).filter((screen) => screen.order);
  const top = Math.max(...screens.map((x) => x.order ?? 0));
  return (
    <Screen>
      {screens.map((screen) => {
        const focus = screen.order === top;
        if (!screen.mod) return null;
        return (
          <div
            key={screen.id}
            class={cx(
              `relative z-[${screen.order}]`,
              !focus && "pointer-events-none hidden"
            )}
          >
            <Lazy key={screen.id} mod={screen.mod} />
          </div>
        );
      })}
    </Screen>
  );
};

export const vals = <T extends any>(
  o:
    | DeepSignal<Record<string, T>>
    | Signal<Record<string, T>>
    | Record<string, T>
) => Object.values(o as RevertDeepSignal<typeof o>) as T[];
