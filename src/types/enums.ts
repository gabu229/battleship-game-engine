export enum GameState {
  Ready = "READY",
  InProgress = "IN_PROGRESS",
  Finished = "FINISHED",
}

export enum CellState {
  Unknown = "UNKNOWN",
  Empty = "EMPTY",
  Ship = "SHIP",
  Miss = "MISS",
  Hit = "HIT",
}

export enum Direction {
  Horizontal = "HORIZONTAL",
  Vertical = "VERTICAL",
}

export enum ShipType {
  X6 = "6X",
  X5 = "5X",
  X4 = "4X",
  X3 = "3X",
  X2 = "2X",
}

export const SHIP_LENGTHS: Record<ShipType, number> = {
  [ShipType.X6]: 6,
  [ShipType.X5]: 5,
  [ShipType.X4]: 4,
  [ShipType.X3]: 3,
  [ShipType.X2]: 2,
};

export enum WeaponType {
  SingleShot = "SINGLE_SHOT",
  Bomb2x2 = "BOMB_2X2",
  CrossBomb = "CROSS_BOMB",
  HorizontalStrike = "HORIZONTAL_STRIKE",
  VerticalStrike = "VERTICAL_STRIKE",
  SonarScan = "SONAR_SCAN",
}