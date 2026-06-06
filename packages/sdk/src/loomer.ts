import { decodeSDKResponse, StylesCallback } from "./types";

function safeJsonParse(input: string): unknown {
  try {
    return JSON.parse(input);
  } catch {
    return null;
  }
}

export class Loomer {
  private applicationFrame: HTMLIFrameElement | null;
  private callbacks: Array<StylesCallback>;
  private actionHandlers: Map<string, Array<StylesCallback>>;
  private ready: boolean;
  private pendingMessages: Array<Record<string, unknown>>;

  constructor() {
    this.applicationFrame = null;
    this.callbacks = [];
    this.actionHandlers = new Map();
    this.ready = false;
    this.pendingMessages = [];
  }

  loadApplication(url: string, container: HTMLElement = document.body): void {
    try {
      this.applicationFrame = document.createElement("iframe");
      this.applicationFrame.src = url;
      this.applicationFrame.style.width = "100%";
      this.applicationFrame.style.height = "100%";
      this.applicationFrame.style.border = "none";
      container.appendChild(this.applicationFrame);

      this.applicationFrame.addEventListener("load", () => {
        this.ready = true;
        this.flushPendingMessages();
      });

      window.addEventListener("message", (event: MessageEvent) => {
        const raw =
          typeof event.data === "string"
            ? safeJsonParse(event.data)
            : event.data;
        const decodedResponse = decodeSDKResponse(raw);
        if (decodedResponse === null) {
          return;
        }
        const payload = decodedResponse.payload;
        const action = payload["action"];
        if (typeof action === "string") {
          const handlers = this.actionHandlers.get(action);
          if (handlers instanceof Array) {
            handlers.forEach((handler) => handler(payload));
          }
          return;
        }
        this.callbacks.forEach((cb) => cb(payload));
      });
    } catch (error: unknown) {
      console.error("Loomer: Failed to load application:", error);
    }
  }

  private flushPendingMessages(): void {
    for (const payload of this.pendingMessages) {
      this.postMessage(payload);
    }
    this.pendingMessages = [];
  }

  private postMessage(payload: Record<string, unknown>): void {
    try {
      if (
        this.applicationFrame === null ||
        this.applicationFrame.contentWindow === null
      ) {
        return;
      }
      this.applicationFrame.contentWindow.postMessage(
        JSON.stringify({
          source: "skinweaver",
          payload: JSON.stringify({
            requestId: crypto.randomUUID(),
            service: "skinweaver",
            payload,
          }),
        }),
        "*",
      );
    } catch (error: unknown) {
      console.error("Loomer: Failed to send message to iframe:", error);
    }
  }

  private sendMessage(payload: Record<string, unknown>): void {
    if (this.ready) {
      this.postMessage(payload);
    } else {
      this.pendingMessages.push(payload);
    }
  }

  listenCssVariables(callback: StylesCallback): void {
    this.sendMessage({ action: "listenCssVariables" });
    this.callbacks.push(callback);
  }

  applyCssVariables(
    variables: Record<string, Record<string, string>>,
    persist?: boolean,
  ): void {
    this.sendMessage({ action: "applyCssVariables", variables, persist });
  }

  clearTheme(): void {
    this.sendMessage({ action: "clearTheme" });
  }

  configure(config: Record<string, unknown>): void {
    this.sendMessage({ action: "configure", config });
  }

  on(action: string, callback: StylesCallback): () => void {
    const existing = this.actionHandlers.get(action);
    const list = existing instanceof Array ? existing : [];
    list.push(callback);
    this.actionHandlers.set(action, list);
    return () => {
      const current = this.actionHandlers.get(action);
      if (current instanceof Array) {
        this.actionHandlers.set(
          action,
          current.filter((entry) => entry !== callback),
        );
      }
    };
  }

  enableInspector(): void {
    this.sendMessage({ action: "enableInspector" });
  }

  disableInspector(): void {
    this.sendMessage({ action: "disableInspector" });
  }

  queryElementRect(): void {
    this.sendMessage({ action: "queryElementRect" });
  }

  onElementSelected(callback: StylesCallback): () => void {
    return this.on("elementSelected", callback);
  }

  onElementRect(callback: StylesCallback): () => void {
    return this.on("elementRect", callback);
  }

  applyElementOverride(
    elementId: string,
    declarations: Record<string, string>,
  ): void {
    this.sendMessage({
      action: "applyElementOverride",
      elementId,
      declarations,
    });
  }

  clearElementOverride(elementId: string): void {
    this.sendMessage({ action: "clearElementOverride", elementId });
  }

  getFrame(): HTMLIFrameElement | null {
    return this.applicationFrame;
  }

  teardown(): void {
    this.sendMessage({ action: "teardown" });
  }
}
