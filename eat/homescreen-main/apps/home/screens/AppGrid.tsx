import { Main } from "../../../components/Main";
import { Screen } from "../../../components/Screen";
import { state } from "../state";
import { scale } from "..";
import { Signal } from "@preact/signals";
import { AppLauncher } from "../components/AppLauncher";

export const AppGrid =
  (progress: Signal<number>) =>
  (
    apps: typeof state.installedApps,
    i: number,
    pages: (typeof state.installedApps)[]
  ) => {
    const first = i === 0 && "right";
    const last = i === pages.length - 1 && "left";
    const both = first && last && "both";
    return (
      <Screen class="bg-transparent" data-fixed={both || first || last}>
        <Main
          class="pt-safe-t"
          style={{
            transformOrigin: "center",
            transform:
              progress.value < 1
                ? scale(0.9, 1, progress.value)
                : scale(1, 0.9, progress.value - pages.length),
          }}
        >
          <div class="w-full flex-none grid grid-cols-4 grid-rows-6 p-6 gap-x-6 gap-y-4 pt-8">
            {apps.map((app) => (
              <div key={app.id} class="col aic gap-1.5">
                <AppLauncher app={app} />
                <p class="text-center text-xs capitalize">{app.name}</p>
              </div>
            ))}
          </div>
        </Main>
      </Screen>
    );
  };
