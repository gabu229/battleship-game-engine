import { WeaponType, type Coordinate } from "../../types";
import { CoordinateUtils } from "../../utils/coordinate";
import { Weapon } from "./weapon-interface";

export class HorizontalStrike extends Weapon {
  constructor() {
    super(WeaponType.HorizontalStrike, "Horizontal Strike", false);
  }

  generateTargetCoordinates(
    origin: Coordinate,
    boardSize: number,
  ): ReadonlyArray<Coordinate> {
    const coordinates: Coordinate[] = [];

    for (let x = 0; x < boardSize; x++) {
      coordinates.push(CoordinateUtils.create(x, origin.y));
    }

    return coordinates;
  }
}
