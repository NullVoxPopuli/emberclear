import type { Card } from './card';

const POINTS = ['king', 'ace', 10];

export class Trick {
  private stack: Card[] = [];

  constructor(public maxSize: number) {}

  get points() {
    return this.stack.filter((card) => POINTS.includes(card.value)).length;
  }

  add(card: Card) {
    if (this.stack.length === this.maxSize) {
      throw new Error('This trick may not have more cards added');
    }

    this.stack.push(card);
  }
}
