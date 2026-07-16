/**
 * Module-resolution hook for harness/ugt-harness.mjs.
 *
 * The src/ tree uses bundler-style EXTENSIONLESS relative imports
 * (`import { x } from "../types/game-state"`). Node's plain ESM resolver
 * requires an explicit extension, so running the real engine under bare
 * `node` (>=24, which strips TS types natively) fails to resolve internal
 * files. This hook retries any unresolved relative specifier with a `.ts`
 * extension. Same pattern as DDD's packages/harness/bin/ts-resolve-hook.mjs.
 */
const RELATIVE = /^\.{1,2}\//;
const HAS_EXT = /\.[mc]?[jt]s$/;

export async function resolve(specifier, context, nextResolve) {
  try {
    return await nextResolve(specifier, context);
  } catch (err) {
    if (RELATIVE.test(specifier) && !HAS_EXT.test(specifier)) {
      return await nextResolve(`${specifier}.ts`, context);
    }
    throw err;
  }
}
