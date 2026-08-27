import { WeaponType, type IWeapon } from "../../types";
import { Bomb } from "./bomb";
import { CrossBomb } from "./cross-bomb";
import { HorizontalStrike } from "./horizontal-strike";
import { SingleShot } from "./single-shot";
import { VerticalStrike } from "./vertical-strike";

export class WeaponFactory {
  static create(type: WeaponType): IWeapon {
    switch (type) {
      case WeaponType.SingleShot:
        return new SingleShot();
      case WeaponType.Bomb2x2:
        return new Bomb();
      case WeaponType.CrossBomb:
        return new CrossBomb();
      case WeaponType.HorizontalStrike:
        return new HorizontalStrike();
      case WeaponType.VerticalStrike:
        return new VerticalStrike();
      default:
        throw new Error(`Unknown weapon type: ${type}`);
    }
  }
}
