import {
  CHROMATIC_SEMITONE_UP,
  OCTAVE,
  PERIOD,
  centeredMod,
  normalize,
  //positiveMod,
} from "./constants";

function parseRomanDegree(text: string): number | null {
  if (!/^[IVXLCDM]+$/.test(text)) return null;

  const values: Record<string, number> = {
    I: 1,
    V: 5,
    X: 10,
    L: 50,
    C: 100,
    D: 500,
    M: 1000,
  };

  let total = 0;

  for (let i = 0; i < text.length; i++) {
    const current = values[text[i]];
    const next = i + 1 < text.length ? values[text[i + 1]] : 0;

    if (current < next) {
      total -= current;
    } else {
      total += current;
    }
  }

  return total >= 1 ? total : null;
}

function isPerfectFamily(degree: number): boolean {
  const simple = ((degree - 1) % 7) + 1;
  return simple === 1 || simple === 4 || simple === 5;
}

function baseIntervalValue(degree: number): number {
  // degree 1 = unison, degree 2 = second, ecc.
  // ogni grado diatonico corrisponde a un passo nella catena delle quinte,
  // poi si compensa l'ottava dove serve.
  const simple = ((degree - 1) % 7) + 1;
  const octaves = Math.floor((degree - 1) / 7);

  switch (simple) {
    case 1: return octaves * OCTAVE;
    case 2: return octaves * OCTAVE + (2 - OCTAVE);       // major second
    case 3: return octaves * OCTAVE + (4 - 2 * OCTAVE);   // major third
    case 4: return octaves * OCTAVE + (-1 + OCTAVE);      // perfect fourth
    case 5: return octaves * OCTAVE + 1;                  // perfect fifth
    case 6: return octaves * OCTAVE + (3 - OCTAVE);       // major sixth
    case 7: return octaves * OCTAVE + (5 - 2 * OCTAVE);   // major seventh
    default: return 0;
  }
}

export function parseIntervalName(text: string): number | null {
  const trimmed = text.trim();

  const sign = trimmed.startsWith("-") ? -1 : 1;
  const unsignedText = trimmed.startsWith("-") ? trimmed.slice(1).trim() : trimmed;

  const match = unsignedText.match(
    /^([IVXLCDM]+)(perf|maj|min|dim\d*|aug\d*)$/
  );

  if (!match) return null;

  const degree = parseRomanDegree(match[1]);
  if (degree === null) return null;

  const quality = match[2];
  const perfectFamily = isPerfectFamily(degree);

  let alteration = 0;

  if (quality === "perf") {
    if (!perfectFamily) return null;
    alteration = 0;
  } else if (quality === "maj") {
    if (perfectFamily) return null;
    alteration = 0;
  } else if (quality === "min") {
    if (perfectFamily) return null;
    alteration = -1;
  } else if (quality.startsWith("aug")) {
    const n = quality === "aug" ? 1 : Number(quality.slice(3));
    if (!Number.isInteger(n) || n < 1) return null;
    alteration = n;
  } else if (quality.startsWith("dim")) {
    const n = quality === "dim" ? 1 : Number(quality.slice(3));
    if (!Number.isInteger(n) || n < 1) return null;

    // Per intervalli major/minor:
    // dim = min - 1 = maj - 2
    // dim2 = maj - 3, ecc.
    //
    // Per intervalli perfect:
    // dim = perf - 1
    alteration = perfectFamily ? -n : -(n + 1);
  }

  return normalize(sign * (baseIntervalValue(degree) + alteration * CHROMATIC_SEMITONE_UP));
}

function toRoman(n: number): string {
  const table: Array<[number, string]> = [
    [1000, "M"],
    [900, "CM"],
    [500, "D"],
    [400, "CD"],
    [100, "C"],
    [90, "XC"],
    [50, "L"],
    [40, "XL"],
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];

  let x = n;
  let out = "";

  for (const [value, symbol] of table) {
    while (x >= value) {
      out += symbol;
      x -= value;
    }
  }

  return out;
}

// function degreeFromValue(value: number): number {
//   const v = normalize(value);
//   const simpleDegree = positiveMod(v, 7) + 1;
//   const octave = Math.floor((7 * v) / 12);
//   return simpleDegree + 7 * octave;
// }

function qualityFromAlteration(
  degree: number,
  alterationFromMajorOrPerfect: number
): string {
  const perfectFamily = isPerfectFamily(degree);

  if (perfectFamily) {
    if (alterationFromMajorOrPerfect === 0) return "perf";
    if (alterationFromMajorOrPerfect > 0) {
      return alterationFromMajorOrPerfect === 1
        ? "aug"
        : `aug${alterationFromMajorOrPerfect}`;
    }

    const n = -alterationFromMajorOrPerfect;
    return n === 1 ? "dim" : `dim${n}`;
  }

  if (alterationFromMajorOrPerfect === 0) return "maj";
  if (alterationFromMajorOrPerfect === -1) return "min";

  if (alterationFromMajorOrPerfect > 0) {
    return alterationFromMajorOrPerfect === 1
      ? "aug"
      : `aug${alterationFromMajorOrPerfect}`;
  }

  const n = -alterationFromMajorOrPerfect - 1;
  return n === 1 ? "dim" : `dim${n}`;
}

function degreeAndAlterationFromValue(
  value: number
): { sign: 1 | -1; degree: number; alteration: number } | null {
  const centeredValue = centeredMod(value, PERIOD);

  let best:
    | { sign: 1 | -1; degree: number; alteration: number }
    | null = null;

  for (const sign of [1, -1] as const) {
    for (let degree = 1; degree <= 336; degree++) {
      const base = sign * baseIntervalValue(degree);

      const diff = centeredMod(centeredValue - centeredMod(base, PERIOD), PERIOD);

      if (diff % (sign * CHROMATIC_SEMITONE_UP) !== 0) {
        continue;
      }

      const alteration = diff / (sign * CHROMATIC_SEMITONE_UP);

      const candidate = { sign, degree, alteration };

      if (
        best === null ||
        candidate.degree < best.degree ||
        (candidate.degree === best.degree &&
          Math.abs(candidate.alteration) < Math.abs(best.alteration)) ||
        (candidate.degree === best.degree &&
          Math.abs(candidate.alteration) === Math.abs(best.alteration) &&
          candidate.sign === 1)
      ) {
        best = candidate;
      }
    }
  }

  return best;
}

export function intervalName(value: number): string {
  const decoded = degreeAndAlterationFromValue(value);

  if (!decoded) {
    return centeredMod(value, PERIOD).toString();
  }

  const name = `${toRoman(decoded.degree)}${qualityFromAlteration(
    decoded.degree,
    decoded.alteration
  )}`;

  return decoded.sign === -1 ? `-${name}` : name;
}