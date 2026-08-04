import type { CellState } from "./enums";

/**
 * Coordinate on the game board
 */
export interface Coordinate {
  readonly x: number;
  readonly y: number;
}

export interface Board {
  readonly cells: ReadonlyArray<Cell>;
  readonly ships: ReadonlyArray<Ship>;
}

export interface Cell {
  readonly coordinate: Coordinate;
  readonly state: CellState;
  readonly shipId: string | null;
  //   TODO: Store value of other states
}

export interface Ship {
  readonly id: string;
  readonly type: string;
  readonly length: number;
  readonly coordinates: ReadonlyArray<Coordinate>;
  //   TODO: Store value of other states
}
