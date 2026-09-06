import { Screen } from "../../components/Screen";
import { Center, Nav } from "../../components/Nav";
import { Footer } from "../../components/Footer";
import { ScreenStack } from "../../components/ScreenStack";
import { state } from "./state";
import { ScreenTabs } from "../../components/ScreenTabs";

export default () => {
  return (
    <Screen class="!bg-[#020202]">
      <ScreenStack screens={state.$screens!} />
      <Footer class="!bg-black/80">
        <Nav class="pb-4">
          <Center class="children:(col aic text-[10px])">
            <ScreenTabs screens={state.$screens!} accent="blue-500" />
          </Center>
        </Nav>
      </Footer>
    </Screen>
  );
};
