// Install Types and assertion extensions
import 'qunit-dom';

// import 'qunit-assertions-extra';
import { setApplication } from '@ember/test-helpers';
import QUnit from 'qunit';
import { start } from 'ember-qunit';

import Application from 'pinochle/app';
import config from 'pinochle/config/environment';

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
