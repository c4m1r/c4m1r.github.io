import { Icon } from "../../elements/Icon";
import { Screen } from "../../components/Screen";
import { Center, Nav } from "../../components/Nav";
import { Header } from "../../components/Header";
import { Main } from "../../components/Main";
import { MenuList } from "./components/MenuList";
import { MenuItems } from "./state/MenuItems";

export default () => {
  return (
    <Screen gutter="4" gap="4" class="overflow-y-scroll bg-[#0e0e0e] pb-footer">
      <Header class="opacity-0">
        <Nav>
          <Center>
            <h1 class="text-lg font-semibold -mb-2.5 pt-1">Settings</h1>
          </Center>
        </Nav>
      </Header>
      <Main class="pt-header pb-safe-b">
        <h1 class="font-bold text-[36px] -mb-4">Settings</h1>
        <div>
          <div class="relative row aic text-neutral-500 placeholder:text-neutral-500">
            <Icon id="search" size="7" class="absolute left-0.5" />
            <input
              type="text"
              class="w-full px-3 py-1 bg-[#1c1c1e] rounded-lg pl-8 text-lg"
              placeholder={"Search"}
            />
          </div>
        </div>
        <div>
          <div class="row aic gap-4 bg-[#1c1c1e] px-2 py-2 rounded-xl">
            <img
              src="/images/avatar.jpg"
              class="flex-none w-16 h-16 rounded-full"
            />
            <div>
              <h2 class="text-lg text-white">Luke Jackson</h2>
              <p class="text-xs text-neutral-300">
                Apple ID, iCloud, Media & Purchases
              </p>
            </div>
            <Icon id="chevron-forward" size="7" class="text-neutral-500" />
          </div>
        </div>
        <div class="col gap-4">
          {MenuItems.map((group) => (
            <MenuList items={group} />
          ))}
        </div>
      </Main>
    </Screen>
  );
};
