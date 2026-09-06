import { Header } from "../../../components/Header";
import { Main } from "../../../components/Main";
import { Screen } from "../../../components/Screen";

export default () => {
  return (
    <Screen class="!bg-[#020202]">
      <Header class="!bg-inherit !border-none"></Header>
      <Main class="pt-header pb-footer px-4 gap-4 overflow-y-scroll">
        <div class="row aic jcc h-64">
          <h1 class="text-8xl font-thin">01:22.96</h1>
        </div>
        <div class="row aic jcsb">
          <button class="bg-neutral-700 w-20 h-20 rounded-full">Reset</button>
          <div class="row gap-2">
            <div class="w-2 h-2 rounded-full bg-white"></div>
            <div class="w-2 h-2 rounded-full bg-white/40"></div>
          </div>
          <button class="bg-green-900/80 text-green-500 w-20 h-20 rounded-full">
            Start
          </button>
        </div>
        <div class="col">
          <div class="row aic gap-2 py-2 border-(b white/20) text-green-500">
            <h2 class="flex-1 text-base">Lap 1</h2>
            <p class="text-base font-medium">00:00.00</p>
          </div>
          <div class="row aic gap-2 py-2 border-(b white/20)">
            <h2 class="flex-1 text-base">Lap 1</h2>
            <p class="text-base font-medium">00:00.00</p>
          </div>
          <div class="row aic gap-2 py-2 border-(b white/20) text-red-500">
            <h2 class="flex-1 text-base">Lap 1</h2>
            <p class="text-base font-medium">00:00.00</p>
          </div>
          <div class="row aic gap-2 py-2 border-(b white/20)">
            <h2 class="flex-1 text-base">Lap 1</h2>
            <p class="text-base font-medium">00:00.00</p>
          </div>
        </div>
      </Main>
    </Screen>
  );
};
