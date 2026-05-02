import { OCTAVE, floorDiv, normalize, centeredMod, positiveMod } from "./constants";

const TET_STEPS: Record<
  number,
  { chromaticSemitone: number; diatonicSemitone: number; tone: number; fifth: number }
> = {
  12: { chromaticSemitone: 1, diatonicSemitone: 1, tone: 2, fifth: 7 },
  19: { chromaticSemitone: 1, diatonicSemitone: 2, tone: 3, fifth: 11 },
  31: { chromaticSemitone: 2, diatonicSemitone: 3, tone: 5, fifth: 18 },
  43: { chromaticSemitone: 3, diatonicSemitone: 4, tone: 7, fifth: 25 },
  45: { chromaticSemitone: 2, diatonicSemitone: 5, tone: 7, fifth: 26 },
  53: { chromaticSemitone: 5, diatonicSemitone: 4, tone: 9, fifth: 31 },
  55: { chromaticSemitone: 4, diatonicSemitone: 5, tone: 9, fifth: 32 },
};

export function stepClassInTET(value: number, divisions: number): number {
  return positiveMod(absoluteStepsInTET(value, divisions), divisions);
}

export function noteFrequencyHz(value: number, divisions: number): number {
  const steps = absoluteStepsInTET(value, divisions);

  // A4 in this algebra is 4 octaves + A = 4*84 + (3 - 84)
  const a4Value = 4 * 84 + (3 - 84);
  const a4Steps = absoluteStepsInTET(a4Value, divisions);

  return 440 * Math.pow(2, (steps - a4Steps) / divisions);
}


/* =========================
   FIFTH → TET PROJECTION
========================= */

function fifthSteps(divisions: number): number {
  return TET_STEPS[divisions].fifth;
}

export function noteOctave(value: number): number {
  return positiveMod(floorDiv(7 * normalize(value), 12), 48);
}

export function noteStepInTET(value: number, divisions: number): number {
  const k = fifthSteps(divisions);
  return positiveMod(k * value, divisions);
}

export function stepsInTET(value: number, divisions: number): number {
  return absoluteStepsInTET(value, divisions);
}

/* =========================
   NOTE FORMATTING
========================= */

export function formatNoteInTET(value: number, divisions: number): string {
  const totalSteps = absoluteStepsInTET(value, divisions);

  const octave = floorDiv(totalSteps, divisions);
  const step = positiveMod(totalSteps, divisions);
  const cents = (step * 1200) / divisions;

  return `C${octave} + ${cents.toFixed(2)} cents`;
}

export function midiNote(value: number): number {
  const oct = noteOctave(value);
  const step = noteStepInTET(value, 12);
  return 12 + oct * 12 + step;
}

/* =========================
   INTERVAL PROJECTION
========================= */

function decompose(value: number): { fifths: number; octaves: number } {
  const fifths = centeredMod(value, OCTAVE);
  const octaves = floorDiv(value - fifths, OCTAVE);

  return { fifths, octaves };
}

export function absoluteStepsInTET(value: number, divisions: number): number {
  const { fifths, octaves } = decompose(value);
  return fifths * fifthSteps(divisions) + octaves * divisions;
}

export function intervalCents(value: number, divisions: number): number {
  const steps = absoluteStepsInTET(value, divisions);
  return (steps * 1200) / divisions;
}



