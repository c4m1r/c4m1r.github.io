import { useSignal } from "@preact/signals";
import { css, cx } from "@twind/core";
import { useMemo, useEffect } from "preact/hooks";
import { Header } from "../../../components/Header";
import { Screen } from "../../../components/Screen";
import { Main } from "../../../components/Main";
import { Nav, Center } from "../../../components/Nav";
import { Icon } from "../../../elements/Icon";
import { state } from "../state";
import { AppIcon } from "../components/AppIcon";
import { RevertDeepSignal } from "deepsignal";
import { AppLauncher } from "../components/AppLauncher";

export const AppLibrary = () => {
  const searchFocussed = useSignal(false);
  const visualViewportHeight = useSignal(0);

  const folders = useMemo(() => {
    return state.$installedApps!.value.reduce((all, one, i) => {
      const ch = Math.floor(i / 3);
      // @ts-ignore
      all[ch] = [].concat(all[ch] ?? [], one);
      return all;
    }, [] as RevertDeepSignal<typeof state.$installedApps>[]);
  }, []);

  useEffect(() => {
    visualViewport?.addEventListener("resize", (event) => {
      const h = (event.target as VisualViewport).height;
      visualViewportHeight.value = h;
    });
  }, []);

  return (
    <Screen class="bg-transparent z-30">
      <Header transparent>
        <Nav class="mt-4">
          <Center
            style={`--blur-size: 16px; --blur-strength: 3px;`}
            class={cx("px-4 text-(white/30 xl)", blur)}
          >
            <label class="w-full flex jcc bg-black/30 backdrop-blur-lg rounded-2xl">
              <div
                class="row aic px-3 py-1 gap-1.5 transition-all duration-300"
                style={{ width: searchFocussed.value ? "100%" : "182px" }}
              >
                <Icon id="search" size="8" class="flex-none" />
                <input
                  type="search"
                  placeholder="App Library"
                  class="w-full min-w-0 h-11 placeholder-white/30 bg-transparent font-medium outline-none"
                  onFocus={() => (searchFocussed.value = true)}
                />
              </div>
            </label>
            <button
              onClick={() => {
                searchFocussed.value = false;
              }}
              class={cx(
                "text-(base white) duration-300",
                searchFocussed.value
                  ? "w-[64px] pl-4 opacity-100"
                  : "w-0 opacity-0"
              )}
            >
              Cancel
            </button>
          </Center>
        </Nav>
      </Header>
      <Main class="pt-header">
        <div
          class="w-full flex-none grid grid-cols-2 pt-3 p-6 gap-x-4 gap-y-3 pb-safe-b transition-transform duration-500"
          style={{
            transform: searchFocussed.value ? "scale(0.95)" : "scale(1)",
          }}
        >
          {folders.map((group, i, groups) => {
            return (
              <div class="col aic gap-1 text-xs">
                <div class="grid grid-cols-2 grid-rows-2 px-2.5 py-3 gap-x-2 gap-y-2.5 bg-black/30 rounded-3xl">
                  {
                    // @ts-ignore
                    group?.map((app) => (
                      <AppLauncher key={app.id} app={app} />
                    ))
                  }
                  <div class="grid grid-cols-2 grid-rows-2 p-0.5 gap-x-1 gap-y-1">
                    {
                      // @ts-ignore
                      groups[i + 1 > groups.length - 1 ? 0 : i + 1]?.map(
                        (app: (typeof state.installedApps)[0]) => (
                          <AppLauncher key={app.id} app={app} />
                        )
                      )
                    }
                  </div>
                </div>
                <span>Group Name</span>
              </div>
            );
          })}
        </div>
        <div
          class={cx(
            searchFocussed.value
              ? "opacity-100"
              : "opacity-0 pointer-events-none",
            `pb-[calc(100vh-${visualViewportHeight.value}px)]`,
            "h-screen backdrop-blur-xl pt-header overscroll-contain absolute inset-0 w-screen overflow-y-scroll"
          )}
        >
          <div class="col px-6 pt-2 pb-8">
            <h2 class="text-lg font-semibold">A</h2>
            {state.$installedApps!.value.map((app) => {
              return (
                <div key={app.id} class="row aic gap-3.5">
                  <div class="w-14 aspect-square flex-none">
                    <AppLauncher app={app} />
                  </div>
                  <div class="w-full text-lg border-(b white/10) py-6 capitalize">
                    {app.name}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Main>
    </Screen>
  );
};

const blur = css`
  &::before {
    content: "";
    position: absolute;
    z-index: -1;
    inset: calc(var(--blur-size, 100px) * -1);
    backdrop-filter: blur(var(--blur-strength, 10px));
    mask: linear-gradient(
        to top,
        transparent 0%,
        red var(--blur-size) calc(100% - var(--blur-size)),
        transparent 100%
      ),
      linear-gradient(
        to left,
        transparent 0%,
        red var(--blur-size) calc(100% - var(--blur-size)),
        transparent 100%
      );
    mask-composite: intersect;
  }
`;
