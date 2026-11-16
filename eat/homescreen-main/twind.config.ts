import { defineConfig, injectGlobal, install } from "@twind/core";
import presetTailwind from "@twind/preset-tailwind";
import presetAutoprefix from "@twind/preset-autoprefix";

const config = defineConfig({
  presets: [presetTailwind(), presetAutoprefix()],
  variants: [["children", "&>*"]],
  ignorelist: [],
  theme: {
    extend: {
      spacing: {
        "safe-t": "var(--safe-area-inset-top, env(safe-area-inset-top))",
        "safe-r": "var(--safe-area-inset-right, env(safe-area-inset-right))",
        "safe-b": "var(--safe-area-inset-bottom, env(safe-area-inset-bottom))",
        "safe-l": "var(--safe-area-inset-left, env(safe-area-inset-left))",
        header: "var(--header-height, 0)",
        footer: "var(--footer-height, 0)",
      },
      aspectRatio: {
        imax: "21/9",
        cinema: "16/9",
        landscape: "4/3",
        square: "1/1",
        portrait: "3/4",
        tall: "9/16",
      },
    },
  },
  rules: [
    [
      "col",
      {
        display: "flex",
        flexDirection: "column",
      },
    ],
    [
      "row",
      {
        display: "flex",
        flexDirection: "row",
      },
    ],
    ["no-scrollbars", { scrollbarWidth: "none" }],
    ["overflow-scrolling-touch", { WebkitOverflowScrolling: "touch" }],
    ["aic", { alignItems: "center" }],
    ["aifs", { alignItems: "flex-start" }],
    ["aife", { alignItems: "flex-end" }],
    ["aib", { alignItems: "baseline" }],
    ["jcfs", { justifyContent: "flex-start" }],
    ["jcc", { justifyContent: "center" }],
    ["jcfe", { justifyContent: "flex-end" }],
    ["jcsa", { justifyContent: "space-around" }],
    ["jcsb", { justifyContent: "space-between" }],
    ["text-balance", { textWrap: "balance" }],
    ["ms-(\\d+)", (match) => ({ "margin-inline-start": `${match[1] / 4}rem` })],
    ["me-(\\d+)", (match) => ({ "margin-inline-end": `${match[1] / 4}rem` })],
    [
      "ps-(\\d+)",
      (match) => ({ "padding-inline-start": `${match[1] / 4}rem` }),
    ],
    ["pe-(\\d+)", (match) => ({ "padding-inline-end": `${match[1] / 4}rem` })],
    ["ltr", { direction: "ltr" }],
    ["rtl", { direction: "rtl" }],
  ],
});

install(config);
injectGlobal`
  html {
    overscroll-behavior: none;
    -webkit-tap-highlight-color: transparent;
  }

  body {
    height: 100svh;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #222;
  }

  @media all and (display-mode: standalone) {
    body {
      height: 100vh;
    }
  }

  * {
    cursor: url("/images/cursor.png") 20 20, auto !important;
    user-select: none;
  }

  ::-webkit-scrollbar {
    display: none;
  }
`;
