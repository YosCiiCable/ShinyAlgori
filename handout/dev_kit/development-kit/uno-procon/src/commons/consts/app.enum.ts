export enum StatusGame {
  NEW = 'new',
  STARTING = 'starting',
  FINISH = 'finish',
}

export enum Special {
  SKIP = 'skip',
  REVERSE = 'reverse',
  DRAW_2 = 'draw_2',
  WILD = 'wild',
  WILD_DRAW_4 = 'wild_draw_4',
  WILD_SHUFFLE = 'wild_shuffle',
  WHITE_WILD = 'white_wild',
}

export enum Color {
  RED = 'red',
  YELLOW = 'yellow',
  GREEN = 'green',
  BLUE = 'blue',
  BLACK = 'black',
  WHITE = 'white',
}

export enum WhiteWild {
  BIND_2 = 'bind_2',
}

export enum DrawReason {
  DRAW_2 = 'draw_2',
  WILD_DRAW_4 = 'wild_draw_4',
  BIND_2 = 'bind_2',
  NOTING = 'nothing',
}

export const ARR_NUMBER = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
export const ARR_COLOR = [
  Color.RED,
  Color.YELLOW,
  Color.GREEN,
  Color.BLUE,
  Color.BLACK,
  Color.WHITE,
];
export const ARR_COLOR_OF_WILD = [Color.RED, Color.YELLOW, Color.GREEN, Color.BLUE];
export const ARR_WILD_SPECIAL = [Special.WILD, Special.WILD_DRAW_4, Special.WILD_SHUFFLE];
export const ARR_SPECIAL = [
  Special.SKIP,
  Special.REVERSE,
  Special.DRAW_2,
  Special.WILD,
  Special.WILD_DRAW_4,
  Special.WILD_SHUFFLE,
  Special.WHITE_WILD,
];

export interface Card {
  color: Color | string; // red, yellow, green, blue, black, white
  number?: number; // 0, 1, 2, ..., 9
  special?: Special | string; // skip, reverse, draw_2, wild, wild_draw_4, wild_shuffle, white_wild
}

export interface Desk {
  dealer: string;
  players: string[];
  status: string;
  drawDesk: Card[];
  revealDesk: Card[];
  turn: number;
  totalTurn: number;
  firstPlayer: string;
  beforePlayer: string;
  nextPlayer: string;
  turnRight: boolean;
  cardOfPlayer: {
    [key: string]: Card[];
  };
  beforeCardPlay: Card;
  cardAddOn: number;
  mustCallDrawCard: boolean;
  cardBeforeWildDraw4?: Card;
  colorBeforeWild?: Color | string;
  canCallPlayDrawCard: boolean;
  cardBeforeDrawCard?: Card;
  whiteWild?: WhiteWild;
  activationWhiteWild?: {
    [key: string]: number;
  };
  order: {
    [key: string]: number;
  };
  score: {
    [key: string]: number;
  };
  yellUno: {
    [key: string]: boolean;
  };
  timeout: {
    [key: string]: boolean;
  };
  isSkip: boolean;
  numberTurnPlay: number;
  numberCardPlay: number;
  noPlayCount: number;
  specialLogic?: {
    [key: string]: number;
  };
  restrictInterrupt?: boolean;
}
