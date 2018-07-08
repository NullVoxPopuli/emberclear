import Service from '@ember/service';

export default class PrismManager extends Service {
  areEssentialsPresent = false;
  alreadyAdded: string[] = []

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
  addLanguage(language: string) {
    this.addEssentials();

    if (this.alreadyAdded.includes(language)) return;

    const path = `https://cdn.jsdelivr.net/combine/npm/prismjs@1.14.0/components/prism-${language}.min.js`;

    this.addScript(path);

    this.alreadyAdded.push(language);

    setTimeout(() => Prism && Prism.highlightAll(), 1000);
  }

  addEssentials() {
    if (this.areEssentialsPresent) return;

    const mainJs = 'https://cdn.jsdelivr.net/combine/npm/prismjs@1.14.0';
    const linNumJs = 'npm/prismjs@1.14.0/plugins/line-numbers/prism-line-numbers.min.js';
    const langJs = 'npm/prismjs@1.14.0/plugins/show-language/prism-show-language.min.js';
    const normalWhiteSpaceJs = 'npm/prismjs@1.14.0/plugins/normalize-whitespace/prism-normalize-whitespace.min.js';
    const autoLinkJs = 'npm/prismjs@1.14.0/plugins/autolinker/prism-autolinker.min.js';
    const js = [mainJs, linNumJs, langJs, normalWhiteSpaceJs, autoLinkJs].join(',');

    const mainCss = 'https://cdn.jsdelivr.net/combine/npm/prismjs@1.14.0/themes/prism.min.css';
    const lineNumCss = 'npm/prismjs@1.14.0/plugins/line-numbers/prism-line-numbers.min.css';
    const autolinkerCss = 'npm/prismjs@1.14.0/plugins/autolinker/prism-autolinker.min.css';
    const css = [mainCss, lineNumCss, autolinkerCss].join(',');

    const head = document.querySelector('head');
    const link = document.createElement('link');
    const script = document.createElement('script');

    script.setAttribute('src', js);
    link.setAttribute('href', css);
    link.setAttribute('rel', 'stylesheet');

    head.appendChild(link);
    head.appendChild(script);

    this.set('areEssentialsPresent', true);
  }

  addScript(path: string) {
    const head = document.querySelector('head');
    const script = document.createElement('script');

    script.setAttribute('src', path);

    head.appendChild(script);
  }
}
