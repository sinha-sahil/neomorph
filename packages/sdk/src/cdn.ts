import { Loomer } from "./loomer";
import { Weaver } from "./weaver";

function injectToWindow() {
  try {
    window.Neomorph = {
      Loomer,
      Weaver,
    };
  } catch (e) {
    console.error("Neomorph: Failed to attach SDK to window:", e);
  }
}

injectToWindow();
