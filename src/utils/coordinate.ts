import type { Coordinate } from "../types/interfaces";

export class CoordinateUtils {
  static create(x: number, y: number): Coordinate {
    return Object.freeze({ x, y });
  }

  static isValid(coord: Coordinate, boardSize: number): boolean {
    return (
      coord.x >= 0 && coord.x < boardSize && coord.y >= 0 && coord.y < boardSize
    );
  }

  static equals(a: Coordinate, b: Coordinate): boolean {
    return a.x === b.x && a.y === b.y;
  }

  static toKey(coord: Coordinate): string {
    return `${coord.x},${coord.y}`;
  }

  static fromKey(key: string): Coordinate {
    const [x, y] = key.split(",").map(Number);
    return CoordinateUtils.create(x!, y!);
  }

  static deduplicate(
    coordinates: ReadonlyArray<Coordinate>,
  ): ReadonlyArray<Coordinate> {
    const seen = new Set<string>();
    const result: Coordinate[] = [];

    for (const coord of coordinates) {
      const key = CoordinateUtils.toKey(coord);
      if (!seen.has(key)) {
        seen.add(key);
        result.push(coord);
      }
    }

    return result;
  }

  static filterValid(
    coordinates: ReadonlyArray<Coordinate>,
    boardSize: number,
  ): ReadonlyArray<Coordinate> {
    return coordinates.filter((coord) =>
      CoordinateUtils.isValid(coord, boardSize),
    );
  }

  static getArea(
    topLeft: Coordinate,
    bottomRight: Coordinate,
    boardSize: number,
  ): ReadonlyArray<Coordinate> {
    const coords: Coordinate[] = [];

    for (let y = topLeft.y; y <= bottomRight.y; y++) {
      for (let x = topLeft.x; x <= bottomRight.x; x++) {
        const coord = CoordinateUtils.create(x, y);
        if (CoordinateUtils.isValid(coord, boardSize)) {
          coords.push(coord);
        }
      }
    }

    return coords;
  }

  static getNeighbors(
    coord: Coordinate,
    boardSize: number,
  ): ReadonlyArray<Coordinate> {
    const neighbors: Coordinate[] = [
      // Up
      CoordinateUtils.create(coord.x, coord.y - 1),
      // Down
      CoordinateUtils.create(coord.x, coord.y + 1),
      // Left
      CoordinateUtils.create(coord.x - 1, coord.y),
      // Right
      CoordinateUtils.create(coord.x + 1, coord.y),
    ];

    return CoordinateUtils.filterValid(neighbors, boardSize);
  }

  static getAllNeighbors(
    coord: Coordinate,
    boardSize: number,
  ): ReadonlyArray<Coordinate> {
    const neighbors: Coordinate[] = [];

    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        neighbors.push(CoordinateUtils.create(coord.x + dx, coord.y + dy));
      }
    }

    return CoordinateUtils.filterValid(neighbors, boardSize);
  }

  static contains(
    coordinates: ReadonlyArray<Coordinate>,
    target: Coordinate,
  ): boolean {
    return coordinates.some((coord) => CoordinateUtils.equals(coord, target));
  }

  static random(boardSize: number): Coordinate {
    return CoordinateUtils.create(
      Math.floor(Math.random() * boardSize),
      Math.floor(Math.random() * boardSize),
    );
  }

  static getAllCoordinates(boardSize: number): ReadonlyArray<Coordinate> {
    const coords: Coordinate[] = [];
    for (let y = 0; y < boardSize; y++) {
      for (let x = 0; x < boardSize; x++) {
        coords.push(CoordinateUtils.create(x, y));
      }
    }
    return coords;
  }

  static manhattanDistance(a: Coordinate, b: Coordinate): number {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  }
}
