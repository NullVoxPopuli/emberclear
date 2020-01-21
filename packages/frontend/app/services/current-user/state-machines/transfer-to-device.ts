import { Machine } from 'xstate';
import { Context, Schema, Event } from './tranfer-to-device.types';

// https://xstate.js.org/viz/?gist=23cf0c840cf6403ae6a3f37e9095735f
// "Transfer Account to a new Device"
//
// This could be two machines
// but they are mutually exclusive.
// so the lightweight top-level machine
// maintains that mutual exclusivity
export const transferToDeviceMachine = Machine<Context, Schema, Event>({
  id: 'transfer-to-device',
  initial: 'idle',

  states: {
    idle: {
      on: {
        // 1. (Source)
        //    Initiate Intent to Transfer
        //    Wait for Destination device to Scan Code
        //    NOTE: QR Code only contains ephemeral Public Key
        SOURCE_INITIATE: 'source',
        // 2. (Destination)
        //    On Login Screen click,
        //    "Transfer Profile from another device"
        DESTINATION_SCANNED_SOURCE_QR_CODE: 'destination',
    },
    },

    source: {
      onDone: 'idle',
      initial: 'wait_for_scan_from_destination',
      entry: [
        'generateEphemeralKeys',
        'establishConnection'
      ],
      exit: ['destroyConnection'],
      on: {

      },
      states: {
        // after we send confirmation of existence
        // generate a random code / transition
        // to a page that shows this code in a
        // friendly way. DO NOT SEND THIS CODE.
        wait_for_scan_from_destination: {
          on: {
            RECEIVED_TRANSFER_REQUEST: {
              target: 'wait_for_auth',
            }
          }
        },

        wait_for_auth: {
          entry: [
            'generateSecretCode'
          ],
          on: {
           RECEIVED_CODE: [
            {
              target: 'destination_authorized',
              cond: 'isCodeCorrect',
              actions: ['onAuthorizationSuccess']
            },
            {
              target: 'wait_for_auth',
              actions: ['onAuthorizationFailure']
            }
          ]
          },
        },


        // authorized
        destination_authorized: {
          entry: ['hashData', 'sendData'],
          on: {
            ALL_DATA_SENT: 'wait_for_verification_hash',
          }
        },

        wait_for_verification_hash: {

          on: {
            RECEIVED_VERIFICATION_HASH: [
              {
                target: 'finished',
                cond: 'isHashCorrect',
                actions: ['onDataVerificationSuccess']
              },
              {
                target: 'data_send_failure',
                actions: ['onDataVerificationFailure']
              }
            ]
          }
        },

        data_send_failure: {
          on: {
            RETRY: {
              target: 'destination_authorized',
              actions: [
                // transitionTo: pending auth
                'onSendRetry',
              ],
            }
          }
        },


        finished: {
          entry: ['onDataSent'],
          type: 'final'
        }
      }
    },

    destination: {
      entry: ['establishConnection', 'sendHello'],
      onDone: 'idle',
      initial: 'wait_for_confirmation_of_connection',
      on: {

      },
      states: {
        // once received, transition to input screen
        // to authorize. The code is NOT sent.
        wait_for_confirmation_of_connection: {
          on: {
            CONFIRMATION_RECEIVED: 'enter_code'
          }
        },

        enter_code: {
          entry: ['transitionToCodeEntry'],
          on: {
            SUBMIT_CODE: {
              target: 'wait_for_validation',
              actions: ['waiting']
            }
          }
        },

        wait_for_validation: {
          on: {
            VALIDATION_RECEIVED: [
              {
                target: 'receiving_data',
                cond: 'isCodeCorrect',
                actions: ['flashCodeConfirmed']
              },
              {
                target: 'enter_code',
                actions: ['raiseFailedAuth']
              }
            ]
          },
        },

        receiving_data: {
          on: {
            ALL_DATA_SENT: 'wait_for_data_hash_verification'
          }
        },

        wait_for_data_hash_verification: {
          entry: ['sendDataHash'],
          on: {
            VERIFICATION_RESPONSE_RECEIVED: [
              {
                target: 'finished',
                cond: 'isHashCorrect',
                actions: ['onHashCorrect'],
              },
              {
                target: 'data_receive_failure',
                actions: ['onHashFailure'],
              }
            ]
          }
        },

        data_receive_failure: {
          on: {
            RETRY: {
              target: 'wait_for_validation',
              actions: ['onReceiveRetry'],
            }
          }
        },


        finished: {
          type: 'final',
          entry: 'onDataReceived'
        }
      }
    },
  },
});
