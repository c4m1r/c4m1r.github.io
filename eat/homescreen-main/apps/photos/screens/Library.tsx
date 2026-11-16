import { Header } from "../../../components/Header";
import { Main } from "../../../components/Main";
import { Screen } from "../../../components/Screen";

export default () => {
  return (
    <Screen class="!bg-[#020202]">
      <Header transparent class="bg-gradient-to-b from-black/100 to-black/0">
        <div class="w-full row aifs gap-2 px-6 pt-3 pb-4">
          <div class="w-full col flex-1 gap-1">
            <span class="text-xl font-bold">19 Apr–7 May 2024</span>
            <span class="font-semibold">Scunthorpe - Holme & more</span>
          </div>
          <button class="bg-white/10 backdrop-blur-lg text-xs px-4 h-7 rounded-2xl font-semibold">
            Select
          </button>
          <button class="w-7 h-7 col aic jcc bg-white/10 backdrop-blur-lg rounded-full pb-2 font-bold">
            ...
          </button>
        </div>
      </Header>
      <Main class="h-screen pt-header pb-footer overflow-y-scroll col overflow-y-scroll">
        <div class="grid grid-cols-5 auto-rows-min gap-0.5">
          {Array.from({ length: 54 }).map((x, i) => (
            <img
              src={`https://loremflickr.com/600/400/nature?random=${i}`}
              alt="Camera"
              class="w-full aspect-square object-cover"
            />
          ))}
        </div>
        <div class="w-full text-center p-4 pb-6 text-sm font-medium">
          3,042 Photos, 125 Videos
        </div>
        <div class="w-full row aic jcc sticky bottom-2">
          <div class="row bg-neutral-800/40 backdrop-blur-lg rounded-3xl p-1 children:(font-semibold whitespace-nowrap px-4 py-1 rounded-3xl text-(base neutral-300))">
            <button>Years</button>
            <button>Months</button>
            <button>Days</button>
            <button class="bg-white/20 !text-white">All Photos</button>
          </div>
        </div>
      </Main>
    </Screen>
  );
};
