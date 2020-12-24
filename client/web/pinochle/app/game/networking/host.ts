import { EphemeralConnection } from '@emberclear/networking';

/**
 * TODO:
 *  - track number of people connected
 *  - put those people in an order, with option to shuffle (us included)
 *  - implement card communication
 *  - add the ability to restart a game at any time
 *    - useful for the home rule of too many 9s
 */
export class GameHost extends EphemeralConnection {}
