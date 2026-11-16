import "/twind.config";

import { render, ComponentChildren } from "preact";
import Home from "./apps/home";
import { Device } from "./components/Device";

render(
  <Device>
    <Home />
  </Device>,
  document.body
);

export type Children = ComponentChildren | ComponentChildren[];
