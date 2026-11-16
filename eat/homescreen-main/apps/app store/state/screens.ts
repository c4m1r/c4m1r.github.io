import { StackedScreen } from "../../../components/ScreenStack";

const files = import.meta.glob("../screens/*.tsx");
const meta: Record<string, Omit<StackedScreen, "id" | "mod">> = {
  Today: {
    name: "Today",
    icon: "today",
    order: 1,
  },
  Games: {
    name: "Games",
    icon: "rocket",
  },
  Apps: {
    name: "Apps",
    icon: "app-stack",
  },
  Arcade: {
    name: "Arcade",
    icon: "joystick",
  },
  Search: {
    name: "Search",
    icon: "search",
  },
};

export const screens = {
  ...Object.fromEntries(
    Object.entries(meta).map(([id, screen]) => [id, { ...screen, id }])
  ),
  ...Object.fromEntries(
    Object.entries(files).map(([path, mod]) => {
      const id = path.split("/")[2]?.split(".")[0];
      const { name, icon, order } = meta[id] ?? {};
      return [
        id,
        {
          id,
          mod: mod as StackedScreen["mod"],
          name: name ?? id,
          icon: icon ?? "questionmark-app",
          ...(order ? { order } : {}),
        },
      ];
    })
  ),
};
