import Service from "@ember/service";

export default class IntlService extends Service {
  addTranslations: (locale: string, translations: any) => void;
  localeWithDefault: (locale: string) => string[];
  setLocale: (locale: string[] | string) => void;

  _adapter: any;
  _owner: any;
}
