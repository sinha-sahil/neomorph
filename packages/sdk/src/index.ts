import { decodeSDKResponse, SDKResponse } from "./types";

export class Weaver {
  private applicationFrame: HTMLIFrameElement | null;

  constructor() {
    this.applicationFrame = null;
  }

  inject(): void {
    if (typeof document === "undefined") {
      console.warn("🕸️ Weaver: inject() called in non-browser environment");
      return;
    }

    try {
      const script = document.createElement("script");
      script.src = "http://localhost:10001/dist/app.js";
      script.type = "text/javascript";
      document.head.appendChild(script);
    } catch (error: unknown) {
      console.error("🕸️ Weaver: Failed to inject script:", error);
    }
  }

  loadApplication(
    url: string,
    callback: (response: SDKResponse | null) => void
  ): void {
    if (typeof document === "undefined" || typeof window === "undefined") {
      console.warn(
        "🕸️ Weaver: loadApplication() called in non-browser environment"
      );
      return;
    }

    try {
      this.applicationFrame = document.createElement("iframe");
      this.applicationFrame.src = url;
      this.applicationFrame.style.width = "100%";
      this.applicationFrame.style.height = "100%";
      this.applicationFrame.style.border = "none";
      document.body.appendChild(this.applicationFrame);

      window.addEventListener("message", (event: MessageEvent) => {
        const decodedResponse = decodeSDKResponse(event.data);
        callback(decodedResponse);
      });
    } catch (error: unknown) {
      console.error("🕸️ Weaver: Failed to load application:", error);
    }
  }

  listenCssVariables(): void {
    if (typeof window === "undefined") {
      console.warn(
        "🕸️ Weaver: listenCssVariables() called in non-browser environment"
      );
      return;
    }

    try {
      const applicationFrame = this.applicationFrame;
      if (!applicationFrame?.contentWindow) {
        console.error("🕸️ Weaver: No iframe loaded or iframe not ready");
        return;
      }

      applicationFrame.contentWindow.postMessage(
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
    } catch (error: unknown) {
      console.error("🕸️ Weaver: Failed to send message to iframe:", error);
    }
  }
}
