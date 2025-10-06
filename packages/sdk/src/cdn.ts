import { Loomer } from "./loomer";
import { Weaver } from "./weaver";

function injectToWindow() {
  try {
    window.Neomorph = {
      Loomer,
      Weaver,
    };
  } catch (e) {}
}

injectToWindow();
