import { Cell } from "../cell";
import { CoordinateUtils } from "../../utils/coordinate";
import type { Coordinate, Board as SerializedBoard } from "../../types";

export class Board {
  private readonly cells: Map<string, Cell>;

  private constructor(
    private readonly size: number,
    cells?: Map<string, Cell>,
  ) {
    if (cells) {
      this.cells = cells;
    } else {
      this.cells = new Map();
      this.initializeCells();
    }
  }

  static create(size: number = 10): Board {
    return new Board(size);
  }

  get boardSize(): number {
    return this.size;
  }

  private initializeCells(): void {
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        const coord = CoordinateUtils.create(x, y);
        const cell = Cell.create(coord);
        this.cells.set(CoordinateUtils.toKey(coord), cell);
      }
    }
  }

  getCell(coordinate: Coordinate): Cell | undefined {
    return this.cells.get(CoordinateUtils.toKey(coordinate));
  }

  getAllCells(): ReadonlyArray<Cell> {
    return Array.from(this.cells.values());
  }

  reset(): Board {
    return Board.create(this.size);
  }

  serialize(): SerializedBoard {
    return {
      cells: Array.from(this.cells.values()).map((cell) => cell.serialize()),
      ships: [],
    };
  }

  static deserialize(data: SerializedBoard, size: number): Board {
    // Recreate cells
    const cells = new Map<string, Cell>();
    for (const cellData of data.cells) {
      const ship = null;
      const cell = new (Cell as any)(cellData.coordinate, ship);
      cells.set(CoordinateUtils.toKey(cellData.coordinate), cell);
    }

    // TODO: Recreate other elements from json data

    return new Board(size, cells);
  }

}
