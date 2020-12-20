import { module, test } from 'qunit';

import { Card } from 'pinochle/game/card';
import { Meld } from 'pinochle/game/meld';

module('Unit | Game | Meld', function () {
  module('marriage', function () {
    test('plain', function (assert) {
      let meld = new Meld([new Card('clubs', 'queen'), new Card('clubs', 'king')]);

      assert.equal(meld.score, 20);
      assert.ok(meld.matches.marriage);
      assert.deepEqual(meld.matches.marriage, {
        value: 20,
        matches: {
          clubs: { trump: false },
        },
      });
    });

    test('marriage (of trump)', function (assert) {
      let meld = new Meld([new Card('clubs', 'queen'), new Card('clubs', 'king')], 'clubs');

      assert.equal(meld.score, 40);
      assert.ok(meld.matches.marriage);
      assert.deepEqual(meld.matches.marriage, {
        value: 40,
        matches: {
          clubs: { trump: true },
        },
      });
    });

    test('double marriage', function (assert) {
      let meld = new Meld([
        new Card('clubs', 'queen'),
        new Card('clubs', 'king'),
        new Card('clubs', 'queen'),
        new Card('clubs', 'king'),
      ]);

      assert.equal(meld.score, 40);
      assert.ok(meld.matches.marriage);
      assert.deepEqual(meld.matches.marriage, {
        value: 40,
        matches: {
          clubs: { trump: false, double: true },
        },
      });
    });

    test('double marriage (of trump)', function (assert) {
      let meld = new Meld(
        [
          new Card('clubs', 'queen'),
          new Card('clubs', 'king'),
          new Card('clubs', 'queen'),
          new Card('clubs', 'king'),
        ],
        'clubs'
      );

      assert.equal(meld.score, 80);
      assert.ok(meld.matches.marriage);
      assert.deepEqual(meld.matches.marriage, {
        value: 80,
        matches: {
          clubs: { trump: true, double: true },
        },
      });
    });

    test('multiple marriages', function (assert) {
      let meld = new Meld([
        new Card('clubs', 'queen'),
        new Card('clubs', 'king'),
        new Card('hearts', 'queen'),
        new Card('hearts', 'king'),
        new Card('spades', 'queen'),
        new Card('spades', 'king'),
      ]);

      assert.equal(meld.score, 60);
      assert.ok(meld.matches.marriage);
      assert.deepEqual(meld.matches.marriage, {
        value: 60,
        matches: {
          clubs: { trump: false },
          hearts: { trump: false },
          spades: { trump: false },
        },
      });
    });

    test('multiple marriages (with one of trump)', function (assert) {
      let meld = new Meld(
        [
          new Card('clubs', 'queen'),
          new Card('clubs', 'king'),
          new Card('hearts', 'queen'),
          new Card('hearts', 'king'),
          new Card('spades', 'queen'),
          new Card('spades', 'king'),
        ],
        'hearts'
      );

      assert.equal(meld.score, 80);
      assert.ok(meld.matches.marriage);
      assert.deepEqual(meld.matches.marriage, {
        value: 80,
        matches: {
          clubs: { trump: false },
          hearts: { trump: true },
          spades: { trump: false },
        },
      });
    });

    test('multiple marriages (with double of trump)', function (assert) {
      let meld = new Meld(
        [
          new Card('clubs', 'queen'),
          new Card('clubs', 'king'),
          new Card('hearts', 'queen'),
          new Card('hearts', 'king'),
          new Card('spades', 'queen'),
          new Card('spades', 'king'),
          new Card('spades', 'queen'),
          new Card('spades', 'king'),
        ],
        'spades'
      );

      assert.equal(meld.score, 120);
      assert.ok(meld.matches.marriage);
      assert.deepEqual(meld.matches.marriage, {
        value: 120,
        matches: {
          clubs: { trump: false },
          hearts: { trump: false },
          spades: { trump: true, double: true },
        },
      });
    });
  });

  module('pinochle', function () {
    test('single', function (assert) {
      let meld = new Meld([new Card('diamonds', 'jack'), new Card('spades', 'queen')]);

      assert.equal(meld.score, 30);
      assert.ok(meld.matches.pinochle);
      assert.deepEqual(meld.matches.pinochle, {
        value: 30,
        matches: {},
      });
    });

    test('double', function (assert) {
      let meld = new Meld([
        new Card('diamonds', 'jack'),
        new Card('spades', 'queen'),
        new Card('diamonds', 'jack'),
        new Card('spades', 'queen'),
      ]);

      assert.equal(meld.score, 300);
      assert.ok(meld.matches.pinochle);
      assert.deepEqual(meld.matches.pinochle, {
        value: 300,
        matches: {},
      });
    });

    test('not quite double', function (assert) {
      let meld = new Meld([
        new Card('diamonds', 'jack'),
        new Card('spades', 'queen'),
        new Card('spades', 'queen'),
      ]);

      assert.equal(meld.score, 30);
      assert.ok(meld.matches.pinochle);
      assert.deepEqual(meld.matches.pinochle, {
        value: 30,
        matches: {},
      });
    });
  });

  module('nines', function () {
    test('pre trump declaration', function (assert) {
      let meld = new Meld([new Card('diamonds', 9)]);

      assert.equal(meld.score, 0);
      assert.ok(meld.matches.nineOfTrump);
      assert.deepEqual(meld.matches.nineOfTrump, {
        value: 0,
        matches: {},
      });
    });

    test('has nine of trump', function (assert) {
      let meld = new Meld([new Card('diamonds', 9)], 'diamonds');

      assert.equal(meld.score, 10);
      assert.ok(meld.matches.nineOfTrump);
      assert.deepEqual(meld.matches.nineOfTrump, {
        value: 10,
        matches: {},
      });
    });

    test('has both nines of trump', function (assert) {
      let meld = new Meld([new Card('diamonds', 9), new Card('diamonds', 9)], 'diamonds');

      assert.equal(meld.score, 20);
      assert.ok(meld.matches.nineOfTrump);
      assert.deepEqual(meld.matches.nineOfTrump, {
        value: 20,
        matches: {},
      });
    });

    test('has *all* the nines', function (assert) {
      let meld = new Meld(
        [
          new Card('diamonds', 9),
          new Card('diamonds', 9),
          new Card('spades', 9),
          new Card('spades', 9),
          new Card('clubs', 9),
          new Card('clubs', 9),
          new Card('hearts', 9),
          new Card('hearts', 9),
        ],
        'diamonds'
      );

      assert.equal(meld.score, 20);
      assert.ok(meld.matches.nineOfTrump);
      assert.deepEqual(meld.matches.nineOfTrump, {
        value: 20,
        matches: {},
      });
    });
  });

  module('aces', function () {
    test('not enough', function (assert) {
      let meld = new Meld([
        new Card('diamonds', 'ace'),
        new Card('clubs', 'ace'),
        new Card('spades', 'ace'),
        new Card('hearts', 9),
      ]);

      assert.equal(meld.score, 0);
      assert.ok(meld.matches.aces);
      assert.deepEqual(meld.matches.aces, {
        value: 0,
        matches: {},
      });
    });

    test('100 aces', function (assert) {
      let meld = new Meld([
        new Card('diamonds', 'ace'),
        new Card('clubs', 'ace'),
        new Card('spades', 'ace'),
        new Card('hearts', 'ace'),
      ]);

      assert.equal(meld.score, 100);
      assert.ok(meld.matches.aces);
      assert.deepEqual(meld.matches.aces, {
        value: 100,
        matches: {},
      });
    });

    test('not 1000 aces', function (assert) {
      let meld = new Meld([
        new Card('diamonds', 'ace'),
        new Card('clubs', 'ace'),
        new Card('spades', 'ace'),
        new Card('hearts', 'ace'),
        new Card('diamonds', 'ace'),
        new Card('clubs', 'ace'),
        new Card('spades', 'ace'),
      ]);

      assert.equal(meld.score, 100);
      assert.ok(meld.matches.aces);
      assert.deepEqual(meld.matches.aces, {
        value: 100,
        matches: {},
      });
    });

    test('1000 aces', function (assert) {
      let meld = new Meld([
        new Card('diamonds', 'ace'),
        new Card('clubs', 'ace'),
        new Card('spades', 'ace'),
        new Card('hearts', 'ace'),
        new Card('diamonds', 'ace'),
        new Card('clubs', 'ace'),
        new Card('spades', 'ace'),
        new Card('hearts', 'ace'),
      ]);

      assert.equal(meld.score, 1000);
      assert.ok(meld.matches.aces);
      assert.deepEqual(meld.matches.aces, {
        value: 1000,
        matches: {},
      });
    });
  });

  module('kings', function () {
    test('not enough', function (assert) {
      let meld = new Meld([
        new Card('diamonds', 'king'),
        new Card('clubs', 'king'),
        new Card('spades', 'king'),
        new Card('hearts', 9),
      ]);

      assert.equal(meld.score, 0);
      assert.ok(meld.matches.kings);
      assert.deepEqual(meld.matches.kings, {
        value: 0,
        matches: {},
      });
    });

    test('80 kings', function (assert) {
      let meld = new Meld([
        new Card('diamonds', 'king'),
        new Card('clubs', 'king'),
        new Card('spades', 'king'),
        new Card('hearts', 'king'),
      ]);

      assert.equal(meld.score, 80);
      assert.ok(meld.matches.kings);
      assert.deepEqual(meld.matches.kings, {
        value: 80,
        matches: {},
      });
    });

    test('not quite double', function (assert) {
      let meld = new Meld([
        new Card('diamonds', 'king'),
        new Card('clubs', 'king'),
        new Card('spades', 'king'),
        new Card('hearts', 'king'),
        new Card('diamonds', 'king'),
        new Card('clubs', 'king'),
        new Card('spades', 'king'),
      ]);

      assert.equal(meld.score, 80);
      assert.ok(meld.matches.kings);
      assert.deepEqual(meld.matches.kings, {
        value: 80,
        matches: {},
      });
    });

    test('double 80 kings', function (assert) {
      let meld = new Meld([
        new Card('diamonds', 'king'),
        new Card('clubs', 'king'),
        new Card('spades', 'king'),
        new Card('hearts', 'king'),
        new Card('diamonds', 'king'),
        new Card('clubs', 'king'),
        new Card('spades', 'king'),
        new Card('hearts', 'king'),
      ]);

      assert.equal(meld.score, 800);
      assert.ok(meld.matches.kings);
      assert.deepEqual(meld.matches.kings, {
        value: 800,
        matches: {},
      });
    });
  });

  module('queens', function () {
    test('not enough', function (assert) {
      let meld = new Meld([
        new Card('diamonds', 'queen'),
        new Card('clubs', 'queen'),
        new Card('spades', 'queen'),
        new Card('hearts', 9),
      ]);

      assert.equal(meld.score, 0);
      assert.ok(meld.matches.queens);
      assert.deepEqual(meld.matches.queens, {
        value: 0,
        matches: {},
      });
    });

    test('60 queens', function (assert) {
      let meld = new Meld([
        new Card('diamonds', 'queen'),
        new Card('clubs', 'queen'),
        new Card('spades', 'queen'),
        new Card('hearts', 'queen'),
      ]);

      assert.equal(meld.score, 60);
      assert.ok(meld.matches.queens);
      assert.deepEqual(meld.matches.queens, {
        value: 60,
        matches: {},
      });
    });

    test('not quite double', function (assert) {
      let meld = new Meld([
        new Card('diamonds', 'queen'),
        new Card('clubs', 'queen'),
        new Card('spades', 'queen'),
        new Card('hearts', 'queen'),
        new Card('diamonds', 'queen'),
        new Card('clubs', 'queen'),
        new Card('spades', 'queen'),
      ]);

      assert.equal(meld.score, 60);
      assert.ok(meld.matches.queens);
      assert.deepEqual(meld.matches.queens, {
        value: 60,
        matches: {},
      });
    });

    test('double 60 queens', function (assert) {
      let meld = new Meld([
        new Card('diamonds', 'queen'),
        new Card('clubs', 'queen'),
        new Card('spades', 'queen'),
        new Card('hearts', 'queen'),
        new Card('diamonds', 'queen'),
        new Card('clubs', 'queen'),
        new Card('spades', 'queen'),
        new Card('hearts', 'queen'),
      ]);

      assert.equal(meld.score, 600);
      assert.ok(meld.matches.queens);
      assert.deepEqual(meld.matches.queens, {
        value: 600,
        matches: {},
      });
    });
  });

  module('jacks', function () {
    test('not enough', function (assert) {
      let meld = new Meld([
        new Card('diamonds', 'jack'),
        new Card('clubs', 'jack'),
        new Card('spades', 'jack'),
        new Card('hearts', 9),
      ]);

      assert.equal(meld.score, 0);
      assert.ok(meld.matches.jacks);
      assert.deepEqual(meld.matches.jacks, {
        value: 0,
        matches: {},
      });
    });

    test('40 jacks', function (assert) {
      let meld = new Meld([
        new Card('diamonds', 'jack'),
        new Card('clubs', 'jack'),
        new Card('spades', 'jack'),
        new Card('hearts', 'jack'),
      ]);

      assert.equal(meld.score, 40);
      assert.ok(meld.matches.jacks);
      assert.deepEqual(meld.matches.jacks, {
        value: 40,
        matches: {},
      });
    });

    test('not quite double', function (assert) {
      let meld = new Meld([
        new Card('diamonds', 'jack'),
        new Card('clubs', 'jack'),
        new Card('spades', 'jack'),
        new Card('hearts', 'jack'),
        new Card('diamonds', 'jack'),
        new Card('clubs', 'jack'),
        new Card('spades', 'jack'),
      ]);

      assert.equal(meld.score, 40);
      assert.ok(meld.matches.jacks);
      assert.deepEqual(meld.matches.jacks, {
        value: 40,
        matches: {},
      });
    });

    test('double 40 jacks', function (assert) {
      let meld = new Meld([
        new Card('diamonds', 'jack'),
        new Card('clubs', 'jack'),
        new Card('spades', 'jack'),
        new Card('hearts', 'jack'),
        new Card('diamonds', 'jack'),
        new Card('clubs', 'jack'),
        new Card('spades', 'jack'),
        new Card('hearts', 'jack'),
      ]);

      assert.equal(meld.score, 400);
      assert.ok(meld.matches.jacks);
      assert.deepEqual(meld.matches.jacks, {
        value: 400,
        matches: {},
      });
    });
  });

  module('run', function () {
    test('run is not in trump', function (assert) {
      let meld = new Meld(
        [
          new Card('diamonds', 'jack'),
          new Card('diamonds', 'queen'),
          new Card('diamonds', 'king'),
          new Card('diamonds', 10),
          new Card('diamonds', 'ace'),
        ],
        'hearts'
      );

      assert.equal(meld.score, 20);
      assert.ok(meld.matches.run);
      assert.deepEqual(meld.matches.run, {
        value: 0,
        matches: {},
      });
      assert.ok(meld.matches.marriage);
      assert.deepEqual(meld.matches.marriage, {
        value: 20,
        matches: {
          diamonds: {
            trump: false,
          },
        },
      });
    });

    test('trump not declared', function (assert) {
      let meld = new Meld([
        new Card('diamonds', 'jack'),
        new Card('diamonds', 'queen'),
        new Card('diamonds', 'king'),
        new Card('diamonds', 10),
        new Card('diamonds', 'ace'),
      ]);

      assert.equal(meld.score, 20);
      assert.ok(meld.matches.run);
      assert.deepEqual(meld.matches.run, {
        value: 0,
        matches: {},
      });
      assert.ok(meld.matches.marriage);
      assert.deepEqual(meld.matches.marriage, {
        value: 20,
        matches: {
          diamonds: {
            trump: false,
          },
        },
      });
    });

    test('not enough', function (assert) {
      let meld = new Meld(
        [
          new Card('diamonds', 'jack'),
          new Card('diamonds', 'queen'),
          new Card('diamonds', 'king'),
          new Card('diamonds', 9),
          new Card('diamonds', 'ace'),
        ],
        'diamonds'
      );

      assert.equal(meld.score, 50);

      assert.ok(meld.matches.run);
      assert.deepEqual(meld.matches.run, {
        value: 0,
        matches: {},
      });

      assert.ok(meld.matches.marriage);
      assert.deepEqual(meld.matches.marriage, {
        value: 40,
        matches: {
          diamonds: {
            trump: true,
          },
        },
      });

      assert.ok(meld.matches.nineOfTrump);
      assert.deepEqual(meld.matches.nineOfTrump, {
        value: 10,
        matches: {},
      });
    });

    test('single run', function (assert) {
      let meld = new Meld(
        [
          new Card('diamonds', 'jack'),
          new Card('diamonds', 'queen'),
          new Card('diamonds', 'king'),
          new Card('diamonds', 10),
          new Card('diamonds', 'ace'),
        ],
        'diamonds'
      );

      assert.equal(meld.score, 150);
      assert.ok(meld.matches.run);
      assert.deepEqual(meld.matches.run, {
        value: 150,
        matches: {},
      });
    });

    test('not quite double', function (assert) {
      let meld = new Meld(
        [
          new Card('diamonds', 'jack'),
          new Card('diamonds', 'queen'),
          new Card('diamonds', 'king'),
          new Card('diamonds', 10),
          new Card('diamonds', 'ace'),
          new Card('diamonds', 'jack'),
          new Card('diamonds', 'queen'),
          new Card('diamonds', 'king'),
          new Card('diamonds', 10),
        ],
        'diamonds'
      );

      assert.equal(meld.score, 190);
      assert.ok(meld.matches.run);
      assert.deepEqual(meld.matches.run, {
        value: 150,
        matches: {},
      });
      assert.ok(meld.matches.marriage);
      assert.deepEqual(meld.matches.marriage, {
        value: 40,
        matches: {
          diamonds: {
            trump: true,
            double: true,
          },
        },
      });
    });

    test('double run', function (assert) {
      let meld = new Meld(
        [
          new Card('diamonds', 'jack'),
          new Card('diamonds', 'queen'),
          new Card('diamonds', 'king'),
          new Card('diamonds', 10),
          new Card('diamonds', 'ace'),
          new Card('diamonds', 'jack'),
          new Card('diamonds', 'queen'),
          new Card('diamonds', 'king'),
          new Card('diamonds', 10),
          new Card('diamonds', 'ace'),
        ],
        'diamonds'
      );

      assert.equal(meld.score, 1500);
      assert.ok(meld.matches.run);
      assert.deepEqual(meld.matches.run, {
        value: 1500,
        matches: {},
      });
    });
  });
});
