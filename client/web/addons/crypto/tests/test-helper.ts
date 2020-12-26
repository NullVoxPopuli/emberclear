import { setApplication } from '@ember/test-helpers';
import { start } from 'ember-qunit';

import Application from 'dummy/app';
import config from 'dummy/config/environment';

setApplication(Application.create(config.APP));

start();
