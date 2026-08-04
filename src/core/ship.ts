import type { Coordinate, Ship as SerializedShip } from "../types";
import { ShipType, SHIP_LENGTHS } from "../types";
import { CoordinateUtils } from "../utils/coordinate";
import { IdGenerator } from "../utils/id-generator";

export class Ship {
  private constructor(
    private readonly _id: string,
    private readonly _type: ShipType,
    private readonly _coordinates: ReadonlyArray<Coordinate>,
    private readonly _hits: ReadonlyArray<Coordinate>,
  ) {}

  static create(type: ShipType, coordinates: ReadonlyArray<Coordinate>): Ship {
    const id = IdGenerator.shipId();
    return new Ship(id, type, coordinates, []);
  }

  get id(): string {
    return this._id;
  }

  get type(): ShipType {
    return this._type;
  }

  get length(): number {
    return SHIP_LENGTHS[this._type];
  }

  get coordinates(): ReadonlyArray<Coordinate> {
    return this._coordinates;
  }

  get hits(): ReadonlyArray<Coordinate> {
    return this._hits;
  }

  get isDestroyed(): boolean {
    return this._hits.length === this._coordinates.length;
  }

  occupies(coordinate: Coordinate): boolean {
    return CoordinateUtils.contains(this._coordinates, coordinate);
  }

  isHitAt(coordinate: Coordinate): boolean {
    return CoordinateUtils.contains(this._hits, coordinate);
  }

  registerHit(coordinate: Coordinate): Ship {
    // Only register if coordinate is part of ship and not already hit
    if (!this.occupies(coordinate) || this.isHitAt(coordinate)) {
      return this;
    }

    const newHits = [...this._hits, coordinate];
    return new Ship(this._id, this._type, this._coordinates, newHits);
  }

  serialize(): SerializedShip {
    return {
      id: this._id,
      type: this._type,
      length: this.length,
      coordinates: this._coordinates,
      hits: this._hits,
      isDestroyed: this.isDestroyed,
    };
  }

  static deserialize(data: SerializedShip): Ship {
    return new Ship(data.id, data.type, data.coordinates, data.hits);
  }

  /**
   * Clone the ship
   */
  clone(): Ship {
    return new Ship(
      this._id,
      this._type,
      [...this._coordinates],
      [...this._hits],
    );
  }
}
