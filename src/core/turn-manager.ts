/**
 * Manages player turns and turn switching
 */
export class TurnManager {
  private constructor(
    private readonly playerIds: ReadonlyArray<string>,
    private readonly currentIndex: number,
    private readonly allowConsecutiveTurns: boolean,
  ) {}

  /**
   * Create a new turn manager
   */
  static create(
    playerIds: ReadonlyArray<string>,
    firstPlayerIndex: number = 0,
    allowConsecutiveTurns: boolean = true,
  ): TurnManager {
    if (playerIds.length < 2) {
      throw new Error("At least 2 players required");
    }

    if (firstPlayerIndex < 0 || firstPlayerIndex >= playerIds.length) {
      throw new Error("Invalid first player index");
    }

    return new TurnManager(playerIds, firstPlayerIndex, allowConsecutiveTurns);
  }

  /**
   * Get current player ID
   */
  get currentPlayerId(): string {
    return this.playerIds[this.currentIndex]!;
  }

  /**
   * Get current player index
   */
  get currentPlayerIndex(): number {
    return this.currentIndex;
  }

  /**
   * Get all player IDs
   */
  get allPlayerIds(): ReadonlyArray<string> {
    return this.playerIds;
  }

  /**
   * Check if it's a player's turn
   */
  isPlayerTurn(playerId: string): boolean {
    return this.currentPlayerId === playerId;
  }

  /**
   * Switch to next player
   */
  nextTurn(): TurnManager {
    const nextIndex = (this.currentIndex + 1) % this.playerIds.length;
    return new TurnManager(
      this.playerIds,
      nextIndex,
      this.allowConsecutiveTurns,
    );
  }

  /**
   * Keep current turn (for extra turn after hit)
   */
  continueTurn(): TurnManager {
    if (!this.allowConsecutiveTurns) {
      return this.nextTurn();
    }
    return this;
  }

  /**
   * Get opponent player ID (for 2-player game)
   */
  getOpponentId(playerId: string): string {
    if (this.playerIds.length !== 2) {
      throw new Error("getOpponentId only works for 2-player games");
    }

    return this.playerIds.find((id) => id !== playerId)!;
  }

  /**
   * Validate turn action
   */
  validateTurn(playerId: string): { valid: boolean; error?: string } {
    if (!this.isPlayerTurn(playerId)) {
      return {
        valid: false,
        error: `Not player ${playerId}'s turn`,
      };
    }

    return { valid: true };
  }

  /**
   * Clone the turn manager
   */
  clone(): TurnManager {
    return new TurnManager(
      [...this.playerIds],
      this.currentIndex,
      this.allowConsecutiveTurns,
    );
  }
}
