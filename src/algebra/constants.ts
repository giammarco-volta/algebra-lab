// src/algebra/constants.ts

export const FIFTH = 1;
export const OCTAVE = 84;
export const OCTAVES = 48;
export const PERIOD = OCTAVE * OCTAVES; // 4032

export const CHROMATIC_SEMITONE_UP = 7 * FIFTH - 4 * OCTAVE; // -329
export const DIATONIC_SEMITONE_UP = -5 * FIFTH + 3 * OCTAVE; // 247
export const WHOLE_TONE_UP = 2 * FIFTH - OCTAVE; // -82

export function positiveMod(a: number, m: number): number {
  return ((a % m) + m) % m;
}

export function centeredMod(a: number, m: number): number {
  return positiveMod(a + m / 2, m) - m / 2;
}

export function normalize(v: number): number {
  return positiveMod(v, PERIOD);
}

export function floorDiv(a: number, b: number): number {
  const q = Math.trunc(a / b);
  const r = a % b;
  return r !== 0 && (r > 0) !== (b > 0) ? q - 1 : q;
}