import { Cell } from "../cell";
import { CoordinateUtils } from "../../utils/coordinate";
import type {
  Coordinate,
  Board as SerializedBoard,
  ShipPlacement,
  ShipType,
  VisibleBoard,
  VisibleCell,
} from "../../types";
import { Ship } from "../ship";
import { PlacementValidator } from "./placement-validator";

export class Board {
  private readonly cells: Map<string, Cell>;
  private readonly ships: Map<string, Ship>;
  private readonly validator: PlacementValidator;

  private constructor(
    private readonly size: number,
    cells?: Map<string, Cell>,
    ships?: Map<string, Ship>,
  ) {
    this.validator = new PlacementValidator(size);

    if (cells && ships) {
      this.cells = cells;
      this.ships = ships;
    } else {
      this.cells = new Map();
      this.ships = new Map();
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

  // --SHIPS--
  getAllShips(): ReadonlyArray<Ship> {
    return Array.from(this.ships.values());
  }

  getShip(shipId: string): Ship | undefined {
    return this.ships.get(shipId);
  }

  private getAllOccupiedCoordinates(): ReadonlyArray<Coordinate> {
    const coordinates: Coordinate[] = [];
    for (const ship of this.ships.values()) {
      coordinates.push(...ship.coordinates);
    }
    return coordinates;
  }

  placeShip(placement: ShipPlacement): Board {
    // Validate placement
    const existingCoordinates = this.getAllOccupiedCoordinates();
    const validation = this.validator.validate(placement, existingCoordinates);

    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Check if ship type already placed
    const placedTypes = this.getPlacedShipTypes();
    if (this.validator.isShipTypePlaced(placement.type, placedTypes)) {
      throw new Error(`Ship type ${placement.type} has already been placed`);
    }

    // Generate coordinates and create ship
    const coordinates = this.validator.generateCoordinates(placement);
    const ship = Ship.create(placement.type, coordinates);

    // Create new cells with ship
    const newCells = new Map(this.cells);
    for (const coord of coordinates) {
      const key = CoordinateUtils.toKey(coord);
      const cell = newCells.get(key);
      if (cell) {
        newCells.set(key, cell.withShip(ship));
      }
    }

    // Add ship
    const newShips = new Map(this.ships);
    newShips.set(ship.id, ship);

    return new Board(this.size, newCells, newShips);
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

  attack(coordinate: Coordinate): Board {
    const key = CoordinateUtils.toKey(coordinate);
    const cell = this.cells.get(key);

    if (!cell) {
      throw new Error("Invalid coordinate");
    }

    if (cell.isHit) {
      throw new Error("Coordinate already attacked");
    }

    const newCells = new Map(this.cells);
    newCells.set(key, cell.withHit());

    // Update ship if hit
    let newShips = new Map(this.ships);
    if (cell.ship) {
      const updatedShip = cell.ship.registerHit(coordinate);
      newShips.set(updatedShip.id, updatedShip);
    }

    return new Board(this.size, newCells, newShips);
  }

  isAttacked(coordinate: Coordinate): boolean {
    const cell = this.getCell(coordinate);
    return cell?.isHit ?? false;
  }

  private getPlacedShipTypes(): ReadonlyArray<ShipType> {
    return Array.from(this.ships.values()).map((ship) => ship.type);
  }

  areAllShipsPlaced(): boolean {
    const placedTypes = this.getPlacedShipTypes();
    const validation = this.validator.validateAllShipsPlaced(placedTypes);
    return validation.valid;
  }

  areAllShipsDestroyed(): boolean {
    if (this.ships.size === 0) return false;
    return Array.from(this.ships.values()).every((ship) => ship.isDestroyed);
  }

  getRemainingShipsCount(): number {
    return Array.from(this.ships.values()).filter((ship) => !ship.isDestroyed)
      .length;
  }

  getVisibleBoard(isOwnBoard: boolean): VisibleBoard {
    const visibleCells: VisibleCell[] = [];

    for (const cell of this.cells.values()) {
      visibleCells.push({
        coordinate: cell.coordinate,
        state: cell.getVisibleState(isOwnBoard),
        isOwnBoard,
      });
    }

    return {
      cells: visibleCells,
      remainingShips: this.getRemainingShipsCount(),
    };
  }

  clone(): Board {
    const newCells = new Map<string, Cell>();
    const newShips = new Map<string, Ship>();

    // Clone ships first
    for (const [id, ship] of this.ships) {
      newShips.set(id, ship.clone());
    }

    // Clone cells with references to cloned ships
    for (const [key, cell] of this.cells) {
      const clonedShip = cell.ship
        ? (newShips.get(cell.ship.id) ?? null)
        : null;
      const clonedCell = new (Cell as any)(
        { ...cell.coordinate },
        clonedShip,
        cell.isHit,
      );
      newCells.set(key, clonedCell);
    }

    return new Board(this.size, newCells, newShips);
  }
}
