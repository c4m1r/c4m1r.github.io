import { Main } from "../../../components/Main";
import { Screen } from "../../../components/Screen";

export default () => {
  return (
    <Screen
      gutter="5"
      gap="5"
      class="overflow-y-scroll bg-[#0e0e0e] pt-safe-t pb-footer"
    >
      <Main class="py-4">
        <div class="row aic">
          <h1 class="text-(4xl white) font-bold flex-1 leading-[1cap]">Apps</h1>
          <img
            class="flex-none w-9 h-9 rounded-full overflow-hidden"
            src="/images/avatar.jpg"
            alt=""
          />
        </div>
      </Main>
    </Screen>
  );
};
