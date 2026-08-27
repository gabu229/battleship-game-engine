import {
  Direction,
  SHIP_LENGTHS,
  ShipType,
  type Coordinate,
  type ShipPlacement,
} from "../types";
import { CoordinateUtils } from "../utils/coordinate";
import { PlacementValidator } from "./board/placement-validator";

/**
 * Handles automatic ship placement
 */
export class ShipPlacer {
  constructor(private readonly boardSize: number) {}

  /**
   * Generate random placements for all ships
   */
  generateRandomPlacements(
    maxAttempts: number = 1000,
  ): ReadonlyArray<ShipPlacement> {
    const placements: ShipPlacement[] = [];
    const occupiedCoordinates: Coordinate[] = [];
    const validator = new PlacementValidator(this.boardSize);

    const shipTypes = Object.values(ShipType);

    for (const type of shipTypes) {
      let placed = false;
      let attempts = 0;

      while (!placed && attempts < maxAttempts) {
        const placement = this.generateRandomPlacement(type);
        const validation = validator.validate(placement, occupiedCoordinates);

        if (validation.valid) {
          placements.push(placement);
          const coords = validator.generateCoordinates(placement);
          occupiedCoordinates.push(...coords);
          placed = true;
        }

        attempts++;
      }

      if (!placed) {
        throw new Error(
          `Failed to place ${type} after ${maxAttempts} attempts`,
        );
      }
    }

    return placements;
  }

  /**
   * Generate a random placement for a single ship
   */
  private generateRandomPlacement(type: ShipType): ShipPlacement {
    const length = SHIP_LENGTHS[type];
    const direction =
      Math.random() < 0.5 ? Direction.Horizontal : Direction.Vertical;

    let maxX = this.boardSize;
    let maxY = this.boardSize;

    if (direction === Direction.Horizontal) {
      maxX = this.boardSize - length + 1;
    } else {
      maxY = this.boardSize - length + 1;
    }

    const x = Math.floor(Math.random() * maxX);
    const y = Math.floor(Math.random() * maxY);

    return {
      type,
      start: CoordinateUtils.create(x, y),
      direction,
    };
  }

  /**
   * Generate smart placements (tries to spread ships out)
   */
  generateSmartPlacements(
    maxAttempts: number = 1000,
  ): ReadonlyArray<ShipPlacement> {
    const placements: ShipPlacement[] = [];
    const occupiedCoordinates: Coordinate[] = [];
    const validator = new PlacementValidator(this.boardSize);

    // Sort ships by size (largest first) for better placement success
    const shipTypes = Object.values(ShipType).sort(
      (a, b) => SHIP_LENGTHS[b] - SHIP_LENGTHS[a],
    );

    for (const type of shipTypes) {
      let placed = false;
      let attempts = 0;
      let bestPlacement: ShipPlacement | null = null;
      let bestScore = -1;

      while (attempts < maxAttempts) {
        const placement = this.generateRandomPlacement(type);
        const validation = validator.validate(placement, occupiedCoordinates);

        if (validation.valid) {
          // Score based on distance from other ships
          const score = this.scorePlacement(
            placement,
            occupiedCoordinates,
            validator,
          );

          if (score > bestScore) {
            bestScore = score;
            bestPlacement = placement;
          }

          // If we found a good placement, use it
          if (bestScore > 5 || attempts > maxAttempts / 2) {
            placed = true;
            break;
          }
        }

        attempts++;
      }

      if (bestPlacement) {
        placements.push(bestPlacement);
        const coords = validator.generateCoordinates(bestPlacement);
        occupiedCoordinates.push(...coords);
      } else {
        throw new Error(
          `Failed to place ${type} after ${maxAttempts} attempts`,
        );
      }
    }

    return placements;
  }

  /**
   * Score a placement based on spacing from other ships
   */
  private scorePlacement(
    placement: ShipPlacement,
    occupiedCoordinates: ReadonlyArray<Coordinate>,
    validator: PlacementValidator,
  ): number {
    const coords = validator.generateCoordinates(placement);
    let totalDistance = 0;

    for (const coord of coords) {
      let minDistance = this.boardSize * 2;

      for (const occupied of occupiedCoordinates) {
        const distance = CoordinateUtils.manhattanDistance(coord, occupied);
        minDistance = Math.min(minDistance, distance);
      }

      totalDistance += minDistance;
    }

    return totalDistance;
  }
}
