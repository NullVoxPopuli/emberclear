import Component from '@ember/component';
import { action } from '@ember-decorators/object';

export default class FileChooser extends Component {
  onChoose!: (content: string) => void;

  @action
  openFileChooser() {
    this.element.querySelector('input')!.click();
  }

  @action
  didChooseFile(e: Event) {
    const fileReader = new FileReader();
    const fileInput = e.target as HTMLInputElement;
    const file = (fileInput.files && fileInput.files[0]) || new Blob();

    if(!file) return;
    if(file.size === 0) return;

    fileReader.onload = (event) => {
      const content = event.target!.result;

      this.onChoose(content);
    }

    fileReader.readAsText(file);
  }
}
