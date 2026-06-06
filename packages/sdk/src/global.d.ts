import { Loomer } from "./loomer";
import { Weaver } from "./weaver";

declare global {
  interface Window {
    Neomorph?: {
      Loomer: typeof Loomer;
      Weaver: typeof Weaver;
    };
  }
}

export default {};
