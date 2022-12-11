/**
 * @class AppConst
 * @description define common app constants
 */

export class AppConst {
  static readonly API_PREFIX: string = 'api';
  static readonly API_VERSION: string = 'v1';
  static readonly PAGE_SIZE: number = 20;

  static readonly REDIS_EXPIRE_TIME: number = 24 * 60 * 60 * 1000; // 1h
  // static readonly MAX_PLAYER: number = 4;
  static readonly MIN_PLAYER: number = 2;
  static readonly CARD_DEAL: number = 7;
  static readonly TIMEOUT_DELAY: number = 10;
  static readonly TIMEOUT_OF_PLAYER: number = 5000;
  static readonly MAX_CARD_OF_PLAYER: number = 25;
  static readonly CARD_PUNISH: number = 2;
  static readonly CARD_DRAW_CHALLENGE_SUCCESSFULLY: number = 4;
  static readonly CARD_DRAW_CHALLENGE_FAILED: number = 6;
  static readonly DESK_LENGTH: number = 109;
  static readonly TIME_SHUFFLE: number = 50000;
  static readonly NO_PLAY_MAX_LAP: number = 10;
  static readonly MAX_SPECIAL_LOGIC: number = 10;
  static readonly MAX_NAME_LENGTH: number = 20;
  static readonly MAX_SPLECIAL_LOGIC_NAME_LENGTH: number = 32;

  static readonly COMMON_ID_IS_REQUIRED: string = 'Id is required.';
  static readonly COMMON_ID_INVALID: string = 'Id invalid.';
  static readonly COMMON_DELETE_SUCCESS: string = 'Common delete success.';

  static readonly ROOM_NAME_IS_REQUIRED: string = 'Room name is required.';
  static readonly PLAYER_NAME_IS_REQUIRED: string = 'Player name is required.';
  static readonly PLAYER_NAME_TOO_LONG: string = 'Player name too long.';
  static readonly PLAYER_NAME_INVALID: string = 'Player name invalid.';
  static readonly PLAYER_NAME_DUPLICATE: string = 'Player name duplicate.';
  static readonly MESSAGE_IS_REQUIRED: string = 'Message is required.';
  static readonly COLOR_WILD_IS_REQUIRED: string = 'Color wild is required.';
  static readonly COLOR_WILD_INVALID: string = 'Color wild invalid.';
  static readonly PLAYER_CHOSE_COLOR_OF_WILD_INVALID: string =
    'Player chose color of wild invalid.';
  static readonly CAN_NOT_CHOSE_COLOR_OF_WILD: string = 'Can not chose color of wild.';
  static readonly CAN_NOT_DRAW_CARD_AND_PLAY: string = 'Can not draw card and play.';
  static readonly CAN_NOT_PLAY_CARD: string = 'Can not play card.';
  static readonly CAN_NOT_PLAY_DRAW_CARD: string = 'Can not play draw card.';
  static readonly CAN_NOT_NO_PLAY_CARD: string = 'Can not no play card.';
  static readonly CAN_NOT_CHALLENGE: string = 'Can not challenge.';
  static readonly NEXT_PLAYER_INVALID: string = 'Next player invalid.';
  static readonly CAN_NOT_DRAW_CARD_EXCEED_25: string = 'Can not draw card exceed 25.';
  static readonly CARD_PLAY_IS_REQUIRED: string = 'Card play is required.';
  static readonly PARAM_CARD_PLAY_INVALID: string = 'Param card play invalid.';
  static readonly SPECIAL_CARD_PLAY_INVALID: string = 'Special card play invalid.';
  static readonly COLOR_CARD_PLAY_INVALID: string = 'Color card play invalid.';
  static readonly NUMBER_CARD_PLAY_INVALID: string = 'Number card play invalid.';
  static readonly IS_PLAY_CARD_IS_REQUIED: string = 'Is play card is required.';
  static readonly PARAM_IS_PLAY_CARD_INVALID: string = 'Param is play card invalie.';
  static readonly IS_CHALLENGE_IS_REQUIED: string = 'Is challenge is required.';
  static readonly PARAM_IS_CHALLENGE_INVALID: string = 'Param is challenge invalie.';
  static readonly CARD_PLAY_NOT_EXIST_OF_PLAYER: string = 'Card play not exist of player.';
  static readonly CARD_PLAY_INVALID_WITH_CARD_BEFORE: string =
    'Card play invalid with card before.';
  static readonly CAN_NOT_PLAY_THIS_CARD: string = 'Can not play this card.';
  static readonly CAN_NOT_SAY_UNO_AND_PLAY_CARD: string = 'Can not say uno and play card.';
  static readonly CAN_NOT_POINTED_NOT_SAY_UNO: string = 'Can not pointed not say uno.';
  static readonly DID_NOT_SAY_UNO: string = 'Did not say uno.';
  static readonly ALREADY_CHANGED_COLOR: string = 'Already changed color.';
  static readonly DEALER_NOT_FOUND: string = 'Dealer not found.';
  static readonly STATUS_DEALER_INVALID: string = 'Status dealer invalid.';
  static readonly NAME_DEALER_IS_REQUIRED: string = 'Name dealer is required.';
  static readonly TOTAL_TURN_IS_REQUIRED: string = 'Total turn is required.';
  static readonly DEALER_EXISTS_WITH_SAME_NAME: string = 'Dealer exists with same name.';
  static readonly DEALER_MAX_PLAYER: string = 'Dealer max player. You can not join room.';
  static readonly DEALER_STARTING: string = 'Dealer starting. You can not join room';
  static readonly STATUS_DEALER_INVALID_CAN_NOT_START_DEALER: string =
    'Status dealer invalid. Can not start dealer.';
  // static readonly NUMBER_OF_PLAYER_JOIN_DEALER_INVALID: string = 'Number of player join dealer invalid. Can not start dealer.';
  static readonly NUMBER_OF_PLAYER_JOIN_DEALER_LOWER_TWO: string =
    'Number of player join dealer lower two.';
  // static readonly NUMBER_OF_SOCKET_CLIENT_JOIN_DEALER_INVALID: string = 'Number of socket client join dealer invalid. Can not start dealer.';
  static readonly NUMBER_OF_SOCKET_CLIENT_JOIN_DEALER_LOWER_TWO: string =
    'Number of socket client join dealer lower two.';
  static readonly PARAM_TITLE_INVALID: string = 'Param title invalid.';
  static readonly SPLECIAL_LOGIC_TITLE_TOO_LONG: string = 'Special logic title too long.';
  static readonly RESUTRICT_INTERRUPT: string = 'Interrupts are restricted.';

  static readonly SCORE = {
    '0': 0,
    '1': 1,
    '2': 2,
    '3': 3,
    '4': 4,
    '5': 5,
    '6': 6,
    '7': 7,
    '8': 8,
    '9': 9,
    skip: 20,
    reverse: 20,
    draw_2: 20,
    wild: 50,
    wild_draw_4: 50,
    wild_shuffle: 40,
    white_wild: 40,
  };
}
