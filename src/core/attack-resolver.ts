import { Board } from "./board/board";

import { CoordinateUtils } from "../utils/coordinate";
import { WeaponFactory } from "./weapons/weapon-factory";
import type { AttackResult, Coordinate, Ship, WeaponType } from "../types";

export class AttackResolver {
  static resolve(
    board: Board,
    weaponType: WeaponType,
    origin: Coordinate,
  ): { board: Board; result: AttackResult } {
    // Create weapon and generate coordinates
    const weapon = WeaponFactory.create(weaponType);
    const targetCoordinates = weapon.generateTargetCoordinates(
      origin,
      board.boardSize,
    );

    // Remove duplicates and filter already attacked
    const uniqueCoords = CoordinateUtils.deduplicate(targetCoordinates);
    const validCoords = uniqueCoords.filter(
      (coord) => !board.isAttacked(coord),
    );

    // Apply attacks
    let updatedBoard = board;
    const hits: Coordinate[] = [];
    const misses: Coordinate[] = [];
    const destroyedShipIds = new Set<string>();

    for (const coord of validCoords) {
      const cell = updatedBoard.getCell(coord);
      if (!cell) continue;

      updatedBoard = updatedBoard.attack(coord);

      if (cell.hasShip) {
        hits.push(coord);

        // Check if ship was destroyed
        const ship = updatedBoard.getShip(cell.ship!.id);
        if (ship && ship.isDestroyed) {
          destroyedShipIds.add(ship.id);
        }
      } else {
        misses.push(coord);
      }
    }

    // Get destroyed ships
    const destroyedShips: Ship[] = [];
    for (const shipId of destroyedShipIds) {
      const ship = updatedBoard.getShip(shipId);
      if (ship) {
        destroyedShips.push(ship.serialize());
      }
    }

    // Determine if player gets extra turn (hit = continue)
    const hasExtraTurn = hits.length > 0;

    // Check for victory
    const winnerId = updatedBoard.areAllShipsDestroyed() ? "attacker" : null;

    const result: AttackResult = {
      success: true,
      coordinates: validCoords,
      hits,
      misses,
      destroyedShips,
      hasExtraTurn,
      winnerId,
    };

    return { board: updatedBoard, result };
  }

  static validateAttack(
    board: Board,
    weaponType: WeaponType,
    origin: Coordinate,
  ): { valid: boolean; error?: string } {
    // Check if origin is valid
    if (!CoordinateUtils.isValid(origin, board.boardSize)) {
      return { valid: false, error: "Invalid coordinate" };
    }

    // Generate target coordinates
    const weapon = WeaponFactory.create(weaponType);
    const targetCoordinates = weapon.generateTargetCoordinates(
      origin,
      board.boardSize,
    );
    const uniqueCoords = CoordinateUtils.deduplicate(targetCoordinates);

    // Check if all coordinates have already been attacked
    const allAttacked = uniqueCoords.every((coord) => board.isAttacked(coord));
    if (allAttacked && uniqueCoords.length > 0) {
      return { valid: false, error: "All target coordinates already attacked" };
    }

    return { valid: true };
  }
}
