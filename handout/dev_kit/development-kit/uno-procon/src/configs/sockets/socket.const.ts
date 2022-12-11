import { Card } from '../../commons/consts/app.enum';

export class SocketConst {
  static readonly EMIT = {
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
  };
}

export interface JoinRoom {
  room_name: string;
  player: string;
}

export interface ColorOfWild {
  color_of_wild: string;
}

export interface SayUnoAndPlayCard {
  card_play: Card;
}

export interface PlayCard {
  card_play: Card;
}

export interface PlayDrawCard {
  is_play_card: boolean;
  card_play: Card;
}

export interface Challenge {
  is_challenge: boolean;
}

export interface PointedNotSayUno {
  target: string;
}

export interface SpecialLogic {
  title: string;
}
