// src/lib/jackpot/game.ts
export type TileSet = number[];

export class Game {
  tilesMax: number;
  singleDieRule: boolean;

  tiles: Record<number, boolean>;
  over: boolean;
  lastRoll: number | null;

  constructor(tilesMax = 9, singleDieRule = true) {
    this.tilesMax = tilesMax;
    this.singleDieRule = singleDieRule;
    this.tiles = {};
    for (let i = 1; i <= tilesMax; i++) {
      this.tiles[i] = true;
    }
    this.over = false;
    this.lastRoll = null;
  }

  openTiles(): number[] {
    return Object.keys(this.tiles)
      .map(Number)
      .filter((t) => this.tiles[t]);
  }

  score(): number {
    return this.openTiles().reduce((a, b) => a + b, 0);
  }

  canChooseDieCount(): boolean {
    const high = [7, 8, 9].filter((i) => i <= this.tilesMax);
    return (
      this.singleDieRule &&
      high.every((i) => this.tiles[i] === false)
    );
  }

  private combosThatSum(nums: number[], target: number): TileSet[] {
    const results: TileSet[] = [];

    const helper = (start: number, combo: number[], total: number) => {
      if (total === target) {
        results.push([...combo]);
        return;
      }
      if (total > target) return;

      for (let i = start; i < nums.length; i++) {
        combo.push(nums[i]);
        helper(i + 1, combo, total + nums[i]);
        combo.pop();
      }
    };

    helper(0, [], 0);
    return results;
  }

  availableMoves(target: number): TileSet[] {
    return this.combosThatSum(this.openTiles(), target);
  }

  roll(forced?: number, dice?: number): number {
    if (this.over) return this.lastRoll ?? 0;

    let dcount = 2;
    if (this.canChooseDieCount()) {
      if (dice === 1) dcount = 1;
      else if (dice === 2) dcount = 2;
    }

    let result: number;
    if (forced !== undefined) {
      result = forced;
    } else {
      result = 0;
      for (let i = 0; i < dcount; i++) {
        result += Math.floor(Math.random() * 6) + 1;
      }
    }

    this.lastRoll = result;
    const moves = this.availableMoves(result);
    if (moves.length === 0) {
      this.over = true;
    }
    return result;
  }

  move(chosen: TileSet): boolean {
    if (this.over || this.lastRoll === null) return false;

    const legal = this.availableMoves(this.lastRoll);
    const chosenSorted = chosen.slice().sort((a, b) => a - b);
    const legalStr = legal.map((mv) => mv.join("+"));
    if (!legalStr.includes(chosenSorted.join("+"))) {
      return false;
    }

    for (const t of chosenSorted) {
      this.tiles[t] = false;
    }

    this.lastRoll = null;
    if (this.openTiles().length === 0) this.over = true;
    return true;
  }
}