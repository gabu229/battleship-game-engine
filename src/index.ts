// Core
export { Game } from "./core/game";
export { Player } from "./core/player";
export { Board } from "./core/board/board";
export { Cell } from "./core/cell";
export { Ship } from "./core/ship";

// Managers
export { AttackResolver } from "./core/attack-resolver";
export { TurnManager } from "./core/turn-manager";
export { VictoryManager } from "./core/victory-manager";

// Weapons
export { WeaponFactory } from "./core/weapons/weapon-factory";
export { Weapon } from "./core/weapons/weapon-interface";
export { SingleShot } from "./core/weapons/single-shot";
export { Bomb } from "./core/weapons/bomb";
export { CrossBomb } from "./core/weapons/cross-bomb";
export { HorizontalStrike } from "./core/weapons/horizontal-strike";
export { VerticalStrike } from "./core/weapons/vertical-strike";

// Bots
export { BotFactory } from "./core/bots/bot-factory";
export { Bot } from "./core/bots/bot-interface";
export { EasyBot } from "./core/bots/easy-bot";

// Events
export { EventEmitter } from "./core/event-emitter";

// Utilities
export { CoordinateUtils } from "./utils/coordinate";
export { IdGenerator } from "./utils/id-generator";
export { ShipPlacer } from "./core/ship-placer";
export { PlacementValidator } from "./core/board/placement-validator";

// Types and Interfaces
export * from "./types";
