import { deepSignal } from "deepsignal";
import { StackedScreen } from "../../../components/ScreenStack";
import { screens } from "./screens";
import { Clock, clocks } from "./clocks";

type State = {
  screens: Record<string, StackedScreen>;
  clocks: Record<string, Clock>;
};

export const state = deepSignal<State>({
  screens,
  clocks,
});
