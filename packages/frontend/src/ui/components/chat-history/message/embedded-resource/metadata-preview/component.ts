import Component from '@ember/component';
import { and, reads } from '@ember-decorators/object/computed';

export default class MetadataPreview extends Component {
  @and('ogData.title', 'ogData.description') hasOgData!: boolean;
  @reads('ogData') og!: OpenGraphData;

}
