import Controller from '@ember/controller';

export interface IQueryParams {
  name?: string;
  publicKey?: string;
}

export default class InviteController extends Controller {
  queryParams = ['name', 'publicKey'];
}
// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
  interface Registry {
    'invite-controller': InviteController;
  }
}
