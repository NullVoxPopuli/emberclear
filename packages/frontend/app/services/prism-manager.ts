import Service from '@ember/service';
// NOTE: using task from ember-concurrency-decorators doesn't
//       allow for types to be recognized.
//       Continue using task from ember-concurrency instead.
//
//       This file will be where we periodically check if TypeScript
//       does what we want.
import { task } from 'ember-concurrency-decorators';

const aliases: Dict = {
  ts: 'typescript',
  rb: 'ruby',
  hbs: 'handlebars',
  js: 'javascript',
};

export default class PrismManager extends Service {
  areEssentialsPresent = false;
  alreadyAdded: string[] = [];
  prismLoader: any = undefined;

  @task({ maxConcurrency: 1, enqueue: true })
  *addLanguage(language: string, element: HTMLElement) {
    yield (this.addEssentials as any).perform();
    yield this.ensureLanguage(language);

    Prism.highlightAllUnder(element);
  }

  async ensureLanguage(language: string) {
    let name = aliases[language] || language;
    let hasAbbr = name !== language;
    let abbr = hasAbbr ? language : undefined;

    if (this.alreadyAdded.includes(language)) {
      return;
    }

    console.groupCollapsed(`PrismManager: loading: ${name}`);
    await this.prismLoader.load(Prism, name);
    console.debug(`Success: ${Boolean(Prism.languages[name])}`);
    console.groupEnd();

    if (abbr) {
      // eslint-disable-next-line require-atomic-updates
      Prism.languages[abbr] = Prism.languages[name];
    }

    this.alreadyAdded.push(language);
  }

  @task({ drop: true })
  *addEssentials() {
    if (this.areEssentialsPresent) return;

    let prismLoader = yield addScripts();
    addStyles();

    this.prismLoader = prismLoader;
    this.areEssentialsPresent = true;
  }
}

async function addScripts() {
  await import('prismjs').then(Prism => ((window as any).Prism = Prism));

  let modules = await Promise.all([
    import('prismjs/plugins/line-numbers/prism-line-numbers.min.js'),
    import('prismjs/plugins/show-language/prism-show-language.min.js'),
    import('prismjs/plugins/normalize-whitespace/prism-normalize-whitespace.min.js'),
    import('prismjs/plugins/autolinker/prism-autolinker.min.js'),
    import('prismjs-components-loader'),
    import('prismjs-components-loader/dist/all-components'),
  ]);

  let [, , , , prismLoader, allComponents] = modules;

  const PrismLoader = prismLoader.default;

  let loader = new PrismLoader(allComponents.default);

  return loader;
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
