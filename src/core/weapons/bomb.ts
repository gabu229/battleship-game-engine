import { WeaponType, type Coordinate } from '../../types';
import { CoordinateUtils } from '../../utils/coordinate';
import { Weapon } from './weapon-interface';

export class Bomb extends Weapon {
  constructor() {
    super(WeaponType.Bomb2x2, '2x2 Bomb', false);
  }

  generateTargetCoordinates(origin: Coordinate, boardSize: number): ReadonlyArray<Coordinate> {
    const coordinates: Coordinate[] = [
      origin,
      CoordinateUtils.create(origin.x + 1, origin.y),
      CoordinateUtils.create(origin.x, origin.y + 1),
      CoordinateUtils.create(origin.x + 1, origin.y + 1),
    ];

    return CoordinateUtils.filterValid(coordinates, boardSize);
  }
}