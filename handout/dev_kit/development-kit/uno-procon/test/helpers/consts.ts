import APP_CONFIG from '../../src/configs/app.config';
import { Color, Special } from '../../src/commons/consts/app.enum';

export default {
  TIME_DELAY: 60,
  DEALER_1: 'Dealer 1',
  DEALER_2: 'Dealer 2',
  DEALER_3: 'Dealer 3',
  PLAYER_1_NAME: 'Player 1',
  PLAYER_2_NAME: 'Player 2',
  PLAYER_3_NAME: 'Player 3',
  PLAYER_4_NAME: 'Player 4',
  PLAYER_5_NAME: 'Player 5',
  PLAYER_1: '63109b817903821bf6c7e7e7',
  PLAYER_2: '63109b857903821bf6c7e7e9',
  PLAYER_3: '63109b887903821bf6c7e7eb',
  PLAYER_4: '63109b8b7903821bf6c7e7ed',
  TEAM_A: 'Team A',
  TEAM_B: 'Team B',
  TEAM_C: 'Team C',
  TEAM_D: 'Team D',
  TEAM_E: 'Team E',
  REQUEST_TIMEOUT: 50000,
  TOTAL_TURN: 1000,
  WHITE_WILD: {
    BIND_2: 'bind_2',
  },
  SOCKET: {
    HOST: 'localhost',
    PORT: APP_CONFIG.ENV.APP.PORT,
    EVENT: {
      JOIN_ROOM: 'join-room',
      RECEIVER_CARD: 'receiver-card',
      FIRST_PLAYER: 'first-player',
      COLOR_OF_WILD: 'color-of-wild',
      SHUFFLE_WILD: 'shuffle-wild',
      NEXT_PLAYER: 'next-player',
      PLAY_CARD: 'play-card',
      DRAW_CARD: 'draw-card',
      PLAY_DRAW_CARD: 'play-draw-card',
      CHALLENGE: 'challenge',
      PUBLIC_CARD: 'public-card',
      SAY_UNO_AND_PLAY_CARD: 'say-uno-and-play-card',
      POINTED_NOT_SAY_UNO: 'pointed-not-say-uno',
      SPECIAL_LOGIC: 'special-logic',
      FINISH_TURN: 'finish-turn',
      FINISH_GAME: 'finish-game',
    },
  },
  CARD_SET_25: [
    {
      color: Color.BLUE,
      special: Special.SKIP,
    },
    {
      color: Color.RED,
      number: 9,
    },
    {
      color: Color.RED,
      number: 8,
    },
    {
      color: Color.RED,
      number: 7,
    },
    {
      color: Color.RED,
      number: 6,
    },
    {
      color: Color.BLUE,
      special: Special.SKIP,
    },
    {
      color: Color.RED,
      number: 5,
    },
    {
      color: Color.RED,
      number: 4,
    },
    {
      color: Color.RED,
      number: 3,
    },
    {
      color: Color.RED,
      number: 2,
    },
    {
      color: Color.RED,
      special: Special.SKIP,
    },
    {
      color: Color.RED,
      number: 1,
    },
    {
      color: Color.RED,
      number: 0,
    },
    {
      color: Color.RED,
      number: 9,
    },
    {
      color: Color.RED,
      number: 8,
    },
    {
      color: Color.RED,
      special: Special.SKIP,
    },
    {
      color: Color.RED,
      number: 7,
    },
    {
      color: Color.RED,
      number: 6,
    },
    {
      color: Color.RED,
      number: 5,
    },
    {
      color: Color.RED,
      number: 4,
    },
    {
      color: Color.GREEN,
      special: Special.SKIP,
    },
    {
      color: Color.RED,
      number: 3,
    },
    {
      color: Color.RED,
      number: 2,
    },
    {
      color: Color.RED,
      number: 1,
    },
    {
      color: Color.RED,
      number: 0,
    },
  ],
};
