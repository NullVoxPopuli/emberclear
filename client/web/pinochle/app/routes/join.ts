import Route from '@ember/routing/route';

interface Params {
  idOfHost: string;
}

export default class JoinRoute extends Route {
  async model(params: Params) {
    return {
      hostId: params.idOfHost,
    };
  }
}
