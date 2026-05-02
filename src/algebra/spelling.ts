import {
  CHROMATIC_SEMITONE_UP,
  OCTAVE,
  PERIOD,
  WHOLE_TONE_UP,
  centeredMod,
  floorDiv,
  normalize,
  positiveMod,
} from "./constants";

export type Letter = "C" | "D" | "E" | "F" | "G" | "A" | "B";

const lettersByFifthDegree: Letter[] = ["C", "G", "D", "A", "E", "B", "F"];

export function fifthDegree(value: number): number {
  return positiveMod(value, 7);
}

export function pitchClass(value: number): number {
  return positiveMod(value, 12);
}

export function octaveMod48(value: number): number {
  return positiveMod(floorDiv(7 * normalize(value), 12), 48);
}

export function octaveCentered(value: number): number {
  return centeredMod(octaveMod48(value), 48);
}

export function letter(value: number): Letter {
  return lettersByFifthDegree[fifthDegree(value)];
}

// function naturalPitchClass(l: Letter): number {
//   switch (l) {
//     case "C": return 0;
//     case "D": return 2;
//     case "E": return 4;
//     case "F": return 5;
//     case "G": return 7;
//     case "A": return 9;
//     case "B": return 11;
//   }
// }

// function centeredMod12Accidental(x: number): number {
//   return positiveMod(x + 6, 12) - 6;
// }

export function accidental(value: number): number {
  const l = letter(value);
  const oct = octaveMod48(value);

  const natural = normalize(naturalValueAtOctave0(l) + oct * OCTAVE);
  const diff = centeredMod(normalize(value) - natural, PERIOD);

  if (diff % CHROMATIC_SEMITONE_UP !== 0) {
    return 0;
  }

  return diff / CHROMATIC_SEMITONE_UP;
}

export function accidentalString(a: number): string {
  if (a === 0) return "";
  return a > 0 ? "#".repeat(a) : "b".repeat(-a);
}

export function naturalValueAtOctave0(l: Letter): number {
  switch (l) {
    case "C": return 0;
    case "D": return WHOLE_TONE_UP;
    case "E": return 2 * WHOLE_TONE_UP;
    case "F": return -1 + OCTAVE;
    case "G": return 1;
    case "A": return 3 - OCTAVE;
    case "B": return 5 - 2 * OCTAVE;
  }
}

export function valueFromSpelling(
  l: Letter,
  accidentalCount: number,
  octave: number
): number {
  return normalize(
    naturalValueAtOctave0(l) +
      accidentalCount * CHROMATIC_SEMITONE_UP +
      octave * OCTAVE
  );
}

export function noteName(value: number): string {
  const l = letter(value);
  return `${l}${accidentalString(accidental(value))}${octaveMod48(value)}`;
}

export function intervalName(value: number): string {
  // provvisorio, come nell'hpp: poi lo sostituiamo con IIImaj, IVaug2, ecc.
  return `${centeredMod(normalize(value), PERIOD)}`;
}