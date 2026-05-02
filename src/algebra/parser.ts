// src/algebra/parser.ts

import type { Note, Interval } from "./types";
import { valueFromSpelling, type Letter } from "./spelling";
import { parseIntervalName } from "./intervals";

export function parseInterval(text: string): Interval | null {
  const value = parseIntervalName(text);
  if (value === null) return null;

  return {
    kind: "interval",
    value,
  };
}

function parseAccidentals(text: string): number {
  let value = 0;

  for (const ch of text) {
    if (ch === "#") value += 1;
    else if (ch === "b") value -= 1;
    else return NaN;
  }

  return value;
}

export function parseNote(text: string): Note | null {
  const trimmed = text.trim();

  const match =
    trimmed.match(/^([A-Ga-g])([#b]*)(\d+)$/) ??
    trimmed.match(/^([A-Ga-g])(\d+)([#b]*)$/);

  if (!match) return null;

  const l = match[1].toUpperCase() as Letter;

  let accidentalText: string;
  let octave: number;

  if (/^\d+$/.test(match[2])) {
    // Old style: C6#
    octave = Number(match[2]);
    accidentalText = match[3];
  } else {
    // Standard style: C#6
    accidentalText = match[2];
    octave = Number(match[3]);
  }

  const accidentalCount = parseAccidentals(accidentalText);

  if (!Number.isFinite(accidentalCount)) return null;

  return {
    kind: "note",
    value: valueFromSpelling(l, accidentalCount, octave),
  };
}

export type ParsedExpression =
  | {
      ok: true;
      left: Note | Interval;
      op: "+" | "-";
      right: Note | Interval;
    }
  | {
      ok: false;
      error: "unable";
    };

export function parseExpression(input: string): ParsedExpression {
  const match = input.trim().match(/^(.+?)\s*([+-])\s*(.+)$/);

  if (!match) {
    return { ok: false, error: "unable" };
  }

  const leftText = match[1].trim();
  const op = match[2] as "+" | "-";
  const rightText = match[3].trim();

  const left = parseNote(leftText) ?? parseInterval(leftText);
  const right = parseNote(rightText) ?? parseInterval(rightText);

  if (!left || !right) {
    return { ok: false, error: "unable" };
  }

  return { ok: true, left, op, right };
}