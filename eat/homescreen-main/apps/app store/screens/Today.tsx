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
          <div class="row aib flex-1 gap-3">
            <h1 class="text-(4xl white) font-bold leading-[1cap]">Today</h1>
            <h2 class="text-xl text-white/50 font-bold leading-[1cap]">
              {formatDate(new Date())}
            </h2>
          </div>
          <img
            class="flex-none w-9 h-9 rounded-full overflow-hidden"
            src="/images/avatar.jpg"
            alt=""
          />
        </div>
        <div class="shadow-lg rounded-3xl">
          <img
            src="/images/disney-tile.png"
            class="w-full pointer-events-none"
          />
        </div>
        <div class="shadow-lg rounded-3xl">
          <img src="/images/212-tile.png" class="w-full pointer-events-none" />
        </div>
        <div>
          <hr class="border-(t neutral-800) my-2" />
          <h2 class="flex-1 text-(xl neutral-200) font-semibold">
            Black Voices and Creators
          </h2>
          <p class="text-neutral-500">
            Apps and games from the black community
          </p>
        </div>
        <div class="shadow-lg rounded-3xl">
          <img
            src="/images/barbie-tile.png"
            class="w-full pointer-events-none"
          />
        </div>
        <div class="shadow-lg rounded-3xl">
          <img
            src="/images/storia-tile.png"
            class="w-full pointer-events-none"
          />
        </div>
      </Main>
    </Screen>
  );
};

function formatDate(date: Date) {
  // Create a new Intl.DateTimeFormat object with the desired options
  const formatter = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
  });

  // Format the date and return it
  return formatter.format(date);
}
