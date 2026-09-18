import {
  BotDifficulty,
  CellState,
  WeaponType,
  type BotDecision,
  type VisibleBoard,
} from "../../types";
import { Bot } from "./bot-interface";

export class EasyBot extends Bot {
  constructor(playerId: string) {
    super(playerId, BotDifficulty.Easy);
  }

  decideAttack(
    visibleBoard: VisibleBoard,
    availableWeapons: ReadonlyArray<WeaponType>,
  ): BotDecision {
    console.info({ availableWeapons });

    // Get untargeted cells
    const untargetedCells = visibleBoard.cells.filter(
      (cell) => !cell.isOwnBoard && cell.state === CellState.Unknown,
    );

    if (untargetedCells.length === 0) {
      throw new Error("No available targets");
    }

    // Pick random cell
    const randomCell =
      untargetedCells[Math.floor(Math.random() * untargetedCells.length)];

    // Use single shot
    const weaponType = WeaponType.SingleShot;

    return {
      weaponType,
      coordinate: randomCell!.coordinate,
    };
  }
}
