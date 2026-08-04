export class IdGenerator {
  private static counter = 0;

  static generate(prefix: string = "id"): string {
    // return `${prefix}_${++IdGenerator.counter}_${Date.now()}`;

    const shortId = crypto.randomUUID().split("-")[0];
    return `${prefix}_${++IdGenerator.counter}_${shortId}`;
  }

  static reset(): void {
    IdGenerator.counter = 0;
  }

  static gameId(): string {
    return IdGenerator.generate("game");
  }

  static playerId(): string {
    return IdGenerator.generate("player");
  }

  static shipId(): string {
    return IdGenerator.generate("ship");
  }
}
