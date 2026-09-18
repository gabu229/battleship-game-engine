import { Board } from "./board/board";
import type { SerializedPlayer, ShipPlacement } from "../types";
import { BotDifficulty } from "../types";
import { IdGenerator } from "../utils/id-generator";

/**
 * Represents a player in the game
 */
export class Player {
  private constructor(
    private readonly _id: string,
    private readonly _name: string,
    private readonly _board: Board,
    private readonly _isBot: boolean,
    private readonly _botDifficulty?: BotDifficulty,
  ) {}

  /**
   * Create a human player
   */
  static createHuman(name: string, boardSize: number = 10): Player {
    const id = IdGenerator.playerId();
    const board = Board.create(boardSize);
    return new Player(id, name, board, false);
  }

  /**
   * Create a bot player
   */
  static createBot(
    name: string,
    difficulty: BotDifficulty,
    boardSize: number = 10,
  ): Player {
    const id = IdGenerator.playerId();
    const board = Board.create(boardSize);
    return new Player(id, name, board, true, difficulty);
  }

  /**
   * Get player ID
   */
  get id(): string {
    return this._id;
  }

  /**
   * Get player name
   */
  get name(): string {
    return this._name;
  }

  /**
   * Get player board
   */
  get board(): Board {
    return this._board;
  }

  /**
   * Check if player is a bot
   */
  get isBot(): boolean {
    return this._isBot;
  }

  /**
   * Get bot difficulty (if bot)
   */
  get botDifficulty(): BotDifficulty | undefined {
    return this._botDifficulty;
  }

  /**
   * Check if player has placed all ships
   */
  get hasPlacedAllShips(): boolean {
    return this._board.areAllShipsPlaced();
  }

  /**
   * Place a ship on the player's board
   */
  placeShip(placement: ShipPlacement): Player {
    const newBoard = this._board.placeShip(placement);
    return new Player(
      this._id,
      this._name,
      newBoard,
      this._isBot,
      this._botDifficulty,
    );
  }

  /**
   * Update player's board
   */
  withBoard(board: Board): Player {
    return new Player(
      this._id,
      this._name,
      board,
      this._isBot,
      this._botDifficulty,
    );
  }

  /**
   * Serialize player to JSON
   */
  serialize(): SerializedPlayer {
    return {
      id: this._id,
      name: this._name,
      board: this._board.serialize(),
      isBot: this._isBot,
      botDifficulty: this._botDifficulty,
      hasPlacedAllShips: this.hasPlacedAllShips,
    };
  }

  /**
   * Deserialize player from JSON
   */
  static deserialize(data: SerializedPlayer, boardSize: number): Player {
    const board = Board.deserialize(data.board, boardSize);
    return new Player(
      data.id,
      data.name,
      board,
      data.isBot,
      data.botDifficulty,
    );
  }

  /**
   * Clone the player
   */
  clone(): Player {
    return new Player(
      this._id,
      this._name,
      this._board.clone(),
      this._isBot,
      this._botDifficulty,
    );
  }
}
