import Service from '@ember/service';
import { task } from 'ember-concurrency';
import Task from 'ember-concurrency/task';
// import Prism from '@types/prismjs';

const PRISM_VERSION = '1.15.0';
const CDN = `https://cdn.jsdelivr.net/combine/`;
const PRISM_PATH = `npm/prismjs@${PRISM_VERSION}`;
const PRISM_PLUGIN_PATH = `${PRISM_PATH}/plugins/`;
const PRISM_URL = `${CDN}${PRISM_PATH}`;

const linNumJs = `${PRISM_PLUGIN_PATH}line-numbers/prism-line-numbers.min.js`;
const langJs = `${PRISM_PLUGIN_PATH}show-language/prism-show-language.min.js`;
const normalWhiteSpaceJs = `${PRISM_PLUGIN_PATH}normalize-whitespace/prism-normalize-whitespace.min.js`;
const autoLinkJs = `${PRISM_PLUGIN_PATH}autolinker/prism-autolinker.min.js`;
const js = [PRISM_URL, linNumJs, langJs, normalWhiteSpaceJs, autoLinkJs].join(',');

const mainCss = `${PRISM_URL}/themes/prism.min.css`;
const lineNumCss = `${PRISM_PLUGIN_PATH}line-numbers/prism-line-numbers.min.css`;
const autolinkerCss = `${PRISM_PLUGIN_PATH}autolinker/prism-autolinker.min.css`;
const css = [mainCss, lineNumCss, autolinkerCss].join(',');

export const languages = [
  'actionscript',
  'arduino',
  'basic',
  'c',
  'clojure',
  'coffeescript',
  'cpp',
  'crystal',
  'csharp',
  'css',
  'd',
  'dart',
  'django',
  'docker',
  'elixir',
  'elm',
  'erb',
  'erlang',
  'flow',
  'fsharp',
  'git',
  'go',
  'graphql',
  'haml',
  'haskell',
  'ini',
  'java',
  'javascript',
  'json',
  'jsx',
  'kotlin',
  'latex',
  'less',
  'lisp',
  'lua',
  'makefile',
  'markdown',
  'markup',
  'matlab',
  'objectivec',
  'perl',
  'php',
  'plsql',
  'powershell',
  'processing',
  'protobuf',
  'pug',
  'python',
  'r',
  'ruby',
  'rust',
  'sass',
  'scala',
  'scheme',
  'scss',
  'sql',
  'swift',
  'tsx',
  'typescript',
  'vbnet',
  'verilog',
  'vim',
  'visual-basic',
  'wasm',
  'wiki',
  'yaml',
];

export default class PrismManager extends Service {
  areEssentialsPresent = false;
  alreadyAdded: string[] = [];

  // language format:
  //  prism-{language}.min.js
  // examples:
  // npm/prismjs@1.14.0/components/prism-typescript.min.js
  // npm/prismjs@1.14.0/components/prism-jsx.min.js
  // npm/prismjs@1.14.0/components/prism-tsx.min.js
  // npm/prismjs@1.14.0/components/prism-markup-templating.min.js
  // npm/prismjs@1.14.0/components/prism-handlebars.min.js
  //
  // TODO: fetch these files asyncily, so we can manage state, and know
  // when to call highlightAll
  @(task(function*(this: PrismManager, language: string, element?: HTMLElement) {
    language = this._expandLanguageAbbreviation(language);

    yield this.addEssentials.perform();

    if (this.alreadyAdded.includes(language) && element) {
      return Prism.highlightAllUnder(element);
    }

    const path = `${PRISM_URL}/components/prism-${language}.min.js`;

    yield this.addScript(path);

    this.alreadyAdded.push(language);

    Prism.highlightAll();
  }).maxConcurrency(1))
  addLanguage!: Task;

  @(task(function*(this: PrismManager) {
    if (this.areEssentialsPresent) return;

    const head = document.querySelector('head')!;
    const link = document.createElement('link');

    link.setAttribute('href', css);
    link.setAttribute('rel', 'stylesheet');

    head.appendChild(link);
    yield this.addScript(js);

    this.set('areEssentialsPresent', true);
  }).drop())
  addEssentials!: Task;

  async addScript(path: string) {
    const head = document.querySelector('head')!;
    const script = document.createElement('script');

    const file = await fetch(path);
    const code = await file.text();

    script.setAttribute('type', 'text/javascript');
    script.innerHTML = code;

    head.appendChild(script);
  }

  _expandLanguageAbbreviation(language: string) {
    switch (language) {
      case 'ts':
        return 'typescript';
      case 'rb':
        return 'ruby';
      case 'hbs':
        return 'handlebars';
      case 'js':
        return 'javascript';
      default:
        return language;
    }
  }
}
