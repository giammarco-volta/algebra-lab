import { parseExpression } from "./parser";
import { evaluate } from "./operations";

export type ExpressionResult =
  | {
      ok: true;
      kind: "note" | "interval";
      value: number;
      left: { kind: "note" | "interval"; value: number };
      op: "+" | "-";
      right: { kind: "note" | "interval"; value: number };
    }
  | { ok: false; message: string };

export function evaluateExpression(input: string): ExpressionResult {
  const parsed = parseExpression(input);

  if (!parsed.ok) {
    return { ok: false, message: "Unable to parse expression." };
  }

  const evaluated = evaluate(parsed.left, parsed.op, parsed.right);

  if (!evaluated.ok) {
    if (evaluated.error === "note_plus_note") {
      return {
        ok: false,
        message: "Note + Note is not defined in this algebra.",
      };
    }

    return { ok: false, message: "Unable to parse expression." };
  }

  return {
    ok: true,
    kind: evaluated.result.kind,
    value: evaluated.result.value,
    left: parsed.left,
    op: parsed.op,
    right: parsed.right,
  };
}