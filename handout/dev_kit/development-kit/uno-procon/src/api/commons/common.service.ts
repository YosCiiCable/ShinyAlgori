import { cloneDeep, shuffle } from 'lodash';
import * as BlueBird from 'bluebird';
import * as mongoose from 'mongoose';

import APP_CONFIG from '../../configs/app.config';
import { AppConst } from '../../commons/consts/app.const';
import { AppObject } from '../../commons/consts/app.object';
import { SocketConst } from '../../configs/sockets/socket.const';
import {
  Card,
  Desk,
  Color,
  Special,
  ARR_WILD_SPECIAL,
  StatusGame,
  ARR_SPECIAL,
  ARR_COLOR,
  ARR_NUMBER,
  WhiteWild,
} from '../../commons/consts/app.enum';
import { ActivityService } from '../activity/activity.service';
import { DealerService } from '../dealer/dealer.service';
import { DealerModel } from '../dealer/dealer.model';
import { PlayerService } from '../player/player.service';
import { Environment } from '../../libs/commons';
import { BaseError } from '../../libs/standard';
import redisClient from '../../configs/database/redis.config';

const activityService = new ActivityService();
const dealerService = new DealerService();
const playerService = new PlayerService();

export class CommonService {
  public static async init() {
    console.log(`[LogDebug] init commonService`);
  }

  public static async initDesk(useWhiteWild?: boolean) {
    // const deskString = await redisClient.get(AppObject.REDIS_PREFIX.DESK);
    // let desk = [];
    // if (deskString) {
    //   desk = JSON.parse(deskString);
    //   if (desk.length < AppConst.DESK_LENGTH) {
    //     desk = CommonService.desk(useWhiteWild);
    //   }
    // } else {
    //   desk = CommonService.desk(useWhiteWild);
    // }

    let desk = CommonService.desk(useWhiteWild);
    desk = CommonService.shuffleDesk(desk, AppConst.TIME_SHUFFLE);
    redisClient.set(AppObject.REDIS_PREFIX.DESK, JSON.stringify(desk));

    return desk;
  }

  public static randomByNumber(num: number) {
    return Math.floor(Math.random() * num);
  }

  public static cardColor(num: number) {
    let color;
    if (num % 14 === 13) {
      return Color.BLACK;
    }

    switch (Math.floor(num / 14)) {
      case 0:
      case 4:
        color = Color.RED;
        break;
      case 1:
      case 5:
        color = Color.YELLOW;
        break;
      case 2:
      case 6:
        color = Color.GREEN;
        break;
      case 3:
      case 7:
        color = Color.BLUE;
        break;
    }

    return color;
  }

  public static cardType(num: number) {
    switch (num % 14) {
      case 10: // Skip
        return Special.SKIP;
      case 11: // Reverse
        return Special.REVERSE;
      case 12: // Draw 2
        return Special.DRAW_2;
      case 13: // Wild or Wild Draw 4
        if (Math.floor(num / 14) >= 4) {
          return Special.WILD;
        } else {
          return Special.WILD_DRAW_4;
        }
      default:
        return num % 14;
    }
  }

  public static desk(useWhiteWild?: boolean) {
    const cards: Card[] = [];
    for (let i = 0; i < 112; i++) {
      const color = CommonService.cardColor(i);
      const type = CommonService.cardType(i);
      if (type === 0 && i >= 56) {
        continue;
      }
      const isSpecial: boolean = typeof type === 'string' ? true : false;
      cards.push({
        color: color,
        number: isSpecial ? undefined : Number(type),
        special: isSpecial ? String(type) : undefined,
      });
    }

    // push wild shuffle
    cards.push({
      color: Color.BLACK,
      special: Special.WILD_SHUFFLE,
    });

    // push white wild
    if (useWhiteWild) {
      for (let i = 0; i < 3; i++) {
        cards.push({
          color: Color.WHITE,
          special: Special.WHITE_WILD,
        });
      }
    }

    return cards;
  }

  public static shuffleDesk(cards: Card[], time = AppConst.TIME_SHUFFLE) {
    const len = cards.length; // card length
    for (let i = 0; i < time; i++) {
      const j = CommonService.randomByNumber(len);
      const k = CommonService.randomByNumber(len);
      const tmp = cloneDeep(cards[k]);
      cards[k] = cloneDeep(cards[j]);
      cards[j] = cloneDeep(tmp);
    }

    return cards;
  }

  public static deal(cards: Card[], players: string[]) {
    const len = players.length;
    const mapPlayer = new Map<string, Card[]>();
    for (let i = 0; i < len * AppConst.CARD_DEAL; i++) {
      const card = cards.pop();
      const player = players[i % len];
      const cardsPlayer = mapPlayer.get(player) || [];
      cardsPlayer.push(card);
      mapPlayer.set(player, cardsPlayer);
    }

    return {
      cards,
      mapPlayer,
    };
  }

  public static getFirstCard(cards: Card[]) {
    let isContinue = true;
    let firstCard = cards.pop();

    while (isContinue) {
      if (
        (firstCard.special as Special) !== Special.WILD_DRAW_4 &&
        (firstCard.special as Special) !== Special.WILD_SHUFFLE &&
        (firstCard.special as Special) !== Special.WHITE_WILD
      ) {
        isContinue = false;
        break;
      }
      cards.push(firstCard);
      cards = CommonService.shuffleDesk(cards);
      firstCard = cards.pop();
    }

    return {
      newCards: cards,
      firstCard,
    };
  }

  public static async firstPlayerAction(
    desk: Desk,
    firstCard: Card,
    firstPlayer: string,
    mapPlayerToSocket: Map<string, string>,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { SocketService } = require('../../configs/sockets/socket-io.service');
    switch (firstCard.special as Special) {
      case Special.WILD_SHUFFLE:
      case Special.WILD_DRAW_4:
      case Special.WHITE_WILD: {
        // NOTE Impossible situationa.
        // Reason: Cards that have been eliminated at the time the firstCard is determined.
        break;
      }
      case Special.WILD: {
        const socketIdOfFirstPlayer = mapPlayerToSocket.get(firstPlayer);
        desk.nextPlayer = firstPlayer;
        desk.timeout[firstPlayer] = true;
        await redisClient.set(desk.dealer, JSON.stringify(desk));
        if ((APP_CONFIG.ENV.NAME as Environment) !== Environment.test) {
          const timeout = setTimeout(
            CommonService.timeoutColorOfWild,
            AppConst.TIMEOUT_OF_PLAYER,
            desk.dealer,
            firstPlayer,
          );
          (<any>global)[firstPlayer] = timeout;
        }
        await redisClient.set(desk.dealer, JSON.stringify(desk));
        await SocketService.broadcastChoseColorOfWild(socketIdOfFirstPlayer, firstPlayer);

        // create activity: color-change-request
        activityService.create({
          event: 'color-change-request',
          dealer: desk.dealer,
          player: '',
          turn: desk.turn,
          contents: {
            player: desk.nextPlayer,
            number_turn_play: desk.numberTurnPlay,
          },
        } as any);
        break;
      }
      default: {
        const players = desk.players;
        const len = players.length;
        const beforeCard = desk.beforeCardPlay;
        const indexOfFirstPlayer = players.indexOf(firstPlayer);
        console.log(`[LogDebug] indexOfFirstPlayer: `, indexOfFirstPlayer);
        const turnRight = desk.turnRight;
        let indexNext = turnRight ? 0 : -1;
        if (desk.isSkip) {
          indexNext = turnRight ? 1 : -1;
          desk.isSkip = false;
        }
        let indexOfNextPlayer = (indexOfFirstPlayer + indexNext) % len;
        if (!turnRight) {
          indexOfNextPlayer = (indexOfFirstPlayer + len + indexNext) % len;
        }
        console.log(`[LogDebug] indexOfNextPlayer: `, indexOfNextPlayer);
        const nextPlayer = players[indexOfNextPlayer];

        desk.nextPlayer = nextPlayer;
        desk.timeout[nextPlayer] = true;
        await redisClient.set(desk.dealer, JSON.stringify(desk));

        // set timeout play of player
        if ((APP_CONFIG.ENV.NAME as Environment) !== Environment.test) {
          const timeout = setTimeout(
            CommonService.timeoutPlayer,
            AppConst.TIMEOUT_OF_PLAYER,
            desk.dealer,
            nextPlayer,
          );
          (<any>global)[nextPlayer] = timeout;
        }

        const socketIdOfNextPlayer = mapPlayerToSocket.get(nextPlayer);
        SocketService.broadcastNextPlayer(
          desk,
          socketIdOfNextPlayer,
          nextPlayer,
          beforeCard,
          desk.mustCallDrawCard,
        );

        // create activity: next-player
        activityService.create({
          event: SocketConst.EMIT.NEXT_PLAYER,
          dealer: desk.dealer,
          player: '',
          turn: desk.turn,
          contents: {
            next_player: nextPlayer,
            before_player: desk.beforePlayer,
            card_before: beforeCard,
            card_of_player: desk.cardOfPlayer[nextPlayer],
            turn_right: desk.turnRight,
            must_call_draw_card: String(desk.mustCallDrawCard) === 'true',
            draw_reason: SocketService.getDrawReason(desk, nextPlayer),
            number_card_play: desk.numberCardPlay,
            number_turn_play: desk.numberTurnPlay,
            number_card_of_player: SocketService.getCardCountOfPlayers(desk),
          },
        } as any);

        break;
      }
    }
  }

  public static async preGetNextPlayer(desk: Desk) {
    const players = desk.players;
    const len = players.length;
    const beforePlayer = desk.beforePlayer;
    const beforeCard = desk.beforeCardPlay;
    const indexOfBeforePlayer = players.indexOf(beforePlayer);
    console.log(`[LogDebug] indexOfBeforePlayer: `, indexOfBeforePlayer);
    const turnRight = desk.turnRight;
    let indexNext = turnRight ? 1 : -1;
    if (beforeCard && (beforeCard.special as Special) === Special.SKIP && desk.isSkip) {
      indexNext = turnRight ? 2 : -2;
      desk.isSkip = false;
    }
    let indexOfNextPlayer = (indexOfBeforePlayer + indexNext) % len;
    if (!turnRight) {
      indexOfNextPlayer = (indexOfBeforePlayer + len + indexNext) % len;
    }
    console.log(`[LogDebug] indexOfNextPlayer: `, indexOfNextPlayer);
    const nextPlayer = players[indexOfNextPlayer];

    return {
      nextPlayer,
      beforeCard,
    };
  }

  public static async getNextPlayer(room: string) {
    const deskString = await redisClient.get(room);
    const desk: Desk = JSON.parse(deskString);
    const { nextPlayer, beforeCard } = await CommonService.preGetNextPlayer(desk);
    desk.nextPlayer = nextPlayer;
    desk.timeout[nextPlayer] = true;
    desk.numberTurnPlay++;

    if (desk.activationWhiteWild && desk.activationWhiteWild[nextPlayer] > 0) {
      desk.mustCallDrawCard = true;
    }

    await redisClient.set(room, JSON.stringify(desk));
    await BlueBird.delay(AppConst.TIMEOUT_DELAY);

    // set timeout play of player
    if ((APP_CONFIG.ENV.NAME as Environment) !== Environment.test) {
      const timeout = setTimeout(
        CommonService.timeoutPlayer,
        AppConst.TIMEOUT_OF_PLAYER,
        desk.dealer,
        nextPlayer,
      );
      (<any>global)[nextPlayer] = timeout;
    }

    return {
      nextPlayer,
      beforeCard,
      mustCallDrawCard: desk.mustCallDrawCard,
      numberTurnPlay: desk.numberTurnPlay,
    };
  }

  public static async timeoutPlayer(dealer: string, timeoutPlayer: string) {
    try {
      const deskString = await redisClient.get(dealer);
      const desk: Desk = JSON.parse(deskString);
      if (!desk) {
        return;
      }
      console.log(
        `\n[LogDebug] desk.timeout[${timeoutPlayer}]: `,
        desk.timeout[timeoutPlayer],
        '\n',
      );
      if (desk.timeout[timeoutPlayer]) {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { SocketService } = require('../../configs/sockets/socket-io.service');
        desk.beforePlayer = timeoutPlayer;
        desk.yellUno[timeoutPlayer] = false;
        desk.restrictInterrupt = false;
        desk.timeout[timeoutPlayer] = false;
        clearTimeout((<any>global)[timeoutPlayer]);
        const activationWhiteWild =
          desk.activationWhiteWild && desk.activationWhiteWild[timeoutPlayer] ? 1 : 0; // white wild bind_2
        const cardAddOn = (desk.cardAddOn || activationWhiteWild) + AppConst.CARD_PUNISH;
        const { drawDesk, revealDesk, drawCards } = CommonService.drawCard(desk, cardAddOn);
        desk.drawDesk = drawDesk;
        desk.revealDesk = revealDesk;
        const cardDraws: Card[] = drawCards;
        const socketIdOfTimeoutPlayer = await redisClient.get(
          `${AppObject.REDIS_PREFIX.PLAYER}:${timeoutPlayer}`,
        );
        desk.cardOfPlayer[timeoutPlayer] = desk.cardOfPlayer[timeoutPlayer].concat(cardDraws);
        desk.cardAddOn = 0;
        desk.mustCallDrawCard = false;
        desk.canCallPlayDrawCard = false;
        desk.cardBeforeDrawCard = undefined;
        desk.numberCardPlay++;
        await redisClient.set(desk.dealer, JSON.stringify(desk));
        await BlueBird.delay(AppConst.TIMEOUT_DELAY);
        SocketService.sendCardToPlayer(socketIdOfTimeoutPlayer, timeoutPlayer, cardDraws, true);
        await BlueBird.delay(AppConst.TIMEOUT_DELAY);
        // create activity: penalty
        activityService.create({
          event: 'penalty',
          dealer: dealer,
          player: '',
          turn: desk.turn,
          contents: {
            player: timeoutPlayer,
            cards_receive: cardDraws,
            number_turn_play: desk.numberTurnPlay,
            error: 'timeout',
          },
        } as any);

        // notification next player
        const {
          nextPlayer,
          beforeCard,
          mustCallDrawCard,
          numberTurnPlay,
        } = await CommonService.getNextPlayer(desk.dealer);
        console.log('nextPlayer: ', nextPlayer);
        const socketIdOfNextPlayer = await redisClient.get(
          `${AppObject.REDIS_PREFIX.PLAYER}:${nextPlayer}`,
        );
        if (socketIdOfNextPlayer) {
          SocketService.broadcastNextPlayer(
            desk,
            socketIdOfNextPlayer,
            nextPlayer,
            beforeCard,
            mustCallDrawCard,
          );
          // create activity: next-player
          activityService.create({
            event: SocketConst.EMIT.NEXT_PLAYER,
            dealer: desk.dealer,
            player: '',
            turn: desk.turn,
            contents: {
              next_player: nextPlayer,
              before_player: desk.beforePlayer,
              card_before: beforeCard,
              card_of_player: desk.cardOfPlayer[nextPlayer],
              turn_right: desk.turnRight,
              must_call_draw_card: String(desk.mustCallDrawCard) === 'true',
              draw_reason: SocketService.getDrawReason(desk, nextPlayer),
              number_card_play: desk.numberCardPlay,
              number_turn_play: numberTurnPlay,
              number_card_of_player: SocketService.getCardCountOfPlayers(desk),
            },
          } as any);
        }
        return;
      }
    } catch (error) {
      console.log(`[LogDebug] Error timeoutPlayer: `, error);
    }
  }

  public static async timeoutColorOfWild(dealer: string, timeoutPlayer: string) {
    try {
      const deskString = await redisClient.get(dealer);
      const desk: Desk = JSON.parse(deskString);
      if (!desk) {
        return;
      }
      console.log(
        `\n[LogDebug] timeoutColorOfWild desk.timeout[${timeoutPlayer}]: `,
        desk.timeout[timeoutPlayer],
        '\n',
      );
      if (desk.timeout[timeoutPlayer]) {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { SocketService } = require('../../configs/sockets/socket-io.service');

        // punish more 2 cards
        const { drawDesk, revealDesk, drawCards } = CommonService.drawCard(
          desk,
          AppConst.CARD_PUNISH + desk.cardAddOn,
        );
        desk.drawDesk = drawDesk;
        desk.revealDesk = revealDesk;
        const cardsPunish: Card[] = drawCards;
        desk.cardOfPlayer[timeoutPlayer] = desk.cardOfPlayer[timeoutPlayer].concat(cardsPunish);
        if ((desk.beforeCardPlay.special as Special) === Special.WILD_DRAW_4) {
          desk.cardAddOn += 4;
          desk.mustCallDrawCard = true;
        } else {
          desk.cardAddOn = 0;
          desk.mustCallDrawCard = false;
        }
        desk.beforePlayer = timeoutPlayer;
        const beforeCardPlay = {
          ...desk.beforeCardPlay,
          color: desk.colorBeforeWild,
        };
        desk.beforeCardPlay = beforeCardPlay;
        desk.noPlayCount = 0;
        desk.numberCardPlay++;
        desk.yellUno[timeoutPlayer] = false;
        desk.restrictInterrupt = false;
        desk.timeout[timeoutPlayer] = false;
        clearTimeout((<any>global)[timeoutPlayer]);
        await redisClient.set(desk.dealer, JSON.stringify(desk));

        const socketIdOfTimeoutPlayer = await redisClient.get(
          `${AppObject.REDIS_PREFIX.PLAYER}:${timeoutPlayer}`,
        );
        SocketService.sendCardToPlayer(socketIdOfTimeoutPlayer, timeoutPlayer, cardsPunish, true);
        await BlueBird.delay(AppConst.TIMEOUT_DELAY);
        // create activity: penalty
        activityService.create({
          event: 'penalty',
          dealer: dealer,
          player: '',
          turn: desk.turn,
          contents: {
            player: timeoutPlayer,
            cards_receive: cardsPunish,
            number_turn_play: desk.numberTurnPlay,
            error: 'color-of-wild timeout',
          },
        } as any);

        // notification next player
        const {
          nextPlayer,
          beforeCard,
          mustCallDrawCard,
          numberTurnPlay,
        } = await CommonService.getNextPlayer(desk.dealer);
        if ((APP_CONFIG.ENV.NAME as Environment) !== Environment.test) {
          const timeout = setTimeout(
            CommonService.timeoutColorOfWild,
            AppConst.TIMEOUT_OF_PLAYER,
            dealer,
            nextPlayer,
          );
          (<any>global)[nextPlayer] = timeout;
        }

        // create activity: next-player
        activityService.create({
          event: SocketConst.EMIT.NEXT_PLAYER,
          dealer: desk.dealer,
          player: '',
          turn: desk.turn,
          contents: {
            next_player: nextPlayer,
            before_player: desk.beforePlayer,
            card_before: beforeCard,
            card_of_player: desk.cardOfPlayer[nextPlayer],
            turn_right: desk.turnRight,
            must_call_draw_card: String(mustCallDrawCard) === 'true',
            draw_reason: SocketService.getDrawReason(desk, nextPlayer),
            number_card_play: desk.numberCardPlay,
            number_turn_play: numberTurnPlay,
            number_card_of_player: SocketService.getCardCountOfPlayers(desk),
          },
        } as any);

        const socketIdOfNextPlayer = await redisClient.get(
          `${AppObject.REDIS_PREFIX.PLAYER}:${nextPlayer}`,
        );

        SocketService.broadcastNextPlayer(
          desk,
          socketIdOfNextPlayer,
          nextPlayer,
          beforeCard,
          desk.mustCallDrawCard,
        );
        return;
      }
    } catch (error) {
      console.log(`[LogDebug] Error timeoutColorOfWild: `, error);
    }
  }

  public static getNextPlayerWithPlayers(
    beforePlayer: string,
    players: string[],
    turnRight: boolean,
  ) {
    const len = players.length;
    const indexOfBeforePlayer = players.indexOf(beforePlayer);
    console.log(`[LogDebug] indexOfBeforePlayer: `, indexOfBeforePlayer);
    const indexNext = turnRight ? 1 : -1;
    let indexOfNextPlayer = (indexOfBeforePlayer + indexNext) % len;
    if (!turnRight) {
      indexOfNextPlayer = (indexOfBeforePlayer + len + indexNext) % len;
    }
    console.log(`[LogDebug] indexOfNextPlayer: `, indexOfNextPlayer);
    const nextPlayer = players[indexOfNextPlayer];
    return nextPlayer;
  }

  public static getSortedPlayer(nextPlayer: string, players: string[], turnRight: boolean) {
    const clonedPlayers = cloneDeep(players);
    const remainingPlayers = clonedPlayers.filter((item) => item !== nextPlayer);
    const sortedPlayers = [nextPlayer];
    remainingPlayers.forEach(() => {
      nextPlayer = CommonService.getNextPlayerWithPlayers(nextPlayer, clonedPlayers, turnRight);
      sortedPlayers.push(nextPlayer);
    });
    return sortedPlayers;
  }

  public static drawCard(desk: Desk, count: number) {
    let { drawDesk, revealDesk } = cloneDeep(desk);
    const drawCards: Card[] = [];
    for (let i = 0; i < count; i++) {
      if (drawDesk.length === 0) {
        const front = revealDesk.pop();
        drawDesk = CommonService.shuffleDesk(revealDesk);
        revealDesk = cloneDeep([front]);
      }
      const card = drawDesk.pop();
      if (card) {
        drawCards.push(card);
      }
    }

    return {
      drawDesk,
      revealDesk,
      drawCards,
    };
  }

  public static async shuffleWild(desk: Desk, ignorePlayer?: string) {
    const { nextPlayer } = await CommonService.preGetNextPlayer(desk);
    const playersReceiveCard = cloneDeep(desk.players);
    console.log('[LogDebug] CommonService.shuffleDesk playersReceiveCard: ', playersReceiveCard);
    const playersSorted = CommonService.getSortedPlayer(
      nextPlayer,
      playersReceiveCard,
      desk.turnRight,
    ).filter((player) => player !== ignorePlayer);
    console.log('[LogDebug] CommonService.shuffleDesk playersSorted: ', playersSorted);

    let cardsShuffle: Card[] = [];
    for (const player of playersReceiveCard) {
      if (player === ignorePlayer) {
        continue;
      }

      const cardsPlayer = cloneDeep(desk.cardOfPlayer[player]);
      cardsShuffle = cardsShuffle.concat(cardsPlayer);
      desk.cardOfPlayer[player] = [];
    }
    cardsShuffle = CommonService.shuffleDesk(cardsShuffle);
    const len = playersSorted.length;
    const loopCnt = cardsShuffle.length;
    for (let i = 0; i < loopCnt; i++) {
      const card = cardsShuffle.pop();
      const player = playersSorted[i % len];
      console.log('[LogDebug] CommonService.shuffleDesk player: ', player);
      desk.cardOfPlayer[player].push(card);
    }

    return {
      desk,
      playersReceiveCard,
    };
  }

  public static isChallengeSuccessfully(card: Card, cardArrValidate: Card[]) {
    console.log(card);
    console.log(cardArrValidate);
    let isCan = false;
    for (const cardValidate of cardArrValidate) {
      if (
        (cardValidate.special as Special) === Special.WILD ||
        (cardValidate.special as Special) === Special.WILD_SHUFFLE
      ) {
        isCan = true;
        break;
      }
      if ((cardValidate.color as Color) === (card.color as Color)) {
        isCan = true;
        break;
      }
      if (
        card.special &&
        [Special.DRAW_2, Special.REVERSE, Special.SKIP].indexOf(card.special as Special) > -1 &&
        (card.special as Special) === (cardValidate.special as Special)
      ) {
        isCan = true;
        break;
      }
      if (
        (cardValidate.number || Number(cardValidate.number) === 0) &&
        (cardValidate.number as Number) === (card.number as Number)
      ) {
        isCan = true;
        break;
      }
    }

    return isCan;
  }

  public static checkNextPlayer(player, nextPlayer) {
    return player === nextPlayer;
  }

  public static validateCardOfPlayer(cardPlay: Card, cardsOfPlayer: Card[]) {
    console.log(`[LogDebug] cardPlay: `, cardPlay);
    console.log(`[LogDebug] cardOfPlayer: `, cardsOfPlayer);
    let isExist = false;
    for (const cardValidate of cardsOfPlayer) {
      if (cardPlay.special) {
        if (
          (cardPlay.color as Color) === (cardValidate.color as Color) &&
          (cardPlay.special as Special) === (cardValidate.special as Special)
        ) {
          isExist = true;
          break;
        }
      } else {
        if (
          (cardPlay.color as Color) === (cardValidate.color as Color) &&
          Number(cardPlay.number) === Number(cardValidate.number)
        ) {
          isExist = true;
          break;
        }
      }
    }

    return isExist;
  }

  public static canContinue(dealer, socketIds) {
    return socketIds.length < AppConst.MIN_PLAYER;
  }

  public static hasValidateError(cardPlay) {
    if (!cardPlay) {
      return new BaseError({ message: AppConst.CARD_PLAY_IS_REQUIRED });
    } else if (!cardPlay.number && cardPlay.number !== 0 && !cardPlay.special) {
      return new BaseError({ message: AppConst.PARAM_CARD_PLAY_INVALID });
    } else if (cardPlay.special && ARR_SPECIAL.indexOf(cardPlay.special as Special) === -1) {
      return new BaseError({ message: AppConst.SPECIAL_CARD_PLAY_INVALID });
    } else if (cardPlay.color && ARR_COLOR.indexOf(cardPlay.color as Color) === -1) {
      return new BaseError({ message: AppConst.COLOR_CARD_PLAY_INVALID });
    } else if (
      (cardPlay.number || cardPlay.number === 0) &&
      ARR_NUMBER.indexOf(cardPlay.number) === -1
    ) {
      return new BaseError({ message: AppConst.NUMBER_CARD_PLAY_INVALID });
    }

    return;
  }

  public static isAvailableCard(cardPlay: Card, cardBefore: Card, cardAddOn: number) {
    let isValid = false;
    if (cardAddOn > 0) {
      return isValid;
    }
    if (ARR_WILD_SPECIAL.indexOf(cardPlay.special as Special) > -1) {
      isValid = true;
    } else if (cardPlay.special === Special.WHITE_WILD) {
      isValid = true;
    } else if (
      cardPlay.special &&
      (cardPlay.special as Special) === (cardBefore.special as Special)
    ) {
      isValid = true;
    } else if ((cardPlay.color as Color) === (cardBefore.color as Color)) {
      isValid = true;
    } else if (
      (cardPlay.number || Number(cardPlay.number) === 0) &&
      Number(cardPlay.number) === Number(cardBefore.number)
    ) {
      isValid = true;
    }

    return isValid;
  }

  public static removeCardOfPlayer(cardPlay: Card, cardsOfPlayer: Card[]) {
    let isRemove = false;
    const newCardsOfPlayer: Card[] = [];
    for (const cardValidate of cardsOfPlayer) {
      if (isRemove) {
        newCardsOfPlayer.push(cardValidate);
        continue;
      } else if (cardPlay.special) {
        if (
          (cardPlay.color as Color) === (cardValidate.color as Color) &&
          (cardPlay.special as Special) === (cardValidate.special as Special)
        ) {
          isRemove = true;
          continue;
        } else {
          newCardsOfPlayer.push(cardValidate);
          continue;
        }
      } else {
        if (
          (cardPlay.color as Color) === (cardValidate.color as Color) &&
          Number(cardPlay.number) === Number(cardValidate.number)
        ) {
          isRemove = true;
          continue;
        } else {
          newCardsOfPlayer.push(cardValidate);
          continue;
        }
      }
    }

    return newCardsOfPlayer;
  }

  public static isTurnEnd(desk: Desk, player: string, cardPlay?: Card, isColorOfWild?: boolean) {
    const cards = desk.cardOfPlayer[player];
    if (cardPlay) {
      if (ARR_WILD_SPECIAL.indexOf(cardPlay.special as Special) >= 0) {
        return false;
      }

      if (cardPlay.special === Special.WHITE_WILD) {
        switch (desk.whiteWild) {
          case WhiteWild.BIND_2:
            return cards.length === 0;
          default:
            return cards.length === 0;
        }
      }

      return cards.length === 0;
    } else if (isColorOfWild) {
      return cards.length === 0;
    }

    return false;
  }

  // Calculator get winner
  public static async calculateWinnerOfGame(desk: Desk) {
    const ranking = Object.keys(desk.score)
      .map((player) => {
        return { player, score: desk.score[player] };
      })
      .sort((a, b) => {
        return b.score - a.score;
      });

    const winScore = ranking[0].score;
    const winners = ranking.filter((data) => data.score >= winScore);
    if (winners.length === 1) {
      return winners[0].player;
    } else {
      const histories = {};
      for (const data of winners) {
        const playerFound = await playerService.detailById(data.player);
        const history = playerFound.score[desk.dealer];
        const list = [];
        history.reduce((sum, score, i) => {
          if (i === 0) {
            list.push(score);
            return score;
          }

          const result = sum + score;
          list.push(result);

          return result;
        }, 0);
        const index = list.findIndex((sum) => {
          return sum >= winScore;
        });
        histories[data.player] = index;
      }

      return Object.keys(histories).sort((a, b) => histories[a] - histories[b])[0];
    }
  }

  public static async calculateScoreOfPlayerFinishTurn(desk: Desk, winPlayer?: string) {
    const order = cloneDeep(desk.order);
    const score = cloneDeep(desk.score);
    const players: string[] = desk.players || [];
    let winner: string;
    const losers: string[] = [];
    const scoreOfLoser = {};
    let scoreOfWinner = 0;
    for (const player of players) {
      const cardOfPlayer = desk.cardOfPlayer[player];
      if (winPlayer && cardOfPlayer.length === 0) {
        winner = player;
      } else {
        scoreOfLoser[player] = 0;
        losers.push(player);
      }
    }
    for (const loser of losers) {
      const cardOfPlayer = desk.cardOfPlayer[loser];
      for (const card of cardOfPlayer) {
        if (card.special) {
          scoreOfLoser[loser] -= AppConst.SCORE[card.special];
        } else {
          scoreOfLoser[loser] -= AppConst.SCORE[card.number];
        }
      }
      scoreOfWinner = scoreOfWinner + -scoreOfLoser[loser];
    }

    if (winPlayer) {
      order[winner]++;
    }
    for (const player of players) {
      if (player === winner) {
        score[player] += scoreOfWinner;
      } else {
        score[player] += scoreOfLoser[player];
      }
    }
    desk.order = Object.keys(order)
      .sort((a, b) => order[b] - order[a])
      .reduce(
        (_obj, key) => ({
          ..._obj,
          [key]: order[key],
        }),
        {},
      );
    desk.score = Object.keys(score)
      .sort((a, b) => score[b] - score[a])
      .reduce(
        (_obj, key) => ({
          ..._obj,
          [key]: score[key],
        }),
        {},
      );

    for (const player of players) {
      const playerFound = await playerService.detailById(player);
      if (playerFound) {
        if (!playerFound.score) {
          playerFound.score = {};
        }
        if (!playerFound.score[desk.dealer]) {
          playerFound.score[desk.dealer] = [];
        }
        const currentTurnScore = winner === player ? scoreOfWinner : scoreOfLoser[player];
        playerFound.score[desk.dealer].push(currentTurnScore);
        playerFound.markModified(`score.${desk.dealer}`);
        await playerFound.save();
      }
    }

    const currentTrunResult = {
      ...scoreOfLoser,
    };

    if (winner) {
      currentTrunResult[winner] = scoreOfWinner;
    }

    return { score: currentTrunResult };
  }

  public static async storeScoreOfPlayerFinishGame(desk: Desk) {
    const score = desk.score;
    const players: string[] = desk.players || [];
    for (const player of players) {
      const playerFound = await playerService.detailById(player);
      if (playerFound) {
        playerFound.total_score = playerFound.total_score || 0;
        playerFound.total_score += score[player];
        await playerFound.save();
      }
    }
  }

  public static handleError(err, callback) {
    if (callback instanceof Object) {
      callback(err, undefined);
    }
    if ((APP_CONFIG.ENV.NAME as Environment) !== Environment.test) {
      console.log(err);
    }
  }

  public static async startDealer(dealerName: string, dealer: DealerModel, isFirstStart: boolean) {
    if (!dealer) {
      dealer = await dealerService.detailByCondition({ name: dealerName });
    }
    const players = shuffle(dealer.players) || [];
    // if (players.length !== AppConst.MAX_PLAYER) {
    //   throw new BaseError({ message: AppConst.NUMBER_OF_PLAYER_JOIN_DEALER_INVALID });
    // }
    if (players.length < AppConst.MIN_PLAYER) {
      throw new BaseError({ message: AppConst.NUMBER_OF_PLAYER_JOIN_DEALER_LOWER_TWO });
    }

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { SocketService } = require('../../configs/sockets/socket-io.service');
    const socketIds: string[] = await SocketService.getAllClientOfRoom(dealer.name);
    // if (socketIds.length !== AppConst.MAX_PLAYER) {
    //   throw new BaseError({ message: AppConst.NUMBER_OF_SOCKET_CLIENT_JOIN_DEALER_INVALID });
    // }
    if (socketIds.length < AppConst.MIN_PLAYER) {
      throw new BaseError({ message: AppConst.NUMBER_OF_SOCKET_CLIENT_JOIN_DEALER_LOWER_TWO });
    }

    // validate socketId
    const mapPlayerToSocket = new Map<string, string>();
    for (const player of players) {
      const socketId = await redisClient.get(`${AppObject.REDIS_PREFIX.PLAYER}:${player}`);
      if (!socketId) {
        throw new BaseError({ message: `Can not get socket id of player ${player}.` });
      } else if (socketIds.indexOf(socketId) === -1) {
        throw new BaseError({ message: `Socket id ${socketId} don't member room ${dealer.name}.` });
      }
      mapPlayerToSocket.set(player, socketId);
    }

    const desk = await CommonService.initDesk(!!dealer.whiteWild);
    console.log('[LogDebug] whiteWild: ', dealer.whiteWild);
    const { cards, mapPlayer } = CommonService.deal(desk, players);

    // send cards to all players
    const cardOfPlayer: any = {};
    const yellUno: any = {};
    const timeout: any = {};
    for (const player of players) {
      const socketId = mapPlayerToSocket.get(player);
      const cards = mapPlayer.get(player);
      SocketService.sendCardToPlayer(socketId, player, cards);

      cardOfPlayer[player] = cards;
      yellUno[player] = false;
      timeout[player] = false;
    }

    let deskInfo: Desk = JSON.parse(await redisClient.get(dealer.name));
    const turn = isFirstStart ? 1 : deskInfo.turn + 1;
    // create activity: receiver_card
    activityService.create(
      {
        event: SocketConst.EMIT.RECEIVER_CARD,
        dealer: dealer.name,
        player: '',
        turn,
        contents: cardOfPlayer,
      } as any,
      false,
    );
    await BlueBird.delay(AppConst.TIMEOUT_DELAY);

    let order: any = {};
    let score: any = {};
    const firstPlayer = players[0];
    if (isFirstStart) {
      for (const player of players) {
        order[player] = 0;
        score[player] = 0;
      }
    } else {
      order = deskInfo.order;
      score = deskInfo.score;
    }

    // broadcast first player
    const { newCards, firstCard } = CommonService.getFirstCard(cards);
    console.log('[LogDebug] isFirstStart: ', isFirstStart);
    console.log(`[LogDebug] Start turn ${turn}`);
    console.log('[LogDebug] firstPlayer: ', firstPlayer);
    console.log('[LogDebug] firstCard: ', firstCard);
    SocketService.broadcastFirstPlayer(
      dealer.name,
      firstPlayer,
      firstCard,
      players,
      dealer.totalTurn,
      dealer.whiteWild,
    );
    // create activity: first-player
    activityService.create({
      event: SocketConst.EMIT.FIRST_PLAYER,
      dealer: dealer.name,
      player: '',
      turn,
      contents: {
        white_wild: dealer.whiteWild,
        first_player: firstPlayer,
        first_card: firstCard,
        play_order: players,
        cards_receive: cardOfPlayer,
      },
    } as any);
    await BlueBird.delay(AppConst.TIMEOUT_DELAY);

    let cardAddOn = 0;
    let mustCallDrawCard = false;
    if ((firstCard.special as Special) === Special.DRAW_2) {
      cardAddOn = 2;
      mustCallDrawCard = true;
    }
    let isSkip = false;
    if ((firstCard.special as Special) === Special.SKIP) {
      isSkip = true;
    }
    deskInfo = {
      dealer: dealer.name,
      players,
      status: dealer.status,
      drawDesk: newCards,
      revealDesk: [firstCard],
      turn,
      totalTurn: dealer.totalTurn,
      firstPlayer,
      beforePlayer: firstPlayer,
      nextPlayer: null,
      turnRight: true,
      cardOfPlayer,
      cardAddOn,
      canCallPlayDrawCard: false,
      mustCallDrawCard,
      beforeCardPlay: firstCard,
      whiteWild: dealer.whiteWild,
      activationWhiteWild: {},
      order,
      score,
      yellUno,
      timeout,
      isSkip,
      numberTurnPlay: 1,
      numberCardPlay: 1,
      noPlayCount: 0,
      specialLogic: {},
      restrictInterrupt: false,
    };

    if ((firstCard.special as Special) === Special.REVERSE) {
      deskInfo.turnRight = !deskInfo.turnRight;
    }
    if ((firstCard.special as Special) === Special.SKIP) {
      deskInfo.isSkip = true;
    }
    await redisClient.set(dealer.name, JSON.stringify(deskInfo));

    // notification next player
    await CommonService.firstPlayerAction(deskInfo, firstCard, firstPlayer, mapPlayerToSocket);

    dealer.status = StatusGame.STARTING;
    await dealer.save();

    return JSON.parse(await redisClient.get(dealer.name));
  }

  //#region function support test
  public static async resetDb() {
    await redisClient.flushdb();
    return mongoose.connection.dropDatabase();
  }

  public static async setDesk(data: {
    dealer: string;
    players: string[];
    totalTurn: number;
    turn: number;
    beforePlayer: string;
    nextPlayer: string;
    firstPlayer?: string;
    beforeCardPlay: Card;
    cardOfPlayer: Card[];
    cardAddOn: number;
    yellUno: boolean;
    cardBeforeWildDraw4?: Card;
    colorBeforeWild?: Color | string;
    turnRight?: boolean;
    isSkip?: boolean;
    mustCallDrawCard?: boolean;
    canCallPlayDrawCard?: boolean;
    cardBeforeDrawCard?: Card;
    whiteWild?: WhiteWild;
    activationWhiteWild?: {
      [key: string]: number;
    };
    noPlayCount?: number;
    specialLogic?: {
      [key: string]: number;
    };
    score?: {
      [key: string]: number;
    };
    numberTurnPlay?: number;
    drawDesk?: Card[];
    revealDesk?: Card[];
    timeout?: {
      [key: string]: boolean;
    };
    restrictInterrupt?: boolean;
  }) {
    const desk: Desk = JSON.parse(await redisClient.get(data.dealer));
    desk.players = data.players;
    if (data.beforePlayer) {
      desk.beforePlayer = data.beforePlayer;
    }
    if (data.totalTurn) {
      desk.totalTurn = data.totalTurn;
    }
    if (data.turn) {
      desk.turn = data.turn;
    }
    if (data.firstPlayer) {
      desk.firstPlayer = data.firstPlayer;
    }
    if (data.nextPlayer) {
      desk.nextPlayer = data.nextPlayer;
    }
    if (data.beforeCardPlay) {
      desk.beforeCardPlay = data.beforeCardPlay;
    }
    if (data.cardOfPlayer) {
      desk.cardOfPlayer[data.nextPlayer] = data.cardOfPlayer;
    }
    if (data.cardAddOn || data.cardAddOn === 0) {
      desk.cardAddOn = data.cardAddOn;
    }
    if (
      String(data.yellUno) === AppObject.BOOLEAN.TRUE ||
      String(data.yellUno) === AppObject.BOOLEAN.FALSE
    ) {
      desk.yellUno[data.nextPlayer] = data.yellUno;
    }
    if (
      String(data.turnRight) === AppObject.BOOLEAN.TRUE ||
      String(data.turnRight) === AppObject.BOOLEAN.FALSE
    ) {
      desk.turnRight = data.turnRight;
    }
    if (
      String(data.isSkip) === AppObject.BOOLEAN.TRUE ||
      String(data.isSkip) === AppObject.BOOLEAN.FALSE
    ) {
      desk.isSkip = data.isSkip;
    }
    if (
      String(data.mustCallDrawCard) === AppObject.BOOLEAN.TRUE ||
      String(data.mustCallDrawCard) === AppObject.BOOLEAN.FALSE
    ) {
      desk.mustCallDrawCard = data.mustCallDrawCard;
    } else {
      desk.mustCallDrawCard = false;
    }

    if (
      String(data.canCallPlayDrawCard) === AppObject.BOOLEAN.TRUE ||
      String(data.canCallPlayDrawCard) === AppObject.BOOLEAN.FALSE
    ) {
      desk.canCallPlayDrawCard = data.canCallPlayDrawCard;
    }
    if (data.cardBeforeDrawCard) {
      desk.cardBeforeDrawCard = data.cardBeforeDrawCard;
    }

    if (data.whiteWild) {
      desk.whiteWild = data.whiteWild;
    }
    if (data.activationWhiteWild) {
      desk.activationWhiteWild = data.activationWhiteWild;
    } else {
      desk.activationWhiteWild = undefined;
    }

    desk.cardBeforeWildDraw4 = data.cardBeforeWildDraw4;
    desk.noPlayCount = data.noPlayCount || 0;
    desk.specialLogic = data.specialLogic || {};
    desk.score = data.score || {};
    desk.numberTurnPlay = data.numberTurnPlay || desk.numberTurnPlay || 1;
    desk.colorBeforeWild = data.colorBeforeWild || undefined;
    desk.timeout = data.timeout || {};
    desk.restrictInterrupt = data.restrictInterrupt || false;

    await redisClient.set(data.dealer, JSON.stringify(desk));

    return desk;
  }

  public static async pushCardToDesk(dealer: string, cards: Card[]) {
    const desk: Desk = JSON.parse(await redisClient.get(dealer));
    for (const card of cards) {
      desk.drawDesk.push(card);
    }

    await redisClient.set(dealer, JSON.stringify(desk));
    return desk;
  }

  public static async setCardOfDesk(dealer: string) {
    const desk: Desk = JSON.parse(await redisClient.get(dealer));
    desk.drawDesk = CommonService.desk();
    desk.revealDesk = [];
    await redisClient.set(dealer, JSON.stringify(desk));
    return desk;
  }

  public static async setOrderOfDesk(
    dealer: string,
    turn: number,
    order: {
      [key: string]: number;
    },
  ) {
    const desk: Desk = JSON.parse(await redisClient.get(dealer));
    if (turn) {
      desk.turn = turn;
    }
    if (order) {
      desk.order = order;
    }

    await redisClient.set(dealer, JSON.stringify(desk));
    return desk;
  }

  public static async setCardOfPlayer(dealer: string, player: string, cards: Card[]) {
    const desk: Desk = JSON.parse(await redisClient.get(dealer));
    desk.cardOfPlayer[player] = cards;
    await redisClient.set(dealer, JSON.stringify(desk));
    return desk;
  }

  public static async getDesk(dealer: string) {
    return JSON.parse(await redisClient.get(dealer));
  }
  //#endregion
}
