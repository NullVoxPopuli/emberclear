import Component from '@glimmer/component';

// import move from 'ember-animated/motions/move';
// import fade from 'ember-animated/transitions/fade';
// import { easeOut, easeIn } from 'ember-animated/easings/cosine';

interface IArgs {
  isActive: boolean;
  close: () => void;
}

export default class Modal extends Component<IArgs> {
  // fade = fade;
  // slide = function*({ insertedSprites, keptSprites, removedSprites }) {
  //   for (let sprite of insertedSprites) {
  //     sprite.startAtPixel({ y: window.innerHeight * 2, x: window.innerHeight / 2 });
  //     sprite.applyStyles({ 'z-index': 1 });
  //     move(sprite, { easing: easeIn });
  //   }

  //   for (let sprite of keptSprites) {
  //     sprite.applyStyles({ 'z-index': 1 });
  //     move(sprite);
  //   }

  //   for (let sprite of removedSprites) {
  //     sprite.applyStyles({ 'z-index': 1 });
  //     sprite.endAtPixel({ y: 1, x: 1 });
  //     move(sprite, { easing: easeOut });
  //   }
  // };
}
