import { Header } from "../../../components/Header";
import { Main } from "../../../components/Main";
import { Screen } from "../../../components/Screen";
import { Icon } from "../../../elements/Icon";

export default () => {
  return (
    <Screen class="!bg-[#020202]">
      <Header transparent></Header>
      <Main class="h-screen pt-header pb-footer overflow-y-scroll col gap-7">
        <h1 class="text-4xl font-bold pt-11 mx-4 -mb-6">Albums</h1>
      </Main>
    </Screen>
  );
};
