import Application from '../src/main';
import config from '../config/environment';
import { setApplication } from '@ember/test-helpers';
import { start } from 'ember-qunit';

// QUnit.config.testTimeout = 10000;


setApplication(Application.create(config.APP));

start();
