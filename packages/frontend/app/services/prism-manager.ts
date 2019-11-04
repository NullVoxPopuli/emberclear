import Service from '@ember/service';
import { task } from 'ember-concurrency';
import Task from 'ember-concurrency/task';

const js = [
  'prismjs',
  'prismjs/plugins/line-numbers',
  'prismjs/plugins/show-language',
  'prismjs/plugins/normalize-whitespace',
  'prismjs/plugins/autolinker',
];

// const mainCss = `${PRISM_URL}/themes/prism.min.css`;
// const lineNumCss = `${PRISM_PLUGIN_PATH}line-numbers/prism-line-numbers.min.css`;
// const autolinkerCss = `${PRISM_PLUGIN_PATH}autolinker/prism-autolinker.min.css`;
// const css = [mainCss, lineNumCss, autolinkerCss].join(',');

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

    console.log('adding',language);
    if (this.alreadyAdded.includes(language) && element) {
      return Prism.highlightAllUnder(element);
    }

    // yield import('prismjs/components/prism-handlebars.min.js');
    yield import('prismjs/components/prism-typescript.min.js');
    // ember-auto-import why
    // yield import(`prismjs/components/prism-${language}.min.js`);

    this.alreadyAdded.push(language);

    if (element) {
      return Prism.highlightAllUnder(element);
    }

    Prism.highlightAll();
  })
    .maxConcurrency(1)
    .enqueue())
  addLanguage!: Task;

  @(task(function*(this: PrismManager) {
    if (this.areEssentialsPresent) return;

    yield addScripts();
    addStyles();

    this.areEssentialsPresent = true;
  }).drop())
  addEssentials!: Task;

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

async function addScripts() {
  await import('prismjs').then(Prism => ((window as any).Prism = Prism));

  await Promise.all([
    import('prismjs/plugins/line-numbers/prism-line-numbers.min.js'),
    import('prismjs/plugins/show-language/prism-show-language.min.js'),
    import('prismjs/plugins/normalize-whitespace/prism-normalize-whitespace.min.js'),
    import('prismjs/plugins/autolinker/prism-autolinker.min.js'),
  ]);
  // addScript('/prismjs/prism.js');
  // addScript('/prismjs/components/prism-core.min.js');
  // addScript('/prismjs/plugins/line-numbers/prism-line-numbers.min.js');
  // addScript('/prismjs/plugins/show-language/prism-show-language.min.js');
  // addScript('/prismjs/plugins/normalize-whitespace/prism-normalize-whitespace.min.js');
  // addScript('/prismjs/plugins/autolinker/prism-autolinker.min.js');
}

function addStyles() {
  addStyle('/prismjs/themes/prism.css');
  // addStyle('/prismjs/themes/prism-twilight.css');
  addStyle('/prismjs/plugins/line-numbers/prism-line-numbers.css');
  addStyle('/prismjs/plugins/autolinker/prism-autolinker.css');
}

function addStyle(path: string) {
  let head = document.querySelector('head')!;
  let link = document.createElement('link');

  link.setAttribute('href', path);
  link.setAttribute('rel', 'stylesheet');

  head.appendChild(link);
}

function addScript(path: string) {
  let head = document.querySelector('head')!;
  let script = document.createElement('script');

  // script.setAttribute('type', 'text/javascript');
  script.setAttribute('src', path);
  script.onload = () => console.log('done', path);
  script.setAttribute('defer', '');
  // script.setAttribute('async', '');

  head.appendChild(script);
}
