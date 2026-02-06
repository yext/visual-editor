import fs from "fs/promises";
import path from "path";

/**
 * Validates interpolation placeholders ({{...}}) against English source values.
 *
 * Default mode auto-fixes locale placeholders only when exactly one variable
 * name mismatches for a key. Placeholder ordering differences are allowed.
 *
 * Use --check-only to disable writing fixes.
 */
const ROOT = path.resolve(process.cwd(), "locales");
const NAMESPACE = "visual-editor.json";
const INSTANCES = ["platform", "components"];
const PRIMARY_LOCALE = "en";
const CHECK_ONLY = process.argv.includes("--check-only");
const INTERPOLATION_REGEX = /\{\{\s*([^{}]+?)\s*\}\}/g;

/**
 * Loads a JSON file and returns {} when missing or invalid.
 */
async function loadJsonSafe(filePath) {
  try {
    return JSON.parse(await fs.readFile(filePath, "utf-8"));
  } catch {
    return {};
  }
}

/**
 * Writes JSON with deterministic indentation and trailing newline.
 */
async function saveJson(filePath, data) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf-8");
}

/**
 * Flattens nested objects into dot-delimited key/value pairs.
 */
function flatten(obj, prefix = "") {
  const result = {};
  for (const key of Object.keys(obj)) {
    const value = obj[key];
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      Object.assign(result, flatten(value, fullKey));
    } else {
      result[fullKey] = String(value ?? "");
    }
  }
  return result;
}

/**
 * Rebuilds nested objects from dot-delimited key/value pairs.
 */
function unflatten(flat) {
  const result = {};
  for (const key of Object.keys(flat)) {
    const parts = key.split(".");
    let cursor = result;
    for (let i = 0; i < parts.length; i += 1) {
      const part = parts[i];
      if (i === parts.length - 1) {
        cursor[part] = flat[key];
      } else {
        cursor[part] ??= {};
        cursor = cursor[part];
      }
    }
  }
  return result;
}

/**
 * Recursively sorts object keys for deterministic output.
 */
function sortObject(obj) {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) {
    return obj;
  }

  return Object.keys(obj)
    .sort()
    .reduce((acc, key) => {
      acc[key] = sortObject(obj[key]);
      return acc;
    }, {});
}

/**
 * Returns sorted locale directories under the given instance path.
 */
