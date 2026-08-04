import type { Coordinate, Cell as SerializedCell } from "../types";
import { CellState } from "../types";

export class Cell {
  private constructor(private readonly _coordinate: Coordinate) {}

  static create(coordinate: Coordinate): Cell {
    return new Cell(coordinate);
  }

  get coordinate(): Coordinate {
    return this._coordinate;
  }

  get state(): CellState {
    // TODO: Process original cellstates
    return CellState.Empty;
  }

  serialize(): SerializedCell {
    return {
      coordinate: this._coordinate,
      state: this.state,
      shipId: null
    };
  }
}
