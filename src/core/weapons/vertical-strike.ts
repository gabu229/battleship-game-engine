import { WeaponType, type Coordinate } from "../../types";
import { CoordinateUtils } from "../../utils/coordinate";
import { Weapon } from "./weapon-interface";

export class VerticalStrike extends Weapon {
  constructor() {
    super(WeaponType.VerticalStrike, "Vertical Strike", false);
  }

  generateTargetCoordinates(
    origin: Coordinate,
    boardSize: number,
  ): ReadonlyArray<Coordinate> {
    const coordinates: Coordinate[] = [];

    for (let y = 0; y < boardSize; y++) {
      coordinates.push(CoordinateUtils.create(origin.x, y));
    }

    return coordinates;
  }
}
