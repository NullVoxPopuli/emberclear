export default config;

/**
 * Type declarations for
 *    import config from './config/environment'
 *
 * For now these need to be managed by the developer
 * since different ember addons can materialize new entries.
 */
declare const config: {
  environment: 'production' | 'test' | 'development';
  modulePrefix: string;
  podModulePrefix: string;
  locationType: string;
  rootURL: string;
  host: string;

  APP: Record<string, unknown>;
};
