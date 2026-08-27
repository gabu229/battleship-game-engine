import type { Coordinate, Cell as SerializedCell } from "../types";
import { CellState } from "../types";
import type { Ship } from "./ship";

export class Cell {
  private constructor(
    private readonly _coordinate: Coordinate,
    private readonly _ship: Ship | null,
    private readonly _isHit: boolean,
  ) {}

  static create(coordinate: Coordinate): Cell {
    return new Cell(coordinate, null, false);
  }

  get ship(): Ship | null {
    return this._ship;
  }

  withShip(ship: Ship): Cell {
    return new Cell(this._coordinate, ship, this._isHit);
  }

  withHit(): Cell {
    return new Cell(this._coordinate, this._ship, true);
  }

  get hasShip(): boolean {
    return this._ship !== null;
  }

  get coordinate(): Coordinate {
    return this._coordinate;
  }

  get isHit(): boolean {
    return this._isHit;
  }

  get state(): CellState {
    if (!this._isHit) {
      return this._ship ? CellState.Ship : CellState.Empty;
    }
    return this._ship ? CellState.Hit : CellState.Miss;
  }

  getVisibleState(isOwnBoard: boolean): CellState {
    // Visible to owned board
    if (isOwnBoard) return this.state;

    // Hidden for untouched cell in opponent board
    if (!this._isHit) return CellState.Unknown;

    // Reveals hit or miss state for opponent
    return this._ship ? CellState.Hit : CellState.Miss;
  }

  serialize(): SerializedCell {
    return {
      coordinate: this._coordinate,
      state: this.state,
      shipId: this._ship?.id ?? null,
      isHit: this._isHit,
    };
  }
}
