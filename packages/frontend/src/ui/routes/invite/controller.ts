import Controller from '@ember/controller';

export default class InviteController extends Controller {
  queryParams = ['name', 'publicKey'];

  name?: string;
  publicKey?: string;
}
// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
  interface Registry {
    'invite-controller': InviteController;
  }
}
