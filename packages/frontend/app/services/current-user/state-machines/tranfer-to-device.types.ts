
namespace SourceSubMachine {
  export type Schema = {
    states: {
      wait_for_scan_from_destination: {};
      wait_for_auth: {};
      destination_authorized: {};
      wait_for_verification_hash: {};
      data_send_failure: {};
      finished: {}
    };
  };

  export type Event =
    | { type: 'SOURCE_INITIATE' }
    | { type: 'DESTINATION_SCANNED_SOURCE_QR_CODE' }
    | { type: 'RECEIVED_TRANSFER_REQUEST' }
    | { type: 'RECEIVED_CODE' }
    | { type: 'ALL_DATA_SENT' }
    | { type: 'RECEIVED_VERIFICATION_HASH' }
    | { type: 'RETRY' };
};

namespace DestinationSubMachine {
  export type Schema = {
    states: {
      wait_for_confirmation_of_connection: {};
      enter_code: {};
      wait_for_validation: {};
      receiving_data: {};
      wait_for_data_hash_verification: {};
      data_receive_failure: {};
      finished: {};
    };
  }

  export type Event =
    | { type: 'CONFIRMATION_RECEIVED' }
    | { type: 'SUBMIT_CODE' }
    | { type: 'VALIDATION_RECEIVED' }
    | { type: 'ALL_DATA_SENT' }
    | { type: 'VERIFICATION_RESPONSE_RECEIVED' }
    | { type: 'RETRY' };
}

export interface Schema {
  states: {
    idle: {};
    source: SourceSubMachine.Schema;
    destination: DestinationSubMachine.Schema;
  };
}

export type Event =
  | SourceSubMachine.Event
  | DestinationSubMachine.Event;

export interface Context {

}
