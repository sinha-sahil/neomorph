export class Weaver {
  static inject(version: string = "1.0.0"): void {
    if (typeof document === "undefined") {
      console.warn("🕸️ Weaver: inject() called in non-browser environment");
      return;
    }

    try {
      const script = document.createElement("script");
      script.src = `https://cdn.jsdelivr.net/gh/sinha-sahil/skin-walker/build/weaver/${version}/index.js`;
      script.type = "text/javascript";
      document.head.appendChild(script);
    } catch (error: unknown) {
      console.error("🕸️ Weaver: Failed to inject weaver script:", error);
    }
  }
}
