import { BotDifficulty, type Bot as IBot } from "../../types";
import { EasyBot } from "./easy-bot";

export class BotFactory {
  /**
   * Create a bot based on difficulty
   */
  static create(playerId: string, difficulty: BotDifficulty): IBot {
    switch (difficulty) {
      case BotDifficulty.Easy:
        return new EasyBot(playerId);

      default:
        throw new Error(`Unknown bot difficulty: ${difficulty}`);
    }
  }
}
