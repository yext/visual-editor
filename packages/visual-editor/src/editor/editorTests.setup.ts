// Mock ResizeObserver (used by a dependency of Puck) in non-browser tests
try {
  if (typeof global.ResizeObserver === "undefined") {
    global.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }

  if (typeof HTMLElement !== "undefined") {
    HTMLElement.prototype.scrollIntoView ??= () => {};
  }
} catch {
  // browser environment
}
