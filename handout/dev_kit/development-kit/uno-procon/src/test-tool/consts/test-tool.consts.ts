/**
 * @class TestToolConst
 * @description define test tool constants
 */

export class TestToolConst {
  static readonly DEALER = 'TestDealer';
}


export const TestToolEventExpectedData = {
  "join-room": {
    "player": "Player 1",
    "room_name": "Test Dealer"
  },
  "play-card": {
    "card_play": { "color": "red", "number": 6 }
  },
  "color-of-wild": {
    "color_of_wild": "red"
  },
  "draw-card": {},
  "play-draw-card": {
    "is_play_card": true
  },
  "say-uno-and-play-card": {
    "card_play": { "color": "red", "number": 6 }
  },
  "pointed-not-say-uno": {
    "target": "Player 1"
  },
  "challenge": {
    "is_challenge": true
  },
  "special-logic": {
    "title": 'SpecialLogicTitle'
  }
};
