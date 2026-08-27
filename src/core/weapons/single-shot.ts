import { WeaponType, type Coordinate } from "../../types";
import { Weapon } from "./weapon-interface";


export class SingleShot extends Weapon {
  constructor() {
    super(WeaponType.SingleShot, 'Normal Shot', false);
  }

  generateTargetCoordinates(origin: Coordinate, boardSize: number): ReadonlyArray<Coordinate> {
    return [origin];
  }
}