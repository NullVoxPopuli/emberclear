import type { Card } from './card';

const POINTS = ['king', 'ace', 10];

export class Trick {
  private stack: Card[] = [];

  constructor(public maxSize: number) {}

  get points() {
    return this.stack.filter((card) => POINTS.includes(card.value)).length;
  }

  get suit() {
    return this.stack[0]?.suit;
  }

  get last() {
    return this.stack[this.stack.length - 1];
  }

  get isEmpty() {
    return this.stack.length === 0;
  }

  add(card: Card) {
    if (this.stack.length === this.maxSize) {
      throw new Error('This trick may not have more cards added');
    }

    this.stack.push(card);
  }
}
