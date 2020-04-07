// import { Machine } from 'xstate';
// import { Context, Schema, Event } from './verify-friend.types';

// export const verifyFriendMachine = Machine<Context, Schema, Event>({
//   id: 'verify-friend',
//   initial: 'idle',

//   states: {
//     idle: {
//       on: {
//         // 1. (Current User)
//         //    - Initiate Intent to verify friend
//         //    - Wait for Unverified User's verification attempt
//         // Assuming initiateVerificationAttempt function will call generateCodes to generate QR code and the corresponding text 
//         CURRENT_USER_VERIFY_FRIEND: {
//           target: 'Current User',
//         },
//         // 2. (Unverified User)
//         //    - Scan QR code or type in text to attempt verification
//         [TRANSITION.UNVERIFIED_USER_ATTEMPTED_VERIFICATION]: 'Unverified User',
//       },
//     },

//     'Current User': {
//       onDone: 'idle',
//       initial: 'wait_for_verification_attempt_from_unverified_user',
//       entry: ['generateCodes', 'initiateVerificationAttempt'],
//       exit: ['cancelAttempt'],
//       states: {
//         wait_for_verification_attempt_from_unverified_user: {
//           on: {
//             VERIFICATION_ATTEMPT_RECEIVED: {
//               target: 'check_attempt',
//             },
//             TIMER_TRIGGER: {
//               target: 'wait_for_verification_attempt_from_unverified_user',
//               actions: ['generateCodes']
//             }
//           }
//         },

//         check_attempt: {
//           on: {
//             ATTEMPT_RECIEVED: [
//               {
//                 target: 'finished',
//                 cond: 'isAttemptValid',
//                 actions: ['markAsVerified', 'sendVerificationMessage']
//               },
//               {
//                 target: 'finished',
//                 actions: ['raiseFailedVerification']
//               },

//             ]
//           },
//         },

//         finished: {
//           type: 'final',
//           entry: ['onVerificationAttemptReceived'],
//           exit: ['sendVerificationMessage']
//         }
//       }
//     },

//     'Unverified User': {
//       entry: ['completeVerification'],
//       exit: ['cancelAttempt'],
//       onDone: 'idle',
//       initial: 'attempt_verification',
//       on: {

//       },
//       states: {

//         // attempt verification through scanning the bar code or entering the text code
//         attempt_verification: {
//           entry: ['onQRScanned', 'onCodeEntered'],
//           on: {
//             VERIFICATION_ATTEMPT: 'finished'
//           }
//         },

//         finished: {
//           type: 'final',
//           entry: ['onVerificationMessageReceived'],
//         }
//       }
//     },


//   },
// });
