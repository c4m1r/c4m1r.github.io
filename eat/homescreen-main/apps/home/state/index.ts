import { DeepSignal, RevertDeepSignal, deepSignal } from "deepsignal";
import { App, apps } from "./apps";

type State = {
  view: "home" | "app";
  apps: Record<string, App>;
  installedApps: App[];
  runningApps: App[];
};

export const vals = <T extends any>(o: DeepSignal<Record<string, T>>) =>
  Object.values(o as RevertDeepSignal<typeof o>) as T[];

export const state = deepSignal<State>({
  view: "app",
  apps,
  get installedApps(): App[] {
    return vals(state.apps);
  },
  get runningApps(): App[] {
    return vals(state.apps).filter((app) => app.order);
  },
});
