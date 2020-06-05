import Application from '../app';
import config from '../config/environment';
import { setApplication } from '@ember/test-helpers';
import { start } from 'ember-qunit';

// Install Types and assertion extensions
import 'qunit-dom';

setApplication(Application.create(config.APP));

start();
