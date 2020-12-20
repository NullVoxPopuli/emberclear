import Route from '@ember/routing/route';

const NUM_PLAYERS = 4;

export default class FourPlayerRoute extends Route {
  async model() {
    return {
      numPlayers: NUM_PLAYERS,
    };
  }
}
