// namespace CurrentUserSubMachine {
//   export type Schema = {
//     states: {
//       wait_for_verification_attempt_from_unverified_user: {},
//       check_attempt: {},
//       finished: {}
//     };
//   };

//   export type Event =
//     | { type: 'CURRENT_USER_VERIFY_FRIEND' }
//     | { type: 'UNVERIFIED_USER_ATTEMPTED_VERIFICATION' }
//     | { type: 'VERIFICATION_ATTEMPT_RECEIVED' }
//     | { type: 'TIMER_TRIGGER' }
//     | { type: 'ATTEMPT_RECIEVED' };
// };

// namespace UnverifiedUserSubMachine {
//   export type Schema = {
//     states: {
//       attempt_verification: {},
//       finished: {};
//     };
//   };

//   export type Event = { type: 'VERIFICATION_ATTEMPT' };
// };

// export interface Schema {
//   states: {
//     idle: {};
//     currentUser: CurrentUserSubMachine.Schema;
//     unverifiedUser: UnverifiedUserSubMachine.Schema;
//   };
// };

// export type Event =
//   | CurrentUserSubMachine.Event
//   | UnverifiedUserSubMachine.Event;

// export interface Context {

// };