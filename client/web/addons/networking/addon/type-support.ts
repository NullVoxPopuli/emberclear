import '@ember/service';

import type ConnectionService from './services/connection';
import type MessageAutoResponder from './services/messages/auto-responder';
import type MessageDispatcher from './services/messages/dispatcher';
import type MessageFactory from './services/messages/factory';
import type ReceivedMessageHandler from './services/messages/handler';
import type MessageProcessor from './services/messages/processor';

/**
 * Add to the ember service registry for adding autocomplet to @service() and such
 */
declare module '@ember/service' {
  interface Registry {
    connection: ConnectionService;
    'messages/dispatcher': MessageDispatcher;
    'messages/auto-responder': MessageAutoResponder;
    'messages/factory': MessageFactory;
    'messages/handler': ReceivedMessageHandler;
    'messages/processor': MessageProcessor;
  }
}
