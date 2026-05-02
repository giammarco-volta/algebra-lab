import type { AlgebraicKind } from "./types";
import { noteName } from "./spelling";
import { intervalName } from "./intervals";

export function formatResult(kind: AlgebraicKind, value: number): string {
  if (kind === "note") {
    return noteName(value);
  }

  return intervalName(value);
}