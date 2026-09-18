import type {
  GameConfig,
  AttackResult,
  Coordinate,
  ShipPlacement,
  Game as SerializedGame,
  VisibleBoard,
  GameAction,
  GameEvent,
  GameEventListener,
} from "../types";
import { Player } from "./player";
import { Board } from "./board/board";
import { TurnManager } from "./turn-manager";
import { VictoryManager } from "./victory-manager";
import { AttackResolver } from "./attack-resolver";
import { EventEmitter } from "./event-emitter";
import { ShipPlacer } from "./ship-placer";
import { GameState, WeaponType, GameEventType, BotDifficulty } from "../types/";
import { IdGenerator } from "../utils/id-generator";
import { BotFactory } from "./bots/bot-factory";

export class Game {
  private constructor(
    private readonly _id: string,
    private readonly _config: Required<GameConfig>,
    private _state: GameState,
    private readonly _players: Map<string, Player>,
    private _turnManager: TurnManager | null,
    private _winnerId: string | null,
    private readonly _actionHistory: GameAction[],
    private readonly _eventEmitter: EventEmitter,
    private readonly _createdAt: number,
    private _startedAt: number | null,
    private _finishedAt: number | null,
  ) {}

  /**
   * Create a new game
   */
  static create(config: GameConfig = {}): Game {
    const defaultConfig: Required<GameConfig> = {
      boardSize: config.boardSize ?? 10,
      firstPlayerIndex:
        config.firstPlayerIndex ?? Math.floor(Math.random() * 2),
      allowConsecutiveTurns: config.allowConsecutiveTurns ?? true,
      maxPlayers: config.maxPlayers ?? 2,
    };

    return new Game(
      IdGenerator.gameId(),
      defaultConfig,
      GameState.WaitingForPlayers,
      new Map(),
      null,
      null,
      [],
      new EventEmitter(),
      Date.now(),
      null,
      null,
    );
  }

  // ========== Getters ==========

  get id(): string {
    return this._id;
  }

  get state(): GameState {
    return this._state;
  }

  get config(): Readonly<Required<GameConfig>> {
    return this._config;
  }

  get currentPlayerId(): string | null {
    return this._turnManager?.currentPlayerId ?? null;
  }

  get winnerId(): string | null {
    return this._winnerId;
  }

  get actionHistory(): ReadonlyArray<GameAction> {
    return this._actionHistory;
  }

  get players(): ReadonlyArray<Player> {
    return Array.from(this._players.values());
  }

  // ========== Player Management ==========

  /**
   * Add a human player
   */
  addPlayer(name: string): Game {
    if (this._state !== GameState.WaitingForPlayers) {
      throw new Error("Cannot add players after game has started");
    }

    if (this._players.size >= this._config.maxPlayers) {
      throw new Error(`Maximum ${this._config.maxPlayers} players allowed`);
    }

    const player = Player.createHuman(name, this._config.boardSize);
    this._players.set(player.id, player);

    this.emitEvent(GameEventType.PlayerJoined, { playerId: player.id, name });

    if (this._players.size === this._config.maxPlayers) {
      this.transitionToPlacingShips();
    }

    return this;
  }

  /**
   * Add a bot player
   */
  addBotPlayer(name: string, difficulty: BotDifficulty): Game {
    if (this._state !== GameState.WaitingForPlayers) {
      throw new Error("Cannot add players after game has started");
    }

    if (this._players.size >= this._config.maxPlayers) {
      throw new Error(`Maximum ${this._config.maxPlayers} players allowed`);
    }

    const player = Player.createBot(name, difficulty, this._config.boardSize);
    this._players.set(player.id, player);

    this.emitEvent(GameEventType.PlayerJoined, {
      playerId: player.id,
      name,
      isBot: true,
      difficulty,
    });

    if (this._players.size === this._config.maxPlayers) {
      this.transitionToPlacingShips();
    }

    return this;
  }

  /**
   * Remove a player
   */
  removePlayer(playerId: string): Game {
    if (this._state !== GameState.WaitingForPlayers) {
      throw new Error("Cannot remove players after game has started");
    }

    const player = this._players.get(playerId);
    if (!player) {
      throw new Error("Player not found");
    }

    this._players.delete(playerId);
    this.emitEvent(GameEventType.PlayerRemoved, { playerId });

    return this;
  }

  // ========== Ship Placement ==========

  /**
   * Place a ship for a player
   */
  placeShip(playerId: string, placement: ShipPlacement): Game {
    if (this._state !== GameState.PlacingShips) {
      throw new Error("Not in ship placement phase");
    }

    const player = this._players.get(playerId);
    if (!player) {
      throw new Error("Player not found");
    }

    const updatedPlayer = player.placeShip(placement);
    this._players.set(playerId, updatedPlayer);

    this.emitEvent(GameEventType.ShipPlaced, {
      playerId,
      shipType: placement.type,
    });

    if (updatedPlayer.hasPlacedAllShips) {
      this.emitEvent(GameEventType.AllShipsPlaced, { playerId });
    }

    // Check if all players have placed ships
    if (this.allPlayersReady()) {
      this.transitionToReady();
    }

    return this;
  }

  /**
   * Auto-place all ships for a player
   */
  autoPlaceShips(playerId: string, smart: boolean = false): Game {
    if (this._state !== GameState.PlacingShips) {
      throw new Error("Not in ship placement phase");
    }

    const player = this._players.get(playerId);
    if (!player) {
      throw new Error("Player not found");
    }

    const placer = new ShipPlacer(this._config.boardSize);
    const placements = smart
      ? placer.generateSmartPlacements()
      : placer.generateRandomPlacements();

    let updatedPlayer = player;
    for (const placement of placements) {
      updatedPlayer = updatedPlayer.placeShip(placement);
      this.emitEvent(GameEventType.ShipPlaced, {
        playerId,
        shipType: placement.type,
      });
    }

    this._players.set(playerId, updatedPlayer);
    this.emitEvent(GameEventType.AllShipsPlaced, { playerId });

    // Check if all players have placed ships
    if (this.allPlayersReady()) {
      this.transitionToReady();
    }

    return this;
  }

  // ========== Game Flow ==========

  /**
   * Start the game
   */
  start(): Game {
    if (this._state !== GameState.Ready) {
      throw new Error("Game is not ready to start");
    }

    this._state = GameState.InProgress;
    this._startedAt = Date.now();

    // Initialize turn manager
    const playerIds = Array.from(this._players.keys());
    this._turnManager = TurnManager.create(
      playerIds,
      this._config.firstPlayerIndex,
      this._config.allowConsecutiveTurns,
    );

    this.emitEvent(GameEventType.GameStarted, {
      firstPlayerId: this._turnManager.currentPlayerId,
    });

    this.emitEvent(GameEventType.TurnChanged, {
      playerId: this._turnManager.currentPlayerId,
    });

    return this;
  }

  /**
   * Execute an attack
   */
  attack(
    playerId: string,
    weaponType: WeaponType,
    coordinate: Coordinate,
  ): AttackResult {
    if (this._state !== GameState.InProgress) {
      throw new Error("Game is not in progress");
    }

    if (!this._turnManager) {
      throw new Error("Turn manager not initialized");
    }

    // Validate turn
    const turnValidation = this._turnManager.validateTurn(playerId);
    if (!turnValidation.valid) {
      return {
        success: false,
        coordinates: [],
        hits: [],
        misses: [],
        destroyedShips: [],
        hasExtraTurn: false,
        winnerId: null,
        error: turnValidation.error,
      };
    }

    // Get opponent
    const opponentId = this._turnManager.getOpponentId(playerId);
    const opponent = this._players.get(opponentId);

    if (!opponent) {
      return {
        success: false,
        coordinates: [],
        hits: [],
        misses: [],
        destroyedShips: [],
        hasExtraTurn: false,
        winnerId: null,
        error: "Opponent not found",
      };
    }

    // Validate attack
    const attackValidation = AttackResolver.validateAttack(
      opponent.board,
      weaponType,
      coordinate,
    );

    if (!attackValidation.valid) {
      return {
        success: false,
        coordinates: [],
        hits: [],
        misses: [],
        destroyedShips: [],
        hasExtraTurn: false,
        winnerId: null,
        error: attackValidation.error,
      };
    }

    // Resolve attack
    const { board: updatedBoard, result } = AttackResolver.resolve(
      opponent.board,
      weaponType,
      coordinate,
    );

    // Update opponent's board
    const updatedOpponent = opponent.withBoard(updatedBoard);
    this._players.set(opponentId, updatedOpponent);

    // Record action
    const action: GameAction = {
      timestamp: Date.now(),
      playerId,
      weaponType,
      coordinates: result.coordinates,
      result,
    };
    this._actionHistory.push(action);

    // Emit events
    this.emitEvent(GameEventType.WeaponUsed, {
      playerId,
      weaponType,
      coordinate,
    });

    // Check for victory
    const boards = new Map<string, Board>();
    for (const [pid, p] of this._players) {
      boards.set(pid, p.board);
    }

    const winnerId = VictoryManager.checkVictory(boards);
    if (winnerId) {
      this._winnerId = winnerId;
      this._state = GameState.Finished;
      this._finishedAt = Date.now();

      this.emitEvent(GameEventType.GameFinished, {
        winnerId,
        statistics: VictoryManager.getStatistics(boards),
      });

      return { ...result, winnerId };
    }

    // Handle turn switching

    this._turnManager = this._turnManager.nextTurn();
    this.emitEvent(GameEventType.TurnChanged, {
      playerId: this._turnManager.currentPlayerId,
    });

    return result;
  }

  /**
   * Execute a bot turn
   */
  executeBotTurn(): AttackResult | null {
    if (this._state !== GameState.InProgress) {
      return null;
    }

    if (!this._turnManager) {
      return null;
    }

    const currentPlayer = this._players.get(this._turnManager.currentPlayerId);
    if (
      !currentPlayer ||
      !currentPlayer.isBot ||
      !currentPlayer.botDifficulty
    ) {
      return null;
    }

    // Get visible board for bot
    const opponentId = this._turnManager.getOpponentId(currentPlayer.id);
    const opponent = this._players.get(opponentId);
    if (!opponent) {
      return null;
    }

    const visibleBoard = opponent.board.getVisibleBoard(false);

    // Create bot and get decision
    const bot = BotFactory.create(
      currentPlayer.id,
      currentPlayer.botDifficulty,
    );
    const availableWeapons = Object.values(WeaponType);
    const decision = bot.decideAttack(visibleBoard, availableWeapons);

    // Execute attack
    return this.attack(
      currentPlayer.id,
      decision.weaponType,
      decision.coordinate,
    );
  }

  // ========== Query Methods ==========

  /**
   * Get visible board for a player
   */
  getVisibleBoard(playerId: string, targetPlayerId: string): VisibleBoard {
    const targetPlayer = this._players.get(targetPlayerId);
    if (!targetPlayer) {
      throw new Error("Target player not found");
    }

    const isOwnBoard = playerId === targetPlayerId;
    return targetPlayer.board.getVisibleBoard(isOwnBoard);
  }

  /**
   * Get player's own board
   */
  getPlayerBoard(playerId: string): Board {
    const player = this._players.get(playerId);
    if (!player) {
      throw new Error("Player not found");
    }

    return player.board;
  }

  /**
   * Get player by ID
   */
  getPlayer(playerId: string): Player | undefined {
    return this._players.get(playerId);
  }

  /**
   * Get winner
   */
  getWinner(): Player | null {
    if (!this._winnerId) {
      return null;
    }

    return this._players.get(this._winnerId) ?? null;
  }

  /**
   * Get game statistics
   */
  getStatistics() {
    const boards = new Map<string, Board>();
    for (const [id, player] of this._players) {
      boards.set(id, player.board);
    }

    return VictoryManager.getStatistics(boards);
  }

  // ========== Game Control ==========

