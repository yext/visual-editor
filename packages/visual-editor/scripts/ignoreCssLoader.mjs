// @ts-nocheck

export async function resolve(specifier, context, nextResolve) {
  if (specifier.endsWith(".css")) {
    return {
      shortCircuit: true,
      url: new URL(specifier, context.parentURL).href,
    };
  }

  return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
  if (url.endsWith(".css")) {
    return {
      format: "module",
      shortCircuit: true,
      source: "export default {};",
    };
  }

  return nextLoad(url, context);
}
