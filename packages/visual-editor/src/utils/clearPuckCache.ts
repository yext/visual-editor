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
export function clearPuckCache(): void {
  try {
    // Access Puck's module from Node.js require cache
    // This works because the plugin runs in Node.js during build time
    const puckPath = require.resolve("@measured/puck");
    const puckModule = require.cache[puckPath];

    if (!puckModule) {
      return;
    }

    // Try to find the cache in the module exports
    // The cache is in the resolve-component-data submodule
    const exports = puckModule.exports;

    // Check if cache is directly on exports
    if (exports?.cache?.lastChange) {
      exports.cache.lastChange = {};
      return;
    }

    // Try to access via internal module path
    // Puck's structure: @measured/puck/lib/resolve-component-data
    try {
      const resolveComponentDataPath = require.resolve(
        "@measured/puck/lib/resolve-component-data"
      );
      const resolveModule = require.cache[resolveComponentDataPath];
      if (resolveModule?.exports?.cache?.lastChange) {
        resolveModule.exports.cache.lastChange = {};
        return;
      }
    } catch {
      // Module path might be different, continue to next attempt
    }

    // Last resort: search through all cached modules for the cache object
    if (typeof require.cache === "object") {
      for (const [modulePath, module] of Object.entries(require.cache)) {
        if (modulePath.includes("puck") && module?.exports?.cache?.lastChange) {
          module.exports.cache.lastChange = {};
          return;
        }
      }
    }
  } catch (_error) {
    // Silently fail - this is a best-effort cleanup
    // If we can't clear the cache, it's not a critical error
    // The alternative would be to use "force" trigger which bypasses cache
    // but that would hurt performance
  }
}
