import { Header } from "../../../components/Header";
import { Main } from "../../../components/Main";
import { Nav, Left, Right } from "../../../components/Nav";
import { Screen } from "../../../components/Screen";
import { Icon } from "../../../elements/Icon";

export default () => {
  return (
    <Screen gap="4" gutter="4" class="!bg-[#020202] overflow-y-scroll">
      <Header class="!bg-inherit !border-none sticky top-0">
        <Nav class="text-yellow-600 pb-0">
          <Left>
            <button class="text-base">Edit</button>
          </Left>
          <Right>
            <Icon id="plus" size="8" class="-mr-2" />
          </Right>
        </Nav>
      </Header>
      <Main class="pb-footer">
        <div>
          <h1 class="text-4xl font-bold pb-2.5 border-(b white/10)">Timers</h1>
          <div class="row aifs gap-2 py-2 pb-3 border-(b white/10)">
            <div class={`flex-1 col text-neutral-500`}>
              <h2 class="text-6xl font-extralight">04:20</h2>
              <p class="">4 mins</p>
            </div>
            <div class="w-16 h-16 border(4 yellow-600) rounded-full row aic jcc">
              <Icon id="play-fill" size="8" class="text-yellow-600" />
            </div>
          </div>
        </div>
        <div>
          <div class="col">
            <h2 class="text-lg font-bold pb-2 border(b white/10)">Recents</h2>
            <div class="col">
              {[
                "04:00",
                "05:00",
                "06:00",
                "07:00",
                "08:00",
                "09:00",
                "10:00",
                "11:00",
              ].map((alarm) => {
                return (
                  <div class="row aifs py-2 pb-2 border-(b white/10)">
                    <div class={`flex-1 col text-neutral-500`}>
                      <h2 class="text-6xl font-extralight">{alarm}</h2>
                      <p class="">{parseInt(alarm)} mins</p>
                    </div>
                    <div class="w-16 h-16 bg-green-900/50 rounded-full row aic jcc">
                      <Icon id="play-fill" size="8" class="text-green-500" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Main>
    </Screen>
  );
};
