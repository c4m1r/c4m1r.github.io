import { deepSignal } from "deepsignal";
import { screens } from "./screens";
import { StackedScreen } from "../../../components/ScreenStack";

type State = {
  screens: Record<string, StackedScreen>;
};

export const state = deepSignal<State>({
  screens,
});
