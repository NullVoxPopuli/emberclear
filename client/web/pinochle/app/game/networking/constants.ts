export const GAME_PHASES = {
  MELD: 'meld',
  TRICK: 'trick',
} as const;

export type GamePhase = typeof GAME_PHASES[keyof typeof GAME_PHASES];
