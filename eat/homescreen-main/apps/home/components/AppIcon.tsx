import { state } from "../state";
import { App } from "../state/apps";

export const AppIcon = (props: { app: App }) => {
  const { id, icon, name } = props.app;

  const launch = () => {
    const apps = state.$apps!.value;
    const runningApps = state.$runningApps!.value;
    const order = Math.max(0, ...runningApps.map((v) => v.order ?? 0)) + 1;
    state.$view!.value = "app";
    state.$apps!.value = {
      ...apps,
      [id]: { ...props.app, order },
    };
  };

  return (
    <div class="px-0.5">
      <img
        src={icon}
        alt={name}
        class="aspect-square w-full select-none"
        onClick={launch}
      />
    </div>
  );
};
