const excludedKeys = new Set([
  "q",
  "initialLocation",
  "draft",
  "history",
  "xYextDebugPage",
]);

/** Add the current query to eligible links at activation. Return a function that removes the listeners. */
export function installPassThroughUrlParameters(): () => void {
  const updatedLinks = new WeakMap<
    HTMLAnchorElement,
    { originalHref: string; updatedHref: string }
  >();

  function passThroughUrlParameters(event: MouseEvent): void {
    if (event.defaultPrevented || event.button > 1) {
      return;
    }

    const link = event
      .composedPath()
      .find((target) => target instanceof HTMLAnchorElement);
    if (!link || link.hasAttribute("download")) {
      return;
    }

    const previous = updatedLinks.get(link);
    if (previous) {
      updatedLinks.delete(link);
      if (link.getAttribute("href") === previous.updatedHref) {
        link.setAttribute("href", previous.originalHref);
      }
    }

    const incomingSearch = window.location.search;
    const originalHref = link.getAttribute("href");
    if (originalHref === null || !incomingSearch) {
      return;
    }
    const href = originalHref.trim();
    if (!href || href.startsWith("#")) {
      return;
    }

    let destination: URL;
    try {
      destination = new URL(href, document.baseURI);
    } catch {
      return;
    }
    if (destination.protocol !== "http:" && destination.protocol !== "https:") {
      return;
    }

    const occupiedKeys = new Set(destination.searchParams.keys());
    const incomingKeys = new URLSearchParams(incomingSearch).keys();
    const pairsToAppend: string[] = [];
    // Compare decoded keys. Copy each accepted pair with its original encoding.
    for (const pair of incomingSearch.slice(1).split("&")) {
      if (!pair) {
        continue;
      }
      const { value: key, done } = incomingKeys.next();
      if (!done && !occupiedKeys.has(key) && !excludedKeys.has(key)) {
        occupiedKeys.add(key);
        pairsToAppend.push(pair);
      }
    }
    if (pairsToAppend.length === 0) {
      return;
    }

    const fragmentIndex = href.indexOf("#");
    const beforeFragment =
      fragmentIndex < 0 ? href : href.slice(0, fragmentIndex);
    const fragment = fragmentIndex < 0 ? "" : href.slice(fragmentIndex);
    let separator = "?";
    if (beforeFragment.includes("?")) {
      separator =
        beforeFragment.endsWith("?") || beforeFragment.endsWith("&") ? "" : "&";
    }

    const updatedHref =
      beforeFragment + separator + pairsToAppend.join("&") + fragment;
    const update = { originalHref, updatedHref };
    updatedLinks.set(link, update);
    link.setAttribute("href", updatedHref);
    // Restore the link after the browser uses it. Keep any later change from page code.
    window.setTimeout(() => {
      if (updatedLinks.get(link) !== update) {
        return;
      }
      updatedLinks.delete(link);
      if (link.getAttribute("href") === updatedHref) {
        link.setAttribute("href", originalHref);
      }
    }, 0);
  }

  document.addEventListener("click", passThroughUrlParameters, true);
  document.addEventListener("auxclick", passThroughUrlParameters, true);
  return () => {
    document.removeEventListener("click", passThroughUrlParameters, true);
    document.removeEventListener("auxclick", passThroughUrlParameters, true);
  };
}
