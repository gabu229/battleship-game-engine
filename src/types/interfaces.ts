import type { CellState, Direction, ShipType, WeaponType } from "./enums";

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
  readonly isHit: boolean;
  //   TODO: Store value of other states
}

export interface Ship {
  readonly id: string;
  readonly type: ShipType;
  readonly length: number;
  readonly coordinates: ReadonlyArray<Coordinate>;
  readonly hits: ReadonlyArray<Coordinate>;
  readonly isDestroyed: boolean;
  //   TODO: Store value of other states
}

export interface ShipPlacement {
  readonly type: ShipType;
  readonly start: Coordinate;
  readonly direction: Direction;
}

export interface PlacementValidationResult {
  readonly valid: boolean;
  readonly error?: string;
}

export interface IWeapon {
  readonly type: WeaponType;
  readonly name: string;
  readonly isSonar: boolean;
  generateTargetCoordinates(
    origin: Coordinate,
    boardSize: number,
  ): ReadonlyArray<Coordinate>;
}