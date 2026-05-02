// src/algebra/types.ts

export type AlgebraicKind = "note" | "interval";

export type Note = {
  kind: "note";
  value: number;
};

export type Interval = {
  kind: "interval";
  value: number;
};