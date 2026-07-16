/**
 * UGT harness stdio server — the Node IO SHELL around the pure
 * src/harness/harness-core.ts dispatch core.
 *
 * Protocol: one JSON request per stdin line → one JSON response per stdout
 * line, strictly in order. All protocol behavior (ops, errors, hashing)
 * lives in the typechecked, vitest-covered core; Node globals (process,
 * readline) live ONLY here.
 *
 * Runs under bare `node` (>=24, native TS type-stripping) via the
 * `.ts`-extension resolve hook:
 *
 *   node harness/ugt-harness.mjs
 */
import { createInterface } from "node:readline";
import { register } from "node:module";

register("./ts-resolve-hook.mjs", import.meta.url);

const { createRegistry, dispatch, parseRequestLine } = await import(
  "../src/harness/harness-core.ts"
);

const registry = createRegistry();

const rl = createInterface({ input: process.stdin, terminal: false });

rl.on("line", (line) => {
  const trimmed = line.trim();
  if (trimmed === "") return;
  const parsed = parseRequestLine(trimmed);
  const response = parsed.ok
    ? dispatch(parsed.request, registry)
    : parsed.response;
  process.stdout.write(JSON.stringify(response) + "\n");
});

rl.on("close", () => {
  process.exit(0);
});
