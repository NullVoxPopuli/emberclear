import Route from '@ember/routing/route';

const NUM_PLAYERS = 3;

export default class ThreePlayerRoute extends Route {
  async model() {
    return {
      numPlayers: NUM_PLAYERS,
    };
  }
}
