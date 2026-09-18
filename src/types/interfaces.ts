import type {
  BotDifficulty,
  CellState,
  Direction,
  GameEventType,
  GameState,
  ShipType,
  WeaponType,
} from "./enums";

/**
 * Coordinate on the game board
 */
export interface Coordinate {
  readonly x: number;
  readonly y: number;
}

export interface Board {
  readonly cells: ReadonlyArray<Cell>;
  readonly ships: ReadonlyArray<Ship>;
}

export interface VisibleBoard {
  readonly cells: ReadonlyArray<VisibleCell>;
  readonly remainingShips: number;
}

export interface Cell {
  readonly coordinate: Coordinate;
  readonly state: CellState;
  readonly shipId: string | null;
  readonly isHit: boolean;
  //   TODO: Store value of other states
}

export interface VisibleCell {
  readonly coordinate: Coordinate;
  readonly state: CellState;
  readonly isOwnBoard: boolean;
}

export interface Ship {
  readonly id: string;
  readonly type: ShipType;
  readonly length: number;
  readonly coordinates: ReadonlyArray<Coordinate>;
  readonly hits: ReadonlyArray<Coordinate>;
  readonly isDestroyed: boolean;
  //   TODO: Store value of other states
}

export interface ShipPlacement {
  readonly type: ShipType;
  readonly start: Coordinate;
  readonly direction: Direction;
}

export interface PlacementValidationResult {
  readonly valid: boolean;
  readonly error?: string;
}

export interface IWeapon {
  readonly type: WeaponType;
  readonly name: string;
  readonly isSonar: boolean;
  generateTargetCoordinates(
    origin: Coordinate,
    boardSize: number,
  ): ReadonlyArray<Coordinate>;
}

export interface AttackResult {
  readonly success: boolean;
  readonly coordinates: ReadonlyArray<Coordinate>;
  readonly hits: ReadonlyArray<Coordinate>;
  readonly misses: ReadonlyArray<Coordinate>;
  readonly destroyedShips: ReadonlyArray<Ship>;
  readonly hasExtraTurn: boolean;
  readonly winnerId: string | null;
  readonly error?: string | undefined;
}

export interface Bot {
  readonly playerId: string;
  readonly difficulty: BotDifficulty;
  decideAttack(
    visibleBoard: VisibleBoard,
    availableWeapons: ReadonlyArray<WeaponType>,
  ): BotDecision;
}

export interface BotDecision {
  readonly weaponType: WeaponType;
  readonly coordinate: Coordinate;
}

export interface SerializedPlayer {
  readonly id: string;
  readonly name: string;
  readonly board: Board;
  readonly isBot: boolean;
  readonly botDifficulty?: BotDifficulty | undefined;
  readonly hasPlacedAllShips: boolean;
}

export interface GameEvent {
  readonly type: GameEventType;
  readonly timestamp: number;
  readonly data?: unknown;
}

export type GameEventListener = (event: GameEvent) => void;

export interface GameConfig {
  readonly boardSize?: number;
  readonly firstPlayerIndex?: number;
  readonly allowConsecutiveTurns?: boolean;
  readonly maxPlayers?: number;
}

export interface GameAction {
  readonly timestamp: number;
  readonly playerId: string;
  readonly weaponType: WeaponType;
  readonly coordinates: ReadonlyArray<Coordinate>;
  readonly result: AttackResult;
}

export interface Game {
  readonly id: string;
  readonly state: GameState;
  readonly players: ReadonlyArray<SerializedPlayer>;
  readonly currentPlayerIndex: number;
  readonly winnerId: string | null;
  readonly actionHistory: ReadonlyArray<GameAction>;
  readonly createdAt: number;
  readonly startedAt: number | null;
  readonly finishedAt: number | null;
}
