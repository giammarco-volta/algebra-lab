import type { Note, Interval } from "./types";
import { centeredMod, PERIOD } from "./constants";

export type AlgebraValue = Note | Interval;

export type EvalResult =
  | { ok: true; result: AlgebraValue }
  | { ok: false; error: "note_plus_note" | "undefined_operation" };

export function evaluate(
  left: AlgebraValue,
  op: "+" | "-",
  right: AlgebraValue
): EvalResult {
  if (left.kind === "note" && op === "+" && right.kind === "note") {
    return { ok: false, error: "note_plus_note" };
  }

  if (left.kind === "note" && op === "-" && right.kind === "note") {
    return {
      ok: true,
      result: {
        kind: "interval",
        value: centeredMod(left.value - right.value, PERIOD),
      },
    };
  }

  if (left.kind === "note" && right.kind === "interval") {
    return {
      ok: true,
      result: {
        kind: "note",
        value:
          op === "+"
            ? centeredMod(left.value + right.value, PERIOD)
            : centeredMod(left.value - right.value, PERIOD),
      },
    };
  }

  if (left.kind === "interval" && right.kind === "interval") {
    return {
      ok: true,
      result: {
        kind: "interval",
        value:
          op === "+"
            ? centeredMod(left.value + right.value, PERIOD)
            : centeredMod(left.value - right.value, PERIOD),
      },
    };
  }

  return { ok: false, error: "undefined_operation" };
}