const { getCardPlayValid, Color, Special } = require('./demo-player');

/** fields card_before */
let cardPlayBefore = {
  color: Color.RED,
  special: Special.WILD_DRAW_4,
  // number: 5,
};

/** cards on the hand of Player */
let cards = [
  {
    color: Color.RED,
    number: 6,
  },
  {
    color: Color.BLUE,
    number: 5,
  },
  {
    color: Color.RED,
    special: Special.DRAW_2,
  },
  {
    color: Color.YELLOW,
    special: Special.DRAW_2,
  },
  {
    color: Color.RED,
    special: Special.SKIP,
  },
  {
    color: Color.YELLOW,
    special: Special.SKIP,
  },
  {
    color: Color.RED,
    special: Special.REVERSE,
  },
  {
    color: Color.YELLOW,
    special: Special.REVERSE,
  },
  {
    color: Color.BLACK,
    special: Special.WILD,
    // number: 6,
  },
  {
    color: Color.BLACK,
    special: Special.WILD_SHUFFLE,
    // number: 6,
  },
  {
    color: Color.BLACK,
    special: Special.WILD_DRAW_4,
    // number: 6,
  },
];

/** fields must_call_draw_card = true/false */
let mustCallDrawCard = true;

let results = getCardPlayValid(cardPlayBefore, cards, mustCallDrawCard);
console.log('cardPlayBefore: ', cardPlayBefore);
console.log(results);

process.exit(0);
