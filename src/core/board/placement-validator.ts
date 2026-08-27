import type {
  Coordinate,
  ShipPlacement,
  PlacementValidationResult,
} from "../../types";
import { ShipType, SHIP_LENGTHS, Direction } from "../../types";
import { CoordinateUtils } from "../../utils/coordinate";

export class PlacementValidator {
  constructor(private readonly boardSize: number) {}

  validate(
    placement: ShipPlacement,
    existingShipCoordinates: ReadonlyArray<Coordinate>,
  ): PlacementValidationResult {
    const coordinates = this.generateCoordinates(placement);

    // Check if ship extends outside board
    if (!this.allCoordinatesValid(coordinates)) {
      return {
        valid: false,
        error: `Ship extends outside the board boundaries`,
      };
    }

    // Check for overlaps with existing ships
    if (this.hasOverlap(coordinates, existingShipCoordinates)) {
      return {
        valid: false,
        error: `Ship overlaps with an existing ship`,
      };
    }

    return { valid: true };
  }

  generateCoordinates(placement: ShipPlacement): ReadonlyArray<Coordinate> {
    const { type, start, direction } = placement;
    const length = SHIP_LENGTHS[type];
    const coordinates: Coordinate[] = [];

    for (let i = 0; i < length; i++) {
      if (direction === Direction.Horizontal) {
        coordinates.push(CoordinateUtils.create(start.x + i, start.y));
      } else {
        coordinates.push(CoordinateUtils.create(start.x, start.y + i));
      }
    }

    return coordinates;
  }

  private allCoordinatesValid(coordinates: ReadonlyArray<Coordinate>): boolean {
    return coordinates.every((coord) =>
      CoordinateUtils.isValid(coord, this.boardSize),
    );
  }

  private hasOverlap(
    coordinates: ReadonlyArray<Coordinate>,
    existingCoordinates: ReadonlyArray<Coordinate>,
  ): boolean {
    return coordinates.some((coord) =>
      CoordinateUtils.contains(existingCoordinates, coord),
    );
  }

  validateAllShipsPlaced(
    placedShipTypes: ReadonlyArray<ShipType>,
  ): PlacementValidationResult {
    const requiredShips = Object.values(ShipType);
    const missing = requiredShips.filter(
      (type) => !placedShipTypes.includes(type),
    );

    if (missing.length > 0) {
      return {
        valid: false,
        error: `Missing ships: ${missing.join(", ")}`,
      };
    }

    return { valid: true };
  }

  isShipTypePlaced(
    type: ShipType,
    placedShips: ReadonlyArray<ShipType>,
  ): boolean {
    return placedShips.includes(type);
  }
}
