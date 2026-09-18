import type {
  BotDecision,
  BotDifficulty,
  Bot as IBot,
  VisibleBoard,
  WeaponType,
} from "../../types";

/**
 * Abstract base class for bots
 */
export abstract class Bot implements IBot {
  constructor(
    public readonly playerId: string,
    public readonly difficulty: BotDifficulty,
  ) {}

  /**
   * Decide next attack
   */
  abstract decideAttack(
    visibleBoard: VisibleBoard,
    availableWeapons: ReadonlyArray<WeaponType>,
  ): BotDecision;
}