async function getLocales(instanceDir) {
  const entries = await fs.readdir(instanceDir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

/**
 * Extracts interpolation expressions in order.
 * Example: "{{count, number}}" -> "count, number"
 */
function extractExpressions(value) {
  return Array.from(value.matchAll(INTERPOLATION_REGEX), (match) =>
    (match[1] ?? "").trim()
  );
}

/**
 * Extracts only the interpolation variable name from an expression.
 * Example: "count, number" -> "count".
 */
function extractVariableName(expression) {
  const [name] = expression.split(",");
  return (name ?? "").trim();
}

/**
 * Builds a frequency map for an array of strings.
 */
function buildCounts(values) {
  const counts = new Map();
  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return counts;
}

/**
 * Computes multiset differences (expected - actual, actual - expected).
 */
function getMultisetDiff(expected, actual) {
  const expectedCounts = buildCounts(expected);
  const actualCounts = buildCounts(actual);
  const missing = [];
  const unexpected = [];

  for (const [name, expectedCount] of expectedCounts.entries()) {
    const actualCount = actualCounts.get(name) ?? 0;
    for (let i = 0; i < expectedCount - actualCount; i += 1) {
      missing.push(name);
    }
  }

  for (const [name, actualCount] of actualCounts.entries()) {
    const expectedCount = expectedCounts.get(name) ?? 0;
    for (let i = 0; i < actualCount - expectedCount; i += 1) {
      unexpected.push(name);
    }
  }

  return { missing, unexpected };
}

/**
 * Escapes special regex characters in a string.
 */
function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Best-effort line lookup for a flattened key in a JSON file.
 */
function findLineNumberForKey(fileContent, key) {
  const leafKey = key.split(".").pop() ?? key;
  const keyPattern = new RegExp(`"${escapeRegex(leafKey)}"\\s*:`, "g");
  const match = keyPattern.exec(fileContent);

  if (!match) {
    return 1;
  }

  return fileContent.slice(0, match.index).split("\n").length;
}

/**
 * Replaces only the variable-name segment of an interpolation expression.
 * Example: "entitytype, number" -> "entityType, number".
 */
function replaceVariableName(expression, variableName) {
  const commaIndex = expression.indexOf(",");
  if (commaIndex === -1) {
    return variableName;
  }
  return `${variableName}${expression.slice(commaIndex)}`;
}

/**
 * Auto-fixes a localized value when exactly one variable name mismatches.
 * Returns null when no safe single-mismatch fix can be applied.
 */
function autoFixSingleVariableMismatch(englishValue, localizedValue) {
  const expectedExpressions = extractExpressions(englishValue);
  const actualExpressions = extractExpressions(localizedValue);
  const expectedVariables = expectedExpressions.map(extractVariableName);
  const actualVariables = actualExpressions.map(extractVariableName);

  if (expectedVariables.length !== actualVariables.length) {
    return null;
  }

  const { missing, unexpected } = getMultisetDiff(
    expectedVariables,
    actualVariables
  );
  const mismatchCount = Math.max(missing.length, unexpected.length);

  if (mismatchCount !== 1 || missing.length !== 1 || unexpected.length !== 1) {
    return null;
  }

  // Identify the specific placeholder occurrence that is "extra" in actual.
  const remainingExpected = buildCounts(expectedVariables);
  const unexpectedIndexes = [];
  for (let i = 0; i < actualVariables.length; i += 1) {
    const variable = actualVariables[i];
    const remaining = remainingExpected.get(variable) ?? 0;
    if (remaining > 0) {
      remainingExpected.set(variable, remaining - 1);
    } else {
      unexpectedIndexes.push(i);
    }
  }

  if (unexpectedIndexes.length !== 1) {
    return null;
  }

  const targetIndex = unexpectedIndexes[0];
  const replacementVariable = missing[0];
  const localizedMatches = Array.from(
    localizedValue.matchAll(INTERPOLATION_REGEX)
  );
  const replacementExpression = replaceVariableName(
    actualExpressions[targetIndex],
    replacementVariable
  );

  let cursor = 0;
  let output = "";
  for (let i = 0; i < localizedMatches.length; i += 1) {
    const match = localizedMatches[i];
    const start = match.index ?? 0;
    const end = start + match[0].length;
    output += localizedValue.slice(cursor, start);
    output += i === targetIndex ? `{{${replacementExpression}}}` : match[0];
    cursor = end;
  }
  output += localizedValue.slice(cursor);
  return output;
}

/**
 * Computes placeholder mismatch details for one key/value pair.
 * Placeholder order differences are considered valid.
 */
function getMismatchDetails(englishValue, localizedValue) {
  const expectedExpressions = extractExpressions(englishValue);
  const actualExpressions = extractExpressions(localizedValue);
  const expectedVariables = expectedExpressions.map(extractVariableName);
  const actualVariables = actualExpressions.map(extractVariableName);
  const { missing, unexpected } = getMultisetDiff(
    expectedVariables,
    actualVariables
  );

  return {
    expectedExpressions,
    actualExpressions,
    expectedVariables,
    actualVariables,
    missing,
    unexpected,
    mismatchCount: Math.max(missing.length, unexpected.length),
  };
}

async function validateInstance(instance) {
  const instanceDir = path.join(ROOT, instance);
  const englishPath = path.join(instanceDir, PRIMARY_LOCALE, NAMESPACE);
  const englishFlat = flatten(await loadJsonSafe(englishPath));
  const locales = await getLocales(instanceDir);
  const issues = [];
  const fixedEntries = [];

  for (const locale of locales) {
    const localePath = path.join(instanceDir, locale, NAMESPACE);
    const localeRaw = await fs.readFile(localePath, "utf-8").catch(() => "");
    const localeFlat = flatten(await loadJsonSafe(localePath));
    let localeChanged = false;

    for (const [key, englishValue] of Object.entries(englishFlat)) {
      const localizedValue = localeFlat[key];
      if (localizedValue === undefined || localizedValue === "") {
        continue;
      }

      const details = getMismatchDetails(englishValue, localizedValue);
      if (details.mismatchCount === 0) {
        continue;
      }

      if (!CHECK_ONLY) {
        const fixedValue = autoFixSingleVariableMismatch(
          englishValue,
          localizedValue
        );
        if (fixedValue !== null && fixedValue !== localizedValue) {
          localeFlat[key] = fixedValue;
          localeChanged = true;
          fixedEntries.push({
            instance,
            locale,
            key,
            file: localePath,
          });
          continue;
        }
      }

      issues.push({
        instance,
        locale,
        file: localePath,
        line: findLineNumberForKey(localeRaw, key),
        key,
        expected: details.expectedVariables,
        actual: details.actualVariables,
        mismatchCount: details.mismatchCount,
      });
    }

    if (localeChanged) {
      const sorted = sortObject(unflatten(localeFlat));
      await saveJson(localePath, sorted);
    }
  }

  return { issues, fixedEntries };
}

async function run() {
  const allIssues = [];
  const allFixedEntries = [];

  for (const instance of INSTANCES) {
    const { issues, fixedEntries } = await validateInstance(instance);
    allIssues.push(...issues);
    allFixedEntries.push(...fixedEntries);
  }

  if (allFixedEntries.length > 0) {
    console.log(
      `Auto-fixed ${allFixedEntries.length} interpolation placeholder mismatch(es).`
    );
    for (const entry of allFixedEntries) {
      console.log(`- [${entry.instance}/${entry.locale}] ${entry.key}`);
    }
  }

  if (allIssues.length === 0) {
    console.log(
      "Interpolation placeholder check passed for platform/components locale files."
    );
    return;
  }

  console.error(
    `Found ${allIssues.length} interpolation placeholder mismatch(es) requiring manual review:`
  );
  for (const issue of allIssues) {
    console.error(
      `- [${issue.instance}/${issue.locale}] ${issue.file}:${issue.line} key=${issue.key}\n  mismatchCount: ${issue.mismatchCount}\n  expected vars: [${issue.expected.join(", ")}]\n  actual vars:   [${issue.actual.join(", ")}]`
    );
  }
  process.exit(1);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
