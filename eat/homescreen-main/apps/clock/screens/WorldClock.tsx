import { Screen } from "../../../components/Screen";
import { Header } from "../../../components/Header";
import { Main } from "../../../components/Main";
import { Nav, Left, Right } from "../../../components/Nav";
import { Icon } from "../../../elements/Icon";
import { state } from "../state";
import { vals } from "../../../components/ScreenStack";
import { createClocks, timeZones } from "../state/clocks";
import { useEffect } from "preact/hooks";
import { Popover } from "../../../components/Popover";

export default () => {
  useEffect(() => {
    const interval = setInterval(() => {
      state.$clocks!.value = createClocks(state.$clocks!.value);
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  return (
    <Screen gutter="4" class="!bg-[#020202] overflow-y-scroll">
      <Header class="!bg-inherit !border-none sticky top-0">
        <Nav class="text-yellow-600 pb-0">
          <Left>
            <button class="text-base">Edit</button>
          </Left>
          <Right class="-mr-2">
            <Popover
              id="new-clock"
              placeholder={() => (
                <button>
                  <Icon id="plus" size="8" />
                </button>
              )}
              window={({ hide }) => <ScrollOverlay close={hide} />}
            />
          </Right>
        </Nav>
      </Header>
      <Main class="pb-footer">
        <h1 class="text-4xl font-bold pb-2.5 border-(b white/10)">
          World Clock
        </h1>
        <div class="col mt-1">
          {vals(state.$clocks!.value).map((clock) => {
            return (
              <div class="row gap-2 py-4 border-(b white/10)">
                <div class="flex-1 col">
                  <p class="text-sm font-light text-neutral-400">
                    {clock.tyt}
                    {", "}
                    {clock.hourDifference}
                  </p>
                  <h2 class="text-3xl">{clock.city}</h2>
                </div>
                <span class="text-6xl font-extralight">{clock.time}</span>
              </div>
            );
          })}
        </div>
      </Main>
    </Screen>
  );
};

const ScrollOverlay = (props: { close: () => void }) => {
  return (
    <Screen class="!bg-transparent children:(snap-start)">
      <Screen class="relative flex-none h-screen pt-safe-t !bg-transparent !rounded-t-xl !overflow-hidden">
        <Header class="flex-1 overflow-y-scroll rounded-t-xl col mt-safe-t !pt-0 !bg-transparent">
          <div class="w-full p-4 pt-2 col gap-4 sticky top-0 z-10 backdrop-blur-lg">
            <div class="w-full text-(sm center)">Choose a City</div>
            <div class="row gap-4">
              <div class="relative w-full row aic">
                <Icon
                  id="search"
                  size="7"
                  class="absolute left-0.5 text-white/50"
                />
                <input
                  type="text"
                  class="w-full px-3 py-1 bg-white/20 rounded-lg pl-8 text-lg placeholder:text-white/50"
                  placeholder={"Search"}
                />
              </div>
              <button class="text-yellow-600 font-medium" onClick={props.close}>
                Cancel
              </button>
            </div>
          </div>
        </Header>
        <Main class="col h-full pt-header bg-neutral-900 rounded-t-xl">
          {Object.entries(
            timeZones.reduce((all, timeZone) => {
              const city = timeZone.split("/")[1];
              all[city[0]] = [...(all[city[0]] || []), timeZone];
              return all;
            }, {} as Record<string, any>)
          )
            .sort(([a], [b]) => (a < b ? -1 : 1))
            .map(([group, timeZones]) => {
              return (
                <>
                  <div class="sticky top-0 row gap-2 px-4 py-3 border-(b white/10) backdrop-blur-xl">
                    {group}
                  </div>
                  {timeZones.map((timeZone) => (
                    <div class="row gap-2 px-4 py-3 border-(b white/10)">
                      {timeZone.split("/")[1]}
                    </div>
                  ))}
                </>
              );
            })}
        </Main>
      </Screen>
    </Screen>
  );
};
