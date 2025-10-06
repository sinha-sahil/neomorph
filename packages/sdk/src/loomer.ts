import { decodeSDKResponse, StylesCallback } from "./types";

export class Loomer {
  private applicationFrame: HTMLIFrameElement | null;
  private callbacks: Array<StylesCallback>;

  constructor() {
    this.applicationFrame = null;
    this.callbacks = [];
  }

  loadApplication(url: string, container: HTMLElement = document.body): void {
    try {
      this.applicationFrame = document.createElement("iframe");
      this.applicationFrame.src = url;
      this.applicationFrame.style.width = "100%";
      this.applicationFrame.style.height = "100%";
      this.applicationFrame.style.border = "none";
      container.appendChild(this.applicationFrame);

      window.addEventListener("message", (event: MessageEvent) => {
        const decodedResponse = decodeSDKResponse(event.data);
        if (decodedResponse !== null) {
          console.log("DecodedResponse: ", decodedResponse);
        }
      });
    } catch (error: unknown) {
      console.error("🕸️ Weaver: Failed to load application:", error);
    }
  }

  listenCssVariables(callback: StylesCallback): void {
    try {
      this.applicationFrame?.contentWindow?.postMessage(
        JSON.stringify({
          source: "skinweaver",
          payload: JSON.stringify({
            requestId: "randomId",
            service: "skinweaver",
            payload: {
              action: "listenCssVariables",
            },
          }),
        }),
        "*"
      );
      this.callbacks.push(callback);
    } catch (error: unknown) {
      console.error("🕸️ Weaver: Failed to send message to iframe:", error);
    }
  }
}
