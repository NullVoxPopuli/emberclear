import Component from '@glimmer/component';
import { action } from '@ember/object';

interface IArgs {
  onChoose: (content: string) => void;
}

export default class FileChooser extends Component<IArgs> {
  inputElement!: HTMLInputElement;

  @action bindInput(element: HTMLInputElement) {
    this.inputElement = element;
  }

  @action openFileChooser() {
    this.inputElement.click();
  }

  @action didChooseFile(e: Event) {
    const fileReader = new FileReader();
    const fileInput = e.target as HTMLInputElement;
    const file = (fileInput.files && fileInput.files[0]) || new Blob();

    if (!file) return;
    if (file.size === 0) return;

    fileReader.onload = event => {
      const content = event.target!.result;

      this.args.onChoose(content);
    };

    fileReader.readAsText(file);
  }
}
