import { WeaponType, type Coordinate } from "../../types";
import { CoordinateUtils } from "../../utils/coordinate";
import { Weapon } from "./weapon-interface";

export class CrossBomb extends Weapon {
  constructor() {
    super(WeaponType.CrossBomb, "Cross Bomb", false);
  }

  generateTargetCoordinates(
    origin: Coordinate,
    boardSize: number,
  ): ReadonlyArray<Coordinate> {
    const coordinates: Coordinate[] = [
      origin,
      // Up
      CoordinateUtils.create(origin.x, origin.y - 1),
      // Down
      CoordinateUtils.create(origin.x, origin.y + 1),
      // Left
      CoordinateUtils.create(origin.x - 1, origin.y),
      // Right
      CoordinateUtils.create(origin.x + 1, origin.y),
    ];

    return CoordinateUtils.filterValid(coordinates, boardSize);
  }
}
