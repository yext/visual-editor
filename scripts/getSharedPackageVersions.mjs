import { readFile } from "node:fs/promises";

/**
 * @typedef {Record<string, string>} DependencyMap
 */

/**
 * @typedef {{
 *   dependencies?: DependencyMap,
 *   devDependencies?: DependencyMap,
 *   peerDependencies?: DependencyMap,
 * }} PackageManifest
 */

const excludedPackageNames = new Set(["@yext/visual-editor"]);

/**
 * Builds a lookup of every dependency version the visual-editor package can source from.
 *
 * The order is intentional:
 * 1. Runtime dependencies are used when present.
 * 2. Peer dependencies can also supply versions for starter runtime dependencies.
 * 3. Dev dependencies fill in shared tooling versions like TypeScript or Vite.
 *
 * @param {PackageManifest} packageManifest
 * @returns {DependencyMap}
 */
function getSourceDependencyLookup(packageManifest) {
  return {
    ...packageManifest.dependencies,
    ...packageManifest.peerDependencies,
    ...packageManifest.devDependencies,
  };
}

/**
 * Finds package names that exist in both manifests and returns the visual-editor version for each.
 *
 * @param {PackageManifest} sourceManifest
 * @param {PackageManifest} targetManifest
 * @returns {DependencyMap}
 */
function getSharedPackageVersions(sourceManifest, targetManifest) {
  const sourceDependencyLookup = getSourceDependencyLookup(sourceManifest);
  const sharedPackageVersions = {};

  for (const sectionName of ["dependencies", "devDependencies"]) {
    const targetDependencies = targetManifest[sectionName] ?? {};

    for (const packageName of Object.keys(targetDependencies)) {
      if (excludedPackageNames.has(packageName)) {
        continue;
      }

      const version = sourceDependencyLookup[packageName];
      if (version) {
        sharedPackageVersions[packageName] = version;
      }
    }
  }

  return Object.fromEntries(
    Object.entries(sharedPackageVersions).sort(([leftName], [rightName]) =>
      leftName.localeCompare(rightName),
    ),
  );
}

/**
 * @param {string} filePath
 * @returns {Promise<PackageManifest>}
 */
async function readPackageManifest(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

async function main() {
  const [sourceManifestPath, targetManifestPath] = process.argv.slice(2);
  if (!sourceManifestPath || !targetManifestPath) {
    throw new Error(
      "Expected source and target package.json paths: node getSharedPackageVersions.mjs <source> <target>",
    );
  }

  const [sourceManifest, targetManifest] = await Promise.all([
    readPackageManifest(sourceManifestPath),
    readPackageManifest(targetManifestPath),
  ]);

  const sharedPackageVersions = getSharedPackageVersions(
    sourceManifest,
    targetManifest,
  );

  console.log(
    `shared_package_versions=${JSON.stringify(sharedPackageVersions)}`,
  );
}

await main();