  /**
   * Restart the game
   */
  restart(): Game {
    // Reset all players with new boards
    const newPlayers = new Map<string, Player>();
    for (const [id, player] of this._players) {
      const newPlayer = player.isBot
        ? Player.createBot(
            player.name,
            player.botDifficulty!,
            this._config.boardSize,
          )
        : Player.createHuman(player.name, this._config.boardSize);

      // Preserve the same ID
      const preservedPlayer = new (Player as any)(
        id,
        newPlayer.name,
        newPlayer.board,
        newPlayer.isBot,
        newPlayer.botDifficulty,
      );
      newPlayers.set(id, preservedPlayer);
    }

    return new Game(
      IdGenerator.gameId(),
      this._config,
      GameState.PlacingShips,
      newPlayers,
      null,
      null,
      [],
      new EventEmitter(),
      Date.now(),
      null,
      null,
    );
  }

  /**
   * Clone the game
   */
  clone(): Game {
    const clonedPlayers = new Map<string, Player>();
    for (const [id, player] of this._players) {
      clonedPlayers.set(id, player.clone());
    }

    return new Game(
      this._id,
      { ...this._config },
      this._state,
      clonedPlayers,
      this._turnManager?.clone() ?? null,
      this._winnerId,
      [...this._actionHistory],
      this._eventEmitter.clone(),
      this._createdAt,
      this._startedAt,
      this._finishedAt,
    );
  }

  // ========== Serialization ==========

  /**
   * Serialize game to JSON
   */
  serialize(): SerializedGame {
    return {
      id: this._id,
      state: this._state,
      players: Array.from(this._players.values()).map((p) => p.serialize()),
      currentPlayerIndex: this._turnManager?.currentPlayerIndex ?? 0,
      winnerId: this._winnerId,
      actionHistory: this._actionHistory,
      createdAt: this._createdAt,
      startedAt: this._startedAt,
      finishedAt: this._finishedAt,
    };
  }

  /**
   * Deserialize game from JSON
   */
  static deserialize(data: SerializedGame, config: GameConfig = {}): Game {
    const gameConfig: Required<GameConfig> = {
      boardSize: config.boardSize ?? 10,
      firstPlayerIndex: config.firstPlayerIndex ?? 0,
      allowConsecutiveTurns: config.allowConsecutiveTurns ?? true,
      maxPlayers: config.maxPlayers ?? 2,
    };

    const players = new Map<string, Player>();
    for (const playerData of data.players) {
      const player = Player.deserialize(playerData, gameConfig.boardSize);
      players.set(player.id, player);
    }

    const playerIds = Array.from(players.keys());
    const turnManager =
      data.state === GameState.InProgress || data.state === GameState.Finished
        ? TurnManager.create(
            playerIds,
            data.currentPlayerIndex,
            gameConfig.allowConsecutiveTurns,
          )
        : null;

    return new Game(
      data.id,
      gameConfig,
      data.state,
      players,
      turnManager,
      data.winnerId,
      [...data.actionHistory],
      new EventEmitter(),
      data.createdAt,
      data.startedAt,
      data.finishedAt,
    );
  }

  // ========== Event System ==========

  /**
   * Subscribe to an event
   */
  on(eventType: GameEventType, listener: GameEventListener): () => void {
    return this._eventEmitter.on(eventType, listener);
  }

  /**
   * Subscribe to an event once
   */
  once(eventType: GameEventType, listener: GameEventListener): () => void {
    return this._eventEmitter.once(eventType, listener);
  }

  /**
   * Unsubscribe from an event
   */
  off(eventType: GameEventType, listener: GameEventListener): void {
    this._eventEmitter.off(eventType, listener);
  }

  // ========== Private Helpers ==========

  private transitionToPlacingShips(): void {
    this._state = GameState.PlacingShips;
    this.emitEvent(GameEventType.StateChanged, { state: this._state });
  }

  private transitionToReady(): void {
    this._state = GameState.Ready;
    this.emitEvent(GameEventType.StateChanged, { state: this._state });
  }

  private allPlayersReady(): boolean {
    return Array.from(this._players.values()).every((p) => p.hasPlacedAllShips);
  }

  private emitEvent(type: GameEventType, data?: unknown): void {
    const event: GameEvent = {
      type,
      timestamp: Date.now(),
      data,
    };

    this._eventEmitter.emit(event);
  }
}
