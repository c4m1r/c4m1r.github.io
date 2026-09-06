import { Header } from "../../../components/Header";
import { Main } from "../../../components/Main";
import { Screen } from "../../../components/Screen";
import { Icon } from "../../../elements/Icon";

export default () => {
  return (
    <Screen class="!bg-[#020202]">
      <Header transparent></Header>
      <Main class="h-screen pt-header pb-footer overflow-y-scroll col gap-7">
        <h1 class="text-4xl font-bold pt-11 mx-4 -mb-6">For You</h1>
        <div class="col gap-3">
          <div class="row aife ml-4 pr-4 pt-3 border-(t white/10)">
            <h1 class="flex-1 text-2xl font-semibold leading-none">Memories</h1>
            <button class="text-blue-500 text-base font-medium">See All</button>
          </div>
          <div class="px-4 row overflow-y-scroll snap-x snap-mandatory gap-2 children:(relative flex-none col w-full snap-center)">
            {Array.from({ length: 4 }).map((x, i) => (
              <div>
                <img
                  src={`https://loremflickr.com/600/400/nature?random=${i}`}
                  alt="Camera"
                  class="relative w-full aspect-[21/27] object-cover rounded-2xl"
                />
                <div class="absolute row children:(flex-none text-white) top-4 right-4 z-10">
                  <Icon id="heart" size="8" />
                  <Icon id="ellipsis-circle-outline" size="8" />
                </div>
                <div class="absolute inset-0 bg-gradient-to-tr from-neutral-900"></div>
                <div class="absolute w-full h-full flex px-8 pb-6 pt-16">
                  <div class="mt-auto">
                    <h2 class="font-(mono bold) text-2xl">On This Day</h2>
                    <p class="tracking-widest uppercase text-xs">
                      MAR 2024 Trip
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div class="col gap-3">
          <div class="row aife ml-4 pr-4 pt-4 border-(t white/10)">
            <h1 class="flex-1 text-2xl font-semibold leading-none">
              Featured Photos
            </h1>
          </div>
          <div class="px-4 row overflow-y-scroll snap-x snap-mandatory gap-2 children:(relative flex-none col w-full snap-center)">
            {Array.from({ length: 4 }).map((x, i) => (
              <div class="col gap-1">
                <img
                  src={`https://loremflickr.com/600/400/nature?random=${
                    i + 10
                  }`}
                  alt="Camera"
                  class="relative w-full aspect-square object-cover rounded-lg"
                />
                <div>
                  <h2 class="font-bold text-base">On This Day</h2>
                  <p class="text-(sm neutral-500)">30 Mar 2024</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div class="col gap-4">
          <div class="row aife ml-4 pr-4 pt-4 border-(t white/10)">
            <h1 class="flex-1 text-2xl font-semibold leading-none">
              Shared with You
            </h1>
            <button class="text-blue-500 text-base font-medium">See All</button>
          </div>
          <div class="px-4 row overflow-y-scroll snap-x snap-mandatory scroll-p-4 gap-2 children:(relative flex-none col w-8/12 snap-start)">
            {Array.from({ length: 4 }).map((x, i) => (
              <div class="col aifs jcfs gap-2">
                <img
                  src={`https://loremflickr.com/600/400/nature?random=${
                    i + 20
                  }`}
                  alt="Camera"
                  class="w-full aspect-square object-cover rounded-2xl"
                />
                <div class="row aic gap-1 bg-neutral-900 rounded-3xl p-1">
                  <img
                    src={`https://loremflickr.com/600/400/nature?random=${
                      i + 30
                    }`}
                    alt="Camera"
                    class="flex-none w-4 aspect-square object-cover rounded-full"
                  />
                  <p class="text-(xs neutral-500) text-white">From Iris</p>
                  <Icon
                    id="chevron-forward"
                    size="4"
                    class="-ml-1 text-neutral-300"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div></div>
      </Main>
    </Screen>
  );
};
