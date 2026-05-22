import { Loomer } from "./loomer";
import { Weaver } from "./weaver";

declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Window {
    Neomorph?: {
      Loomer: typeof Loomer;
      Weaver: typeof Weaver;
    };
  }
}

export default {};
