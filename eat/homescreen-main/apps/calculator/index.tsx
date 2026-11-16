import { Screen } from "../../components/Screen";
import { Main } from "../../components/Main";
import { Icon } from "../../elements/Icon";

export default () => {
  return (
    <Screen class="!bg-[#020202]">
      <Main class="pb-8">
        <div class="flex-1 col p-4 pb-0">
          <span class="mt-auto ml-auto text-[92px] font-extralight tabular-nums tracking-tighter translate-y-[4.8%]">
            0.65432
          </span>
        </div>
        <div>
          <div class="grid grid-cols-4 gap-x-4 gap-y-3.5 p-4 pt-0 children:(w-full aspect-square rounded-full text-3xl row aic jcc tabular-nums)">
            <button class="row-span-1 bg-[#a5a5a5] text-neutral-900">C</button>
            <button class="row-span-1 bg-[#a5a5a5] text-neutral-900">
              <Icon id="plus-slash-minus" size="9" />
            </button>
            <button class="row-span-1 bg-[#a5a5a5] text-neutral-900">
              <Icon id="percent" size="9" />
            </button>
            <button class="row-span-1 bg-[#ff9400] text-neutral-100">
              <Icon id="divide" size="9" />
            </button>
            <button class="row-span-1 bg-[#333333]">7</button>
            <button class="row-span-1 bg-[#333333]">8</button>
            <button class="row-span-1 bg-[#333333]">9</button>
            <button class="row-span-1 bg-[#ff9400] text-neutral-100">
              <Icon id="multiply" size="9" />
            </button>
            <button class="row-span-1 bg-[#333333]">4</button>
            <button class="row-span-1 bg-[#333333]">5</button>
            <button class="row-span-1 bg-[#333333]">6</button>
            <button class="row-span-1 bg-[#ff9400] text-neutral-100">
              <Icon id="minus" size="9" />
            </button>
            <button class="row-span-1 bg-[#333333]">1</button>
            <button class="row-span-1 bg-[#333333]">2</button>
            <button class="row-span-1 bg-[#333333]">3</button>
            <button class="row-span-1 bg-[#ff9400] text-neutral-100">
              <Icon id="plus" size="9" />
            </button>
            <button class="col-span-2 row-span-1 bg-[#333333] !aspect-auto !jcfs pl-7">
              0
            </button>
            <button class="row-span-1 bg-[#333333]">.</button>
            <button class="row-span-1 bg-[#ff9400] text-neutral-100">
              <Icon id="equal" size="9" />
            </button>
          </div>
        </div>
      </Main>
    </Screen>
  );
};
