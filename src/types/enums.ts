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
