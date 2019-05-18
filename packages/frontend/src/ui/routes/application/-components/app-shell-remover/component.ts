import Component from '@glimmer/component';

export default class extends Component {
  constructor(owner: any, args: any) {
    super(owner, args);

    this.removeAppLoader();
  }

  private removeAppLoader() {
    const loader = document.querySelector('#app-loader');

    if (loader) {
      loader.remove();
    }
  }
}
