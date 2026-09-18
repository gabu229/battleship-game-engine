import { Board } from "./board/board";

/**
 * Manages victory conditions and game end detection
 */
export class VictoryManager {
  /**
   * Check if a player has won
   */
  static checkVictory(boards: Map<string, Board>): string | null {
    for (const [playerId, board] of boards) {
      if (board.areAllShipsDestroyed()) {
        // This player lost, return opponent ID
        return this.getOpponentId(playerId, Array.from(boards.keys()));
      }
    }

    return null;
  }

  /**
   * Check if game is finished
   */
  static isGameFinished(boards: Map<string, Board>): boolean {
    return this.checkVictory(boards) !== null;
  }

  /**
   * Get opponent player ID
   */
  private static getOpponentId(
    playerId: string,
    allPlayerIds: string[],
  ): string {
    return allPlayerIds.find((id) => id !== playerId) ?? "";
  }

  /**
   * Get game statistics
   */
  static getStatistics(
    boards: Map<string, Board>,
  ): Map<string, GameStatistics> {
    const stats = new Map<string, GameStatistics>();

    for (const [playerId, board] of boards) {
      const totalShips = board.getAllShips().length;
      const destroyedShips = board
        .getAllShips()
        .filter((s) => s.isDestroyed).length;
      const totalCells = board.boardSize * board.boardSize;
      const hitCells = board.getAllCells().filter((c) => c.isHit).length;

      stats.set(playerId, {
        totalShips,
        destroyedShips,
        remainingShips: totalShips - destroyedShips,
        totalCells,
        attackedCells: hitCells,
        accuracy:
          hitCells > 0
            ? board.getAllCells().filter((c) => c.isHit && c.hasShip).length /
              hitCells
            : 0,
      });
    }

    return stats;
  }
}

/**
 * Game statistics for a player
 */
export interface GameStatistics {
  totalShips: number;
  destroyedShips: number;
  remainingShips: number;
  totalCells: number;
  attackedCells: number;
  accuracy: number;
}
