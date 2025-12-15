/**
 * Clears Puck's internal cache to prevent memory leaks when processing many pages.
 *
 * Puck's resolveComponentData maintains a module-level cache that stores resolved
 * data per component ID. This cache never gets cleared, causing memory to accumulate
 * when processing many unique pages. This function clears that cache.
 *
 * The cache is exported from @measured/puck's resolve-component-data module.
 * We access it via Node.js require.cache to clear it after each page processing.
 */
/**
 * Gets the current size of Puck's cache for logging purposes
 */
export function getPuckCacheSize(): number {
  try {
    const puckPath = require.resolve("@measured/puck");
    const puckModule = require.cache[puckPath];

    if (!puckModule) {
      return -1;
    }

    const exports = puckModule.exports;

    if (exports?.cache?.lastChange) {
      return Object.keys(exports.cache.lastChange).length;
    }

    try {
      const resolveComponentDataPath = require.resolve(
        "@measured/puck/lib/resolve-component-data"
      );
      const resolveModule = require.cache[resolveComponentDataPath];
      if (resolveModule?.exports?.cache?.lastChange) {
        return Object.keys(resolveModule.exports.cache.lastChange).length;
      }
    } catch {
      // Module path might be different, continue to next attempt
    }

    if (typeof require.cache === "object") {
      for (const [modulePath, module] of Object.entries(require.cache)) {
        if (modulePath.includes("puck") && module?.exports?.cache?.lastChange) {
          return Object.keys(module.exports.cache.lastChange).length;
        }
      }
    }
  } catch {
    // Silently fail
  }
  return -1;
}

// Direct import for Deno/ESM compatibility
// This will work in both Node.js and Deno
// Note: We can't import this at build time as it's not exported, so we'll access it via require.cache at runtime
let puckCacheModule: { cache?: { lastChange?: Record<string, any> } } | null =
  null;

export function clearPuckCache(): void {
  const cacheSizeBefore = getPuckCacheSize();

  try {
    // Try direct module reference first (works if module was already loaded)
    if (puckCacheModule?.cache?.lastChange) {
      const sizeBefore = Object.keys(puckCacheModule.cache.lastChange).length;
      puckCacheModule.cache.lastChange = {};
      console.log(
        `[Puck Cache] clearPuckCache: Cleared ${sizeBefore} entries via direct module (was ${sizeBefore}, now 0)`
      );
      return;
    }

    // Node.js approach - Access Puck's module from require cache
    // This works in Node.js but not in Deno
    if (
      typeof require !== "undefined" &&
      typeof require.cache !== "undefined"
    ) {
      try {
        const puckPath = require.resolve("@measured/puck");
        const puckModule = require.cache[puckPath];

        if (!puckModule) {
          if (cacheSizeBefore >= 0) {
            console.log(
              `[Puck Cache] clearPuckCache: Puck module not found in require cache`
            );
          }
          return;
        }

        // Try to find the cache in the module exports
        const exports = puckModule.exports;

        // Check if cache is directly on exports
        if (exports?.cache?.lastChange) {
          const sizeBefore = Object.keys(exports.cache.lastChange).length;
          exports.cache.lastChange = {};
          console.log(
            `[Puck Cache] clearPuckCache: Cleared ${sizeBefore} entries (was ${sizeBefore}, now 0)`
          );
          return;
        }

        // Try to access via internal module path
        try {
          const resolveComponentDataPath = require.resolve(
            "@measured/puck/lib/resolve-component-data"
          );
          const resolveModule = require.cache[resolveComponentDataPath];
          if (resolveModule?.exports?.cache?.lastChange) {
            const sizeBefore = Object.keys(
              resolveModule.exports.cache.lastChange
            ).length;
            resolveModule.exports.cache.lastChange = {};
            console.log(
              `[Puck Cache] clearPuckCache: Cleared ${sizeBefore} entries (was ${sizeBefore}, now 0)`
            );
            return;
          }
        } catch {
          // Module path might be different, continue to next attempt
        }

        // Last resort: search through all cached modules for the cache object
        for (const [modulePath, module] of Object.entries(require.cache)) {
          if (
            modulePath.includes("puck") &&
            module?.exports?.cache?.lastChange
          ) {
            const sizeBefore = Object.keys(
              module.exports.cache.lastChange
            ).length;
            module.exports.cache.lastChange = {};
            console.log(
              `[Puck Cache] clearPuckCache: Cleared ${sizeBefore} entries via search (was ${sizeBefore}, now 0)`
            );
            return;
          }
        }
      } catch {
        // require not available or failed
      }
    }

    if (cacheSizeBefore >= 0) {
      console.log(
        `[Puck Cache] clearPuckCache: Cache not found (size was ${cacheSizeBefore})`
      );
    }
  } catch (_error) {
    // Log error for debugging
    console.error(
      `[Puck Cache] clearPuckCache: Error clearing cache (size before: ${cacheSizeBefore}):`,
      _error
    );
  }
}
