import { JSX } from "preact/jsx-runtime";

const installed = import.meta.glob("../../*/index.tsx");
const icons = import.meta.glob("../../*/icon.png", { eager: true });

export type App = {
  id: string;
  name: string;
  icon: string;
  page: number;
  docked: boolean;
  mod: () => Promise<{ default: () => JSX.Element }>;
  order?: number;
};

export const apps = Object.fromEntries(
  Object.entries(installed)
    .filter(([path]) => path.startsWith("../../"))
    .map(([path, mod], i) => {
      const id = path.split("/")[2];
      return [
        id,
        {
          id,
          name: id,
          mod: mod as App["mod"],
          icon: (icons[`../../${id}/icon.png`] as { default: string })?.default,
          page: Math.random() < 0.5 ? 0 : 1,
          docked: i < 4,
          order: id === "clock" ? 1 : 0,
        },
      ];
    })
);
