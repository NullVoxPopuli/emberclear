import Component from 'sparkles-component';

export default class extends Component {
  didInsertElement() {
    this.removeAppLoader();
  }

  private removeAppLoader() {
    const loader = document.querySelector('#app-loader');

    if (loader) {
      loader.remove();
    }
  }
}
