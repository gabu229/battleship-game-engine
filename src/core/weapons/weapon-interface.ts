import type { Coordinate, IWeapon, WeaponType } from "../../types";

export abstract class Weapon implements IWeapon {
  constructor(
    public readonly type: WeaponType,
    public readonly name: string,
    public readonly isSonar: boolean = false,
  ) {}

  /**
   * Generate target coordinates for this weapon
   */
  abstract generateTargetCoordinates(
    origin: Coordinate,
    boardSize: number,
  ): ReadonlyArray<Coordinate>;
}
