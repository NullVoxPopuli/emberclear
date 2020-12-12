import Application from 'pinochle/app';
import config from 'pinochle/config/environment';
import { setApplication } from '@ember/test-helpers';
import { start } from 'ember-qunit';
import QUnit from 'qunit';

// Install Types and assertion extensions
import 'qunit-dom';
import 'qunit-assertions-extra';

const seed = Math.random().toString(36).substr(2, 5);

QUnit.config.seed = seed;
QUnit.config.reorder = false;

QUnit.begin(async () => {
  console.info(`Using seed for Qunit: ${seed}`);
});

setApplication(Application.create(config.APP));

start({
  setupTestIsolationValidation: true,
});
