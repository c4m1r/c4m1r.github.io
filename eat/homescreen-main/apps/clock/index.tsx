import { Screen } from "../../components/Screen";
import { Center, Nav } from "../../components/Nav";
import { Footer } from "../../components/Footer";
import { state } from "./state";
import { ScreenStack } from "../../components/ScreenStack";
import { ScreenTabs } from "../../components/ScreenTabs";

export default () => {
  return (
    <Screen class="!bg-[#020202]">
      <ScreenStack screens={state.$screens!} />
      <Footer class="bg-neutral-900/80">
        <Nav class="!px-0 pb-6">
          <Center class="children:(col aic text-[10px])">
            <ScreenTabs screens={state.$screens!} accent="yellow-600" />
          </Center>
        </Nav>
      </Footer>
    </Screen>
  );
};
