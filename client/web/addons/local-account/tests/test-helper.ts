import { setApplication } from '@ember/test-helpers';
import * as QUnit from 'qunit';
import { setup as qunitDOM } from 'qunit-dom';
import { start } from 'ember-qunit';

import Application from 'dummy/app';
import config from 'dummy/config/environment';

setApplication(Application.create(config.APP));

qunitDOM(QUnit.assert);

start();
