/**
 * @description config socket.io
 * @ref https://socket.io/docs/emit-cheatsheet/
 */
import { uniq, remove, cloneDeep } from 'lodash';
import * as redisAdapter from 'socket.io-redis';
import * as BlueBird from 'bluebird';
import APP_CONFIG from '../app.config';
import { AppConst } from '../../commons/consts/app.const';
import { AppObject } from '../../commons/consts/app.object';
import {
  Desk,
  Color,
  StatusGame,
  ARR_COLOR_OF_WILD,
  ARR_WILD_SPECIAL,
  Special,
  Card,
} from '../../commons/consts/app.enum';
import {
  SocketConst,
  JoinRoom,
  ColorOfWild,
  SayUnoAndPlayCard,
  PlayCard,
  Challenge,
  PointedNotSayUno,
  PlayDrawCard,
  SpecialLogic,
} from './socket.const';
import { SocketService } from './socket-io.service';
import redisClient from '../database/redis.config';
import { DealerService } from '../../api/dealer/dealer.service';
import { CommonService } from '../../api/commons/common.service';
import { PlayerService } from '../../api/player/player.service';
import { ActivityService } from '../../api/activity/activity.service';
import { Environment } from '../../libs/commons';
import { BaseError } from '../../libs/standard';
import { WhiteWild } from '../../commons/consts/app.enum';

SocketService.io.adapter(
  redisAdapter({
    host: APP_CONFIG.ENV.DATABASE.REDIS.HOST,
    port: APP_CONFIG.ENV.DATABASE.REDIS.PORT,
  }),
);
const socketServer = SocketService.io.of('/');
socketServer.use(SocketService.handlePlayer);

const dealerService = new DealerService();
const playerService = new PlayerService();
const activityService = new ActivityService();

type CallbackWithData<T> = (err: any, data: T) => void;

async function nextPlayerAction(
  desk: Desk,
  dealer: string,
  isChallenge?: boolean,
  isChallengeSuccessfully?: boolean,
) {
  let nextPlayer: string, beforeCard: Card, mustCallDrawCard: boolean, numberTurnPlay: number;
  if (isChallenge === undefined) {
    const nextPlayerInfo = await CommonService.getNextPlayer(dealer);
    nextPlayer = nextPlayerInfo.nextPlayer;
    beforeCard = nextPlayerInfo.beforeCard;
    mustCallDrawCard = nextPlayerInfo.mustCallDrawCard;
    numberTurnPlay = nextPlayerInfo.numberTurnPlay;
  } else {
    if (isChallenge) {
      if (isChallengeSuccessfully) {
        nextPlayer = desk.nextPlayer;
        beforeCard = desk.beforeCardPlay;
        mustCallDrawCard = desk.mustCallDrawCard;
        numberTurnPlay = desk.numberTurnPlay;
        await redisClient.set(dealer, JSON.stringify(desk));
      } else {
        const nextPlayerInfo = await CommonService.getNextPlayer(dealer);
        nextPlayer = nextPlayerInfo.nextPlayer;
        beforeCard = nextPlayerInfo.beforeCard;
        mustCallDrawCard = nextPlayerInfo.mustCallDrawCard;
        numberTurnPlay = nextPlayerInfo.numberTurnPlay;
      }
    } else {
      return;
    }
  }

  const socketIdOfNextPlayer = await redisClient.get(
    `${AppObject.REDIS_PREFIX.PLAYER}:${nextPlayer}`,
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
      must_call_draw_card: String(mustCallDrawCard) === 'true',
      draw_reason: SocketService.getDrawReason(desk, nextPlayer),
      number_card_play: desk.numberCardPlay,
      number_turn_play: numberTurnPlay,
      number_card_of_player: SocketService.getCardCountOfPlayers(desk),
    },
  } as any);

  SocketService.broadcastNextPlayer(
    desk,
    socketIdOfNextPlayer,
    nextPlayer,
    beforeCard,
    mustCallDrawCard,
  );

  return;
}

async function playCardAction(
  socket: SocketIO.Socket,
  dealer: string,
  desk: Desk,
  player: string,
  cardPlay: Card,
  beforeCardPlay: Card,
) {
  console.log(`[LogDebug] turn: ${desk.turn}, numberTurnPlay: ${desk.numberTurnPlay}`);
  switch (cardPlay.special as Special) {
    case Special.WILD_SHUFFLE: {
      const ignorePlayer = !desk.cardOfPlayer[player].length ? player : null;
      const shuffleWildData = await CommonService.shuffleWild(desk, ignorePlayer);
      const playersReceiveCard = shuffleWildData.playersReceiveCard;
      desk = shuffleWildData.desk;
      desk.cardAddOn = 0;
      desk.restrictInterrupt = true;
      // deal card to player again
      for (const player of playersReceiveCard) {
        const socketId = await redisClient.get(`${AppObject.REDIS_PREFIX.PLAYER}:${player}`);
        const cardsOfPlayer = desk.cardOfPlayer[player];
        SocketService.sendCardShuffleWild(socketId, player, cardsOfPlayer);
      }
      // create activity: shuffle-wild
      activityService.create({
        event: SocketConst.EMIT.SHUFFLE_WILD,
        dealer,
        player: '',
        turn: desk.turn,
        contents: {
          player,
          cards_receive: desk.cardOfPlayer,
          number_turn_play: desk.numberTurnPlay,
        },
      } as any);

      desk.timeout[player] = true;
      await redisClient.set(dealer, JSON.stringify(desk));
      if ((APP_CONFIG.ENV.NAME as Environment) !== Environment.test) {
        const timeout = setTimeout(
          CommonService.timeoutColorOfWild,
          AppConst.TIMEOUT_OF_PLAYER,
          dealer,
          player,
        );
        (<any>global)[player] = timeout;
      }
      await SocketService.broadcastChoseColorOfWild(socket.id, player);
      // create activity: color-change-request
      activityService.create({
        event: 'color-change-request',
        dealer: desk.dealer,
        player: '',
        turn: desk.turn,
        contents: {
          player,
          number_turn_play: desk.numberTurnPlay,
        },
      } as any);
      break;
    }
    case Special.WILD:
    case Special.WILD_DRAW_4: {
      if ((cardPlay.special as Special) === Special.WILD_DRAW_4) {
        desk.cardBeforeWildDraw4 = beforeCardPlay;
      }
      desk.restrictInterrupt = true;
      desk.timeout[player] = true;
      await redisClient.set(dealer, JSON.stringify(desk));
      if ((APP_CONFIG.ENV.NAME as Environment) !== Environment.test) {
        const timeout = setTimeout(
          CommonService.timeoutColorOfWild,
          AppConst.TIMEOUT_OF_PLAYER,
          dealer,
          player,
        );
        (<any>global)[player] = timeout;
      }
      await redisClient.set(dealer, JSON.stringify(desk));
      await SocketService.broadcastChoseColorOfWild(socket.id, player);
      // create activity: color-change-request
      activityService.create({
        event: 'color-change-request',
        dealer: desk.dealer,
        player: '',
        turn: desk.turn,
        contents: {
          player,
          number_turn_play: desk.numberTurnPlay,
        },
      } as any);
      break;
    }
    case Special.WHITE_WILD: {
      if (desk.whiteWild === WhiteWild.BIND_2) {
        const anticipation = await CommonService.preGetNextPlayer(desk);
        desk.mustCallDrawCard = true;
        if (!desk.activationWhiteWild) {
          desk.activationWhiteWild = {};
        }
        desk.activationWhiteWild[anticipation.nextPlayer] =
          (desk.activationWhiteWild[anticipation.nextPlayer] || 0) + 2;
        desk.beforeCardPlay = {
          ...desk.beforeCardPlay,
          color: beforeCardPlay.color,
        };
        await redisClient.set(dealer, JSON.stringify(desk));
        await BlueBird.delay(AppConst.TIMEOUT_DELAY);
      }
      break;
    }
    default: {
      if ((cardPlay.special as Special) === Special.DRAW_2) {
        desk.cardAddOn += 2;
        desk.mustCallDrawCard = true;
      }
      if ((cardPlay.special as Special) === Special.REVERSE) {
        desk.turnRight = !desk.turnRight;
      }
      if ((cardPlay.special as Special) === Special.SKIP) {
        desk.isSkip = true;
      }
      await redisClient.set(dealer, JSON.stringify(desk));
    }
  }
}

async function turnEnd(desk: Desk, dealer: string, winPlayer?: string) {
  console.log(
    `[LogDebug] Finish turn ${desk.turn}. winner: ${winPlayer || null}. lastCard: ${JSON.stringify(
      desk.beforeCardPlay,
    )}`,
  );
  // console.log(`[LogDebug] Event ${SocketConst.EMIT.PLAY_CARD} cardOfPlayer.length === 0 ${player}`);
  desk.timeout[desk.nextPlayer] = false;
  clearTimeout((<any>global)[desk.nextPlayer]);
  // Calculate the score each turn
  const { score } = await CommonService.calculateScoreOfPlayerFinishTurn(desk, winPlayer);
  // create activity: finish-turn
  activityService.create({
    event: SocketConst.EMIT.FINISH_TURN,
    dealer,
    player: '',
    turn: desk.turn,
    contents: {
      winner: winPlayer,
      score,
      total_score: desk.score,
      number_turn_play: desk.numberTurnPlay,
      card_of_player: desk.cardOfPlayer,
    },
  } as any);

  SocketService.broadcastFinishTurn(dealer, winPlayer || '', desk, score);
  await redisClient.set(dealer, JSON.stringify(desk));
  await dealerService.updateByCondition({
    conditions: { name: dealer },
    data: {
      $set: {
        turn: desk.turn,
        order: desk.order,
        score: desk.score,
      },
    },
  });

  await BlueBird.delay(AppConst.TIMEOUT_DELAY);
  if (desk.turn >= desk.totalTurn) {
    // Calculator winner of game
    try {
      const winner = await CommonService.calculateWinnerOfGame(desk);
      // create activity: finish-game
      activityService.create({
        event: SocketConst.EMIT.FINISH_GAME,
        dealer,
        player: '',
        turn: desk.turn,
        contents: {
          winner,
          order: desk.order,
          score: desk.score,
        },
      } as any);
      SocketService.broadcastFinishGame(dealer, winner, desk.order[winner], desk.order, desk.score);
      // Store players score of each game
      await CommonService.storeScoreOfPlayerFinishGame(desk);
      await dealerService.updateByCondition({
        conditions: { name: dealer },
        data: { $set: { status: StatusGame.FINISH } },
      });
      // disconnect all socket of room
      const players = desk.players || [];
      for (const player of players) {
        const socketIdOfPlayer = await redisClient.get(
          `${AppObject.REDIS_PREFIX.PLAYER}:${player}`,
        );
        const _sock = SocketService.getSocketById(socketIdOfPlayer);
        _sock.disconnect(true);
      }
    } catch (e) {
      console.log(e);
    }
    return;
  }

  // start new turn
  await CommonService.startDealer(dealer, undefined, false);
  return;
}

async function handlePenalty(
  socket: SocketIO.Socket,
  player: string,
  dealer: string,
  desk: Desk,
  penaltyCnt: number,
  error: BaseError,
  isNextPlayer: boolean,
) {
  if (!penaltyCnt) {
    if (isNextPlayer) {
      await skipPlayer(socket, desk, dealer, player);
    }
    return;
  }

  const { cardOfPlayer } = desk;
  const have = cardOfPlayer[player].length;
  const margin = AppConst.MAX_CARD_OF_PLAYER - have;
  const count = margin > penaltyCnt ? penaltyCnt : margin;

  if (!count) {
    if (isNextPlayer) {
      await skipPlayer(socket, desk, dealer, player);
    }
    return;
  }

  const { drawDesk, revealDesk, drawCards } = CommonService.drawCard(desk, count);
  desk.drawDesk = drawDesk;
  desk.revealDesk = revealDesk;
  desk.cardOfPlayer[player] = desk.cardOfPlayer[player].concat(drawCards);
  desk.yellUno[player] = false;
  await redisClient.set(dealer, JSON.stringify(desk));
  SocketService.sendCardToPlayer(socket.id, player, drawCards, true);
  // create activity: penalty
  activityService.create({
    event: 'penalty',
    dealer: dealer,
    player: '',
    turn: desk.turn,
    contents: {
      player,
      cards_receive: drawCards,
      number_turn_play: desk.numberTurnPlay,
      error: error.message,
    },
  } as any);

  if (drawCards.length < count) {
    turnEnd(desk, dealer);
    return;
  }

  if (isNextPlayer) {
    await skipPlayer(socket, desk, dealer, player);
  }
  return;
}

async function handleDrawCard(
  socket: SocketIO.Socket,
  data?: any,
  callback?: CallbackWithData<any>,
) {
  const player = await redisClient.get(`${AppObject.REDIS_PREFIX.PLAYER}:${socket.id}`);
  redisClient.set(
    `${AppObject.REDIS_PREFIX.PLAYER}:${player}`,
    socket.id,
    'EX',
    AppConst.REDIS_EXPIRE_TIME,
  );

  const dealer = await redisClient.get(`${AppObject.REDIS_PREFIX.ROOM}:${player}:${socket.id}`);
  const socketIds: any = (await SocketService.getAllClientOfRoom(dealer)) || [];
  if (CommonService.canContinue(dealer, socketIds)) {
    const error = new BaseError({
      message: AppConst.NUMBER_OF_SOCKET_CLIENT_JOIN_DEALER_LOWER_TWO,
    });
    CommonService.handleError(error, callback);
    socket.disconnect(true);
    return;
  }

  const desk: Desk = JSON.parse(await redisClient.get(dealer));
  const cardOfPlayer = desk.cardOfPlayer[player];
  const hasActivationWhiteWild = desk.activationWhiteWild
    ? desk.activationWhiteWild[player] > 0
    : false; // white wild bind_2
  const needDrawCard = desk.cardAddOn > 0;
  if (
    !hasActivationWhiteWild &&
    !needDrawCard &&
    cardOfPlayer.length >= AppConst.MAX_CARD_OF_PLAYER
  ) {
    if (desk.noPlayCount >= AppConst.NO_PLAY_MAX_LAP * desk.players.length) {
      turnEnd(desk, dealer);
      if (callback instanceof Object) {
        callback(undefined, data);
      }
      return;
    }

    desk.beforePlayer = player;
    desk.noPlayCount++;
    desk.yellUno[player] = false;
    desk.timeout[player] = false;
    clearTimeout((<any>global)[player]);
    await redisClient.set(dealer, JSON.stringify(desk));

    // create activity: draw-card
    const dataCb = { player, is_draw: false, can_play_draw_card: false };
    activityService.create({
      event: SocketConst.EMIT.DRAW_CARD,
      dealer: dealer,
      player,
      turn: desk.turn,
      contents: {
        can_play_draw_card: dataCb.can_play_draw_card,
        card_draw: [],
        is_draw: false,
        draw_desk: {
          before: desk.drawDesk.length,
          after: desk.drawDesk.length,
        },
        before_card: desk.cardBeforeDrawCard,
        draw_reason: SocketService.getDrawReason(desk, player),
        number_turn_play: desk.numberTurnPlay,
      },
    } as any);

    SocketService.broadcastDrawCard(dealer, dataCb);

    await nextPlayerAction(desk, dealer);

    if (callback instanceof Object) {
      callback(undefined, undefined);
    }
    return;
  }

  let penaltyCnt = 0;
  let error: BaseError;
  const isNextPlayer = CommonService.checkNextPlayer(player, desk.nextPlayer);
  if (!isNextPlayer) {
    penaltyCnt = 2;
    error = new BaseError({ message: AppConst.NEXT_PLAYER_INVALID });
  }

  if (error) {
    await handlePenalty(socket, player, dealer, desk, penaltyCnt, error, isNextPlayer);
    CommonService.handleError(error, callback);
    return;
  }

  const numberOfCardsBeforeDrawCard = desk.drawDesk.length;
  const activationWhiteWild = desk.activationWhiteWild && desk.activationWhiteWild[player] ? 1 : 0; // white wild bind_2
  const cardAddOn = desk.cardAddOn || activationWhiteWild;
  const count = cardAddOn || 1;
  console.log(`[LogDebug] turn: ${desk.turn}, numberTurnPlay: ${desk.numberTurnPlay}`);
  const drawReason = SocketService.getDrawReason(desk, player);
  const { drawDesk, revealDesk, drawCards } = CommonService.drawCard(desk, count);
  desk.drawDesk = drawDesk;
  desk.revealDesk = revealDesk;
  if (activationWhiteWild) {
    desk.activationWhiteWild[player]--;
  }
  const cardDraws: Card[] = drawCards;

  // validate card draw can play or can not play
  const beforeCardPlay = cloneDeep(desk.beforeCardPlay);
  if (
    cardAddOn > 0 ||
    !cardDraws[0] ||
    !CommonService.isAvailableCard(cardDraws[0], beforeCardPlay, desk.cardAddOn)
  ) {
    desk.cardAddOn = 0;
    desk.mustCallDrawCard = false;
    desk.canCallPlayDrawCard = false;
    desk.beforePlayer = player;
    desk.cardOfPlayer[player] = desk.cardOfPlayer[player].concat(cardDraws);
    desk.noPlayCount = 0;
    desk.timeout[player] = false;
    clearTimeout((<any>global)[player]);
    await redisClient.set(dealer, JSON.stringify(desk));

    // create activity: draw-card
    const dataCb = { player, is_draw: true, can_play_draw_card: false };
    activityService.create({
      event: SocketConst.EMIT.DRAW_CARD,
      dealer,
      player,
      turn: desk.turn,
      contents: {
        can_play_draw_card: dataCb.can_play_draw_card,
        card_draw: cardDraws,
        is_draw: true,
        draw_desk: {
          before: numberOfCardsBeforeDrawCard,
          after: desk.drawDesk.length,
        },
        before_card: desk.cardBeforeDrawCard,
        draw_reason: drawReason,
        number_turn_play: desk.numberTurnPlay,
      },
    } as any);

    SocketService.sendCardToPlayer(socket.id, player, cardDraws);
    await BlueBird.delay(AppConst.TIMEOUT_DELAY);
    SocketService.broadcastDrawCard(dealer, dataCb);

    if (drawCards.length < count) {
      turnEnd(desk, dealer);
      if (callback instanceof Object) {
        callback(undefined, undefined);
      }
      return;
    }

    await nextPlayerAction(desk, dealer);

    if (callback instanceof Object) {
      callback(undefined, dataCb);
    }

    return;
  }

  // console.log(`[LogDebug] Event ${SocketConst.EMIT.DRAW_CARD} can play card`);
  desk.mustCallDrawCard = false;
  desk.canCallPlayDrawCard = true;
  desk.cardBeforeDrawCard = cardDraws[0];
  desk.cardOfPlayer[player] = desk.cardOfPlayer[player].concat(cardDraws);
  desk.noPlayCount = 0;
  desk.timeout[player] = false;
  clearTimeout((<any>global)[player]);
  if ((APP_CONFIG.ENV.NAME as Environment) !== Environment.test) {
    const timeout = setTimeout(
      CommonService.timeoutPlayer,
      AppConst.TIMEOUT_OF_PLAYER,
      dealer,
      player,
    );
    (<any>global)[player] = timeout;
  }
  await redisClient.set(dealer, JSON.stringify(desk));

  // create activity: draw-card
  const dataCb = { player, can_play_draw_card: true };
  activityService.create({
    event: SocketConst.EMIT.DRAW_CARD,
    dealer,
    player,
    turn: desk.turn,
    contents: {
      can_play_draw_card: dataCb.can_play_draw_card,
      card_draw: cardDraws,
      is_draw: true,
      draw_desk: {
        before: numberOfCardsBeforeDrawCard,
        after: desk.drawDesk.length,
      },
      before_card: desk.cardBeforeDrawCard,
      draw_reason: drawReason,
      number_turn_play: desk.numberTurnPlay,
    },
  } as any);

  SocketService.sendCardToPlayer(socket.id, player, cardDraws);
  await BlueBird.delay(AppConst.TIMEOUT_DELAY);
  SocketService.broadcastDrawCard(dealer, dataCb);

  if (callback instanceof Object) {
    callback(undefined, dataCb);
  }

  return;
}

async function handleError(
  socket: SocketIO.Socket,
  player: string,
  dealer: string,
  desk: Desk,
  penaltyCnt: number,
  error: BaseError,
  callback: CallbackWithData<any>,
  isNextPlayer: boolean,
) {
  await handlePenalty(socket, player, dealer, desk, penaltyCnt, error, isNextPlayer);
  CommonService.handleError(error, callback);
}

async function skipPlayer(socket, desk, dealer, player) {
  await BlueBird.delay(AppConst.TIMEOUT_DELAY);
  if (desk.mustCallDrawCard) {
    await handleDrawCard(socket);
  } else {
    desk.beforePlayer = player;
    desk.noPlayCount = 0;
    desk.timeout[player] = false;
    clearTimeout((<any>global)[player]);
    await redisClient.set(dealer, JSON.stringify(desk));
    await nextPlayerAction(desk, dealer);
  }
}

socketServer.on('connection', function (socket) {
  // event
  socket.on(SocketConst.EMIT.JOIN_ROOM, async (data: JoinRoom, callback: CallbackWithData<any>) => {
    console.log(`[LogDebug] Event ${SocketConst.EMIT.JOIN_ROOM}`);
    console.log(data);

    function catchError(error) {
      if (callback instanceof Object) {
        callback(error, undefined);
      }
      socket.disconnect(true);
      return;
    }

    try {
      // validate data
      let error: BaseError;
      if (!data.room_name) {
        error = new BaseError({ message: AppConst.ROOM_NAME_IS_REQUIRED });
      }
      if (!data.player) {
        error = new BaseError({ message: AppConst.PLAYER_NAME_IS_REQUIRED });
      }
      if (data.player && data.player.length > AppConst.MAX_NAME_LENGTH) {
        error = new BaseError({ message: AppConst.PLAYER_NAME_TOO_LONG });
      }
      if (error) {
        catchError(error);
        return;
      }

      // delaer inspection
      const dealer = await dealerService.detailByCondition({ name: data.room_name });
      if (!dealer) {
        error = new BaseError({ message: AppConst.DEALER_NOT_FOUND });
      } else if ((dealer.status as StatusGame) === StatusGame.FINISH) {
        error = new BaseError({ message: AppConst.STATUS_DEALER_INVALID });
      }
      if (error) {
        catchError(error);
        return;
      }

      // validate player join dealer
      let playerFound = await playerService.detailByCondition({ name: data.player });
      if (!playerFound) {
        playerFound = await playerService.create({ name: data.player });
      }

      if ((dealer.status as StatusGame) === StatusGame.NEW) {
        let newPlayers = dealer.players || [];
        if (newPlayers.indexOf(playerFound._id) > -1) {
          const error = new BaseError({ message: AppConst.PLAYER_NAME_DUPLICATE });
          catchError(error);
          return;
        }
        newPlayers.push(playerFound._id);
        newPlayers = uniq(newPlayers);
        await dealerService.updateByCondition({
          conditions: { _id: dealer._id },
          data: {
            $set: { players: newPlayers },
          },
        });
      } else {
        const players = dealer.players || [];
        if (players.indexOf(playerFound._id) === -1) {
          const error = new BaseError({ message: AppConst.DEALER_STARTING });
          catchError(error);
          return;
        }
      }
      // insert player to database
      // store room name and player name to redis
      redisClient.set(`${AppObject.REDIS_PREFIX.PLAYER}:${socket.id}`, playerFound._id);
      redisClient.set(
        `${AppObject.REDIS_PREFIX.PLAYER}:${playerFound._id}`,
        socket.id,
        'EX',
        AppConst.REDIS_EXPIRE_TIME,
      );
      // redisClient.set(
      //   `${AppObject.REDIS_PREFIX.PLAYER}:${player}:${socket.id}`,
      //   player,
      //   'EX',
      //   AppConst.REDIS_EXPIRE_TIME,
      // );
      redisClient.set(
        `${AppObject.REDIS_PREFIX.ROOM}:${playerFound._id}:${socket.id}`,
        dealer.name,
        'EX',
        AppConst.REDIS_EXPIRE_TIME,
      );

      socket.join(dealer.name);
      await BlueBird.delay(AppConst.TIMEOUT_DELAY);
      socket.broadcast.to(dealer.name).emit(SocketConst.EMIT.JOIN_ROOM, data);

      // create activity: join-room
      activityService.create({
        event: SocketConst.EMIT.JOIN_ROOM,
        dealer: dealer.name,
        player: playerFound._id,
        contents: {
          player_id: playerFound._id,
          player_name: data.player,
        },
      } as any);

      if (callback instanceof Object) {
        callback(undefined, {
          ...data,
          your_id: playerFound._id,
          totalTurn: dealer.totalTurn,
          whiteWild: dealer.whiteWild,
        });
      }

      return;
    } catch (err) {
      CommonService.handleError(err, callback);
    }
  });

  socket.on(
    SocketConst.EMIT.COLOR_OF_WILD,
    async (data: ColorOfWild, callback: CallbackWithData<any>) => {
      console.log(`[LogDebug] Event ${SocketConst.EMIT.COLOR_OF_WILD}`);
      console.log(data);
      try {
        if ((APP_CONFIG.ENV.NAME as Environment) !== Environment.test) {
          await BlueBird.delay(AppConst.TIMEOUT_DELAY);
        }

        const player = await redisClient.get(`${AppObject.REDIS_PREFIX.PLAYER}:${socket.id}`);
        redisClient.set(
          `${AppObject.REDIS_PREFIX.PLAYER}:${player}`,
          socket.id,
          'EX',
          AppConst.REDIS_EXPIRE_TIME,
        );
        const dealer = await redisClient.get(
          `${AppObject.REDIS_PREFIX.ROOM}:${player}:${socket.id}`,
        );

        const socketIds: any = (await SocketService.getAllClientOfRoom(dealer)) || [];
        if (CommonService.canContinue(dealer, socketIds)) {
          const error = new BaseError({
            message: AppConst.NUMBER_OF_SOCKET_CLIENT_JOIN_DEALER_LOWER_TWO,
          });
          CommonService.handleError(error, callback);
          socket.disconnect(true);
          return;
        }

        const desk: Desk = JSON.parse(await redisClient.get(dealer));
        const isNextPlayer = CommonService.checkNextPlayer(player, desk.nextPlayer);
        if (!isNextPlayer && desk.restrictInterrupt) {
          const error = new BaseError({
            message: AppConst.RESUTRICT_INTERRUPT,
          });
          CommonService.handleError(error, callback);
          return;
        }

        // create activity regardless of errors: color-of-wild
        activityService.create({
          event: SocketConst.EMIT.COLOR_OF_WILD,
          dealer,
          player,
          turn: desk.turn,
          contents: {
            color_of_wild: data.color_of_wild,
            number_turn_play: desk.numberTurnPlay,
          },
        } as any);

        if (!isNextPlayer) {
          await handleError(
            socket,
            player,
            dealer,
            desk,
            AppConst.CARD_PUNISH,
            new BaseError({ message: AppConst.NEXT_PLAYER_INVALID }),
            callback,
            isNextPlayer,
          );
          return;
        }

        if (desk.beforeCardPlay.color !== Color.BLACK) {
          await handleError(
            socket,
            player,
            dealer,
            desk,
            AppConst.CARD_PUNISH,
            new BaseError({ message: AppConst.ALREADY_CHANGED_COLOR }),
            callback,
            isNextPlayer,
          );
          return;
        }

        // validate data
        if (!data.color_of_wild) {
          await handleError(
            socket,
            player,
            dealer,
            desk,
            AppConst.CARD_PUNISH,
            new BaseError({ message: AppConst.COLOR_WILD_IS_REQUIRED }),
            callback,
            isNextPlayer,
          );
          return;
        } else if (ARR_COLOR_OF_WILD.indexOf(data.color_of_wild as Color) === -1) {
          await handleError(
            socket,
            player,
            dealer,
            desk,
            AppConst.CARD_PUNISH,
            new BaseError({ message: AppConst.COLOR_WILD_INVALID }),
            callback,
            isNextPlayer,
          );
          return;
        }

        // console.log(`[LogDebug] Event ${SocketConst.EMIT.COLOR_OF_WILD} desk.beforeCardPlay: `, desk.beforeCardPlay);
        if (ARR_WILD_SPECIAL.indexOf(desk.beforeCardPlay.special as Special) === -1) {
          await handleError(
            socket,
            player,
            dealer,
            desk,
            AppConst.CARD_PUNISH,
            new BaseError({ message: AppConst.CAN_NOT_CHOSE_COLOR_OF_WILD }),
            callback,
            isNextPlayer,
          );
          return;
        }

        desk.beforeCardPlay.color = data.color_of_wild;
        if ((desk.beforeCardPlay.special as Special) === Special.WILD_DRAW_4) {
          desk.cardAddOn += 4;
        } else {
          desk.cardAddOn = 0;
        }
        desk.mustCallDrawCard = false;
        if ((desk.beforeCardPlay.special as Special) === Special.WILD_DRAW_4) {
          desk.mustCallDrawCard = true;
        }
        desk.beforePlayer = player;
        desk.noPlayCount = 0;
        desk.restrictInterrupt = true;
        desk.timeout[player] = false;
        clearTimeout((<any>global)[player]);
        await redisClient.set(dealer, JSON.stringify(desk));

        await BlueBird.delay(AppConst.TIMEOUT_DELAY);

        if (CommonService.isTurnEnd(desk, player, undefined, true)) {
          if (desk.beforeCardPlay.special === Special.WILD_DRAW_4) {
            const { nextPlayer } = await CommonService.preGetNextPlayer(desk);
            const numberOfCardsBeforeDrawCard = desk.drawDesk.length;
            const { drawDesk, revealDesk, drawCards } = CommonService.drawCard(
              desk,
              desk.cardAddOn,
            );
            desk.drawDesk = drawDesk;
            desk.revealDesk = revealDesk;
            desk.cardOfPlayer[nextPlayer] = desk.cardOfPlayer[nextPlayer].concat(drawCards);
            await redisClient.set(dealer, JSON.stringify(desk));
            SocketService.sendCardToPlayer(socket.id, player, drawCards, true);
            await BlueBird.delay(AppConst.TIMEOUT_DELAY);

            // create activity: draw-card
            const drawCardData = { player: nextPlayer, is_draw: true, can_play_draw_card: false };
            activityService.create({
              event: SocketConst.EMIT.DRAW_CARD,
              dealer: dealer,
              player: nextPlayer,
              turn: desk.turn,
              contents: {
                can_play_draw_card: false,
                card_draw: drawCards,
                is_draw: true,
                draw_desk: {
                  before: numberOfCardsBeforeDrawCard,
                  after: desk.drawDesk.length,
                },
                before_card: desk.beforeCardPlay,
                draw_reason: SocketService.getDrawReason(desk, nextPlayer),
                number_turn_play: desk.numberTurnPlay,
              },
            } as any);

            SocketService.broadcastDrawCard(dealer, drawCardData);
          }

          turnEnd(desk, dealer, player);

          if (callback instanceof Object) {
            callback(undefined, data);
          }

          return;
        }

        // determined next player
        await nextPlayerAction(desk, dealer);

        if (callback instanceof Object) {
          callback(undefined, data);
        }

        return;
      } catch (err) {
        CommonService.handleError(err, callback);
      }
    },
  );

  socket.on(
    SocketConst.EMIT.SAY_UNO_AND_PLAY_CARD,
    async (data: SayUnoAndPlayCard, callback: CallbackWithData<any>) => {
      console.log(`[LogDebug] Event ${SocketConst.EMIT.SAY_UNO_AND_PLAY_CARD}`);
      console.log(data);
      try {
        if ((APP_CONFIG.ENV.NAME as Environment) !== Environment.test) {
          await BlueBird.delay(AppConst.TIMEOUT_DELAY);
        }
        const player = await redisClient.get(`${AppObject.REDIS_PREFIX.PLAYER}:${socket.id}`);
        redisClient.set(
          `${AppObject.REDIS_PREFIX.PLAYER}:${player}`,
          socket.id,
          'EX',
          AppConst.REDIS_EXPIRE_TIME,
        );

        const dealer = await redisClient.get(
          `${AppObject.REDIS_PREFIX.ROOM}:${player}:${socket.id}`,
        );

        const socketIds: any = (await SocketService.getAllClientOfRoom(dealer)) || [];
        if (CommonService.canContinue(dealer, socketIds)) {
          const error = new BaseError({
            message: AppConst.NUMBER_OF_SOCKET_CLIENT_JOIN_DEALER_LOWER_TWO,
          });
          CommonService.handleError(error, callback);
          socket.disconnect(true);
          return;
        }

        const cardPlay = data.card_play;
        const desk: Desk = JSON.parse(await redisClient.get(dealer));
        const isNextPlayer = CommonService.checkNextPlayer(player, desk.nextPlayer);
        if (!isNextPlayer && desk.restrictInterrupt) {
          const error = new BaseError({
            message: AppConst.RESUTRICT_INTERRUPT,
          });
          CommonService.handleError(error, callback);
          return;
        }

        // create activity regardless of errors: say-uno-and-play-card
        const dataCb = {
          player,
          card_play: cardPlay,
          yell_uno: true,
        };
        activityService.create({
          event: SocketConst.EMIT.SAY_UNO_AND_PLAY_CARD,
          dealer,
          player,
          turn: desk.turn,
          contents: {
            card_play: dataCb.card_play,
            number_turn_play: desk.numberTurnPlay,
          },
        } as any);

        if (!isNextPlayer) {
          await handleError(
            socket,
            player,
            dealer,
            desk,
            AppConst.CARD_PUNISH,
            new BaseError({ message: AppConst.NEXT_PLAYER_INVALID }),
            callback,
            isNextPlayer,
          );
          return;
        }

        if (desk.mustCallDrawCard) {
          await handleError(
            socket,
            player,
            dealer,
            desk,
            AppConst.CARD_PUNISH,
            new BaseError({ message: AppConst.CAN_NOT_SAY_UNO_AND_PLAY_CARD }),
            callback,
            isNextPlayer,
          );
          return;
        }

        const validateErr = CommonService.hasValidateError(cardPlay);
        if (validateErr) {
          await handleError(
            socket,
            player,
            dealer,
            desk,
            AppConst.CARD_PUNISH,
            validateErr,
            callback,
            isNextPlayer,
          );
          return;
        }

        let cardOfPlayer = cloneDeep(desk.cardOfPlayer[player]);
        if (cardOfPlayer.length !== 2) {
          await handleError(
            socket,
            player,
            dealer,
            desk,
            AppConst.CARD_PUNISH,
            new BaseError({ message: AppConst.CAN_NOT_SAY_UNO_AND_PLAY_CARD }),
            callback,
            isNextPlayer,
          );
          return;
        }

        if (!CommonService.validateCardOfPlayer(cardPlay, cardOfPlayer)) {
          await handleError(
            socket,
            player,
            dealer,
            desk,
            AppConst.CARD_PUNISH,
            new BaseError({ message: AppConst.CARD_PLAY_NOT_EXIST_OF_PLAYER }),
            callback,
            isNextPlayer,
          );
          return;
        }

        // validate card play
        const beforeCardPlay = cloneDeep(desk.beforeCardPlay);
        if (!CommonService.isAvailableCard(cardPlay, beforeCardPlay, desk.cardAddOn)) {
          await handleError(
            socket,
            player,
            dealer,
            desk,
            AppConst.CARD_PUNISH,
            new BaseError({ message: AppConst.CARD_PLAY_INVALID_WITH_CARD_BEFORE }),
            callback,
            isNextPlayer,
          );
          return;
        }

        cardOfPlayer = CommonService.removeCardOfPlayer(cardPlay, cardOfPlayer);
        desk.cardOfPlayer[player] = cardOfPlayer;
        desk.numberCardPlay++;
        desk.yellUno[player] = true;
        desk.revealDesk.push(cardPlay);
        desk.colorBeforeWild = desk.beforeCardPlay.color;
        desk.beforeCardPlay = cardPlay;
        desk.beforePlayer = player;
        desk.mustCallDrawCard = false;
        desk.noPlayCount = 0;
        desk.timeout[player] = false;
        clearTimeout((<any>global)[player]);
        await redisClient.set(dealer, JSON.stringify(desk));

        await playCardAction(socket, dealer, desk, player, cardPlay, beforeCardPlay);
        await BlueBird.delay(AppConst.TIMEOUT_DELAY);

        SocketService.broadcastSayUnoAndPlayCard(dealer, dataCb);

        // determined next player
        if (ARR_WILD_SPECIAL.indexOf(cardPlay.special as Special) === -1) {
          await nextPlayerAction(desk, dealer);
        }

        if (callback instanceof Object) {
          callback(undefined, dataCb);
        }

        return;
      } catch (err) {
        CommonService.handleError(err, callback);
      }
    },
  );

  socket.on(SocketConst.EMIT.PLAY_CARD, async (data: PlayCard, callback: CallbackWithData<any>) => {
    console.log(`[LogDebug] Event ${SocketConst.EMIT.PLAY_CARD}`);
    console.log(data);
    try {
      if ((APP_CONFIG.ENV.NAME as Environment) !== Environment.test) {
        await BlueBird.delay(AppConst.TIMEOUT_DELAY);
      }
      const player = await redisClient.get(`${AppObject.REDIS_PREFIX.PLAYER}:${socket.id}`);
      redisClient.set(
        `${AppObject.REDIS_PREFIX.PLAYER}:${player}`,
        socket.id,
        'EX',
        AppConst.REDIS_EXPIRE_TIME,
      );

      const dealer = await redisClient.get(`${AppObject.REDIS_PREFIX.ROOM}:${player}:${socket.id}`);
      const socketIds: any = (await SocketService.getAllClientOfRoom(dealer)) || [];
      if (CommonService.canContinue(dealer, socketIds)) {
        const error = new BaseError({
          message: AppConst.NUMBER_OF_SOCKET_CLIENT_JOIN_DEALER_LOWER_TWO,
        });
        CommonService.handleError(error, callback);
        socket.disconnect(true);
        return;
      }

      const cardPlay = data.card_play;
      const desk: Desk = JSON.parse(await redisClient.get(dealer));
      const isNextPlayer = CommonService.checkNextPlayer(player, desk.nextPlayer);
      if (!isNextPlayer && desk.restrictInterrupt) {
        const error = new BaseError({
          message: AppConst.RESUTRICT_INTERRUPT,
        });
        CommonService.handleError(error, callback);
        return;
      }

      // create activity regardless of errors: play-card
      activityService.create({
        event: SocketConst.EMIT.PLAY_CARD,
        dealer,
        player,
        turn: desk.turn,
        contents: {
          card_play: cardPlay,
          number_turn_play: desk.numberTurnPlay,
        },
      } as any);

      if (!isNextPlayer) {
        await handleError(
          socket,
          player,
          dealer,
          desk,
          AppConst.CARD_PUNISH,
          new BaseError({ message: AppConst.NEXT_PLAYER_INVALID }),
          callback,
          isNextPlayer,
        );
        return;
      }

      if (desk.mustCallDrawCard) {
        await handleError(
          socket,
          player,
          dealer,
          desk,
          AppConst.CARD_PUNISH,
          new BaseError({ message: AppConst.CAN_NOT_PLAY_CARD }),
          callback,
          isNextPlayer,
        );
        return;
      }

      const validateErr = CommonService.hasValidateError(cardPlay);
      if (validateErr) {
        await handleError(
          socket,
          player,
          dealer,
          desk,
          AppConst.CARD_PUNISH,
          validateErr,
          callback,
          isNextPlayer,
        );
        return;
      }

      let cardOfPlayer = cloneDeep(desk.cardOfPlayer[player]);
      if (!CommonService.validateCardOfPlayer(cardPlay, cardOfPlayer)) {
        await handleError(
          socket,
          player,
          dealer,
          desk,
          AppConst.CARD_PUNISH,
          new BaseError({ message: AppConst.CARD_PLAY_NOT_EXIST_OF_PLAYER }),
          callback,
          isNextPlayer,
        );
        return;
      }

      // validate card play
      const beforeCardPlay = cloneDeep(desk.beforeCardPlay);
      if (!CommonService.isAvailableCard(cardPlay, beforeCardPlay, desk.cardAddOn)) {
        await handleError(
          socket,
          player,
          dealer,
          desk,
          AppConst.CARD_PUNISH,
          new BaseError({ message: AppConst.CARD_PLAY_INVALID_WITH_CARD_BEFORE }),
          callback,
          isNextPlayer,
        );
        return;
      }

      // console.log(`[LogDebug] Event ${SocketConst.EMIT.PLAY_CARD} cardOfPlayer ${player} before: `, cardOfPlayer);
      cardOfPlayer = CommonService.removeCardOfPlayer(cardPlay, cardOfPlayer);
      // console.log(`[LogDebug] Event ${SocketConst.EMIT.PLAY_CARD} cardOfPlayer ${player}  after: `, cardOfPlayer);
      desk.cardOfPlayer[player] = cardOfPlayer;
      desk.numberCardPlay++;
      desk.revealDesk.push(cardPlay);
      desk.colorBeforeWild = desk.beforeCardPlay.color;
      desk.beforeCardPlay = cardPlay;
      desk.beforePlayer = player;
      desk.mustCallDrawCard = false;
      desk.noPlayCount = 0;
      desk.timeout[player] = false;
      clearTimeout((<any>global)[player]);
      await redisClient.set(dealer, JSON.stringify(desk));

      await playCardAction(socket, dealer, desk, player, cardPlay, beforeCardPlay);
      await BlueBird.delay(AppConst.TIMEOUT_DELAY);

      const dataCb = {
        ...data,
        player,
      };
      SocketService.broadcastPlayCard(dealer, dataCb);

      if (CommonService.isTurnEnd(desk, player, cardPlay)) {
        if (cardPlay.special === Special.DRAW_2) {
          const { nextPlayer } = await CommonService.preGetNextPlayer(desk);
          const numberOfCardsBeforeDrawCard = desk.drawDesk.length;
          const { drawDesk, revealDesk, drawCards } = CommonService.drawCard(desk, desk.cardAddOn);
          desk.drawDesk = drawDesk;
          desk.revealDesk = revealDesk;
          desk.cardOfPlayer[nextPlayer] = desk.cardOfPlayer[nextPlayer].concat(drawCards);
          await redisClient.set(dealer, JSON.stringify(desk));
          SocketService.sendCardToPlayer(socket.id, player, drawCards, true);
          await BlueBird.delay(AppConst.TIMEOUT_DELAY);

          // create activity: draw-card
          const drawCardData = { player: nextPlayer, is_draw: true, can_play_draw_card: false };
          activityService.create({
            event: SocketConst.EMIT.DRAW_CARD,
            dealer: dealer,
            player: nextPlayer,
            turn: desk.turn,
            contents: {
              can_play_draw_card: false,
              card_draw: drawCards,
              is_draw: true,
              draw_desk: {
                before: numberOfCardsBeforeDrawCard,
                after: desk.drawDesk.length,
              },
              before_card: desk.beforeCardPlay,
              draw_reason: SocketService.getDrawReason(desk, nextPlayer),
              number_turn_play: desk.numberTurnPlay,
            },
          } as any);

          SocketService.broadcastDrawCard(dealer, drawCardData);
        }

        turnEnd(desk, dealer, player);

        if (callback instanceof Object) {
          callback(undefined, dataCb);
        }

        return;
      }

      if (ARR_WILD_SPECIAL.indexOf(cardPlay.special as Special) === -1) {
        await nextPlayerAction(desk, dealer);
      }

      if (callback instanceof Object) {
        callback(undefined, dataCb);
      }

      return;
    } catch (err) {
      console.log(err);
      CommonService.handleError(err, callback);
    }
  });

  socket.on(SocketConst.EMIT.DRAW_CARD, async (data: any, callback: CallbackWithData<any>) => {
    console.log(`[LogDebug] Event ${SocketConst.EMIT.DRAW_CARD}`);
    console.log(data);
    try {
      if ((APP_CONFIG.ENV.NAME as Environment) !== Environment.test) {
        await BlueBird.delay(AppConst.TIMEOUT_DELAY);
      }
      const player = await redisClient.get(`${AppObject.REDIS_PREFIX.PLAYER}:${socket.id}`);
      redisClient.set(
        `${AppObject.REDIS_PREFIX.PLAYER}:${player}`,
        socket.id,
        'EX',
        AppConst.REDIS_EXPIRE_TIME,
      );

      const dealer = await redisClient.get(`${AppObject.REDIS_PREFIX.ROOM}:${player}:${socket.id}`);
      const socketIds: any = (await SocketService.getAllClientOfRoom(dealer)) || [];
      if (CommonService.canContinue(dealer, socketIds)) {
        const error = new BaseError({
          message: AppConst.NUMBER_OF_SOCKET_CLIENT_JOIN_DEALER_LOWER_TWO,
        });
        CommonService.handleError(error, callback);
        socket.disconnect(true);
        return;
      }

      const desk: Desk = JSON.parse(await redisClient.get(dealer));
      const isNextPlayer = CommonService.checkNextPlayer(player, desk.nextPlayer);
      if (!isNextPlayer && desk.restrictInterrupt) {
        const error = new BaseError({
          message: AppConst.RESUTRICT_INTERRUPT,
        });
        CommonService.handleError(error, callback);
        return;
      }

      try {
        await handleDrawCard(socket, data, callback);
      } catch (err) {
        CommonService.handleError(err, callback);
      }
    } catch (err) {
      console.log(err);
      CommonService.handleError(err, callback);
    }
  });

  socket.on(
    SocketConst.EMIT.PLAY_DRAW_CARD,
    async (data: PlayDrawCard, callback: CallbackWithData<any>) => {
      console.log(`[LogDebug] Event ${SocketConst.EMIT.PLAY_DRAW_CARD}`);
      console.log(data);
      try {
        if ((APP_CONFIG.ENV.NAME as Environment) !== Environment.test) {
          await BlueBird.delay(AppConst.TIMEOUT_DELAY);
        }
        const player = await redisClient.get(`${AppObject.REDIS_PREFIX.PLAYER}:${socket.id}`);
        redisClient.set(
          `${AppObject.REDIS_PREFIX.PLAYER}:${player}`,
          socket.id,
          'EX',
          AppConst.REDIS_EXPIRE_TIME,
        );

        const dealer = await redisClient.get(
          `${AppObject.REDIS_PREFIX.ROOM}:${player}:${socket.id}`,
        );
        const socketIds: any = (await SocketService.getAllClientOfRoom(dealer)) || [];
        if (CommonService.canContinue(dealer, socketIds)) {
          const error = new BaseError({
            message: AppConst.NUMBER_OF_SOCKET_CLIENT_JOIN_DEALER_LOWER_TWO,
          });
          CommonService.handleError(error, callback);
          socket.disconnect(true);
          return;
        }

        const desk: Desk = JSON.parse(await redisClient.get(dealer));
        const cardPlay = desk.cardBeforeDrawCard;
        const isNextPlayer = CommonService.checkNextPlayer(player, desk.nextPlayer);
        if (!isNextPlayer && desk.restrictInterrupt) {
          const error = new BaseError({
            message: AppConst.RESUTRICT_INTERRUPT,
          });
          CommonService.handleError(error, callback);
          return;
        }

        // create activity regardless of errors: play-draw-card
        const dataCb = {
          ...data,
          player,
          card_play: undefined,
        };
        if (data.is_play_card) {
          dataCb.card_play = cardPlay;
        }
        activityService.create({
          event: SocketConst.EMIT.PLAY_DRAW_CARD,
          dealer,
          player,
          turn: desk.turn,
          contents: {
            is_play_card: data.is_play_card,
            card_play: dataCb.card_play,
            number_turn_play: desk.numberTurnPlay,
          },
        } as any);

        if (!isNextPlayer) {
          await handleError(
            socket,
            player,
            dealer,
            desk,
            AppConst.CARD_PUNISH,
            new BaseError({ message: AppConst.NEXT_PLAYER_INVALID }),
            callback,
            isNextPlayer,
          );
          return;
        }

        if (!desk.canCallPlayDrawCard) {
          await handleError(
            socket,
            player,
            dealer,
            desk,
            AppConst.CARD_PUNISH,
            new BaseError({ message: AppConst.CAN_NOT_PLAY_DRAW_CARD }),
            callback,
            isNextPlayer,
          );
          return;
        }

        if (data.is_play_card === undefined || data.is_play_card === null) {
          await handleError(
            socket,
            player,
            dealer,
            desk,
            AppConst.CARD_PUNISH,
            new BaseError({ message: AppConst.IS_PLAY_CARD_IS_REQUIED }),
            callback,
            isNextPlayer,
          );
          return;
        }

        if (
          String(data.is_play_card) !== AppObject.BOOLEAN.TRUE &&
          String(data.is_play_card) !== AppObject.BOOLEAN.FALSE
        ) {
          await handleError(
            socket,
            player,
            dealer,
            desk,
            AppConst.CARD_PUNISH,
            new BaseError({ message: AppConst.PARAM_IS_PLAY_CARD_INVALID }),
            callback,
            isNextPlayer,
          );
          return;
        }

        let cardOfPlayer = cloneDeep(desk.cardOfPlayer[player]);
        if (!CommonService.validateCardOfPlayer(cardPlay, cardOfPlayer)) {
          await handleError(
            socket,
            player,
            dealer,
            desk,
            AppConst.CARD_PUNISH,
            new BaseError({ message: AppConst.CARD_PLAY_NOT_EXIST_OF_PLAYER }),
            callback,
            isNextPlayer,
          );
          return;
        }

        // validate card play
        const beforeCardPlay = cloneDeep(desk.beforeCardPlay);
        if (
          data.is_play_card &&
          !CommonService.isAvailableCard(cardPlay, beforeCardPlay, desk.cardAddOn)
        ) {
          await handleError(
            socket,
            player,
            dealer,
            desk,
            AppConst.CARD_PUNISH,
            new BaseError({ message: AppConst.CARD_PLAY_INVALID_WITH_CARD_BEFORE }),
            callback,
            isNextPlayer,
          );
          return;
        }

        if (data.is_play_card) {
          desk.beforeCardPlay = cardPlay;
          desk.colorBeforeWild = desk.beforeCardPlay.color;
          cardOfPlayer = CommonService.removeCardOfPlayer(cardPlay, cardOfPlayer);
          desk.cardOfPlayer[player] = cardOfPlayer;
          desk.revealDesk.push(cardPlay);
          desk.numberCardPlay++;
        }
        desk.beforePlayer = player;
        desk.mustCallDrawCard = false;
        desk.canCallPlayDrawCard = false;
        desk.cardBeforeDrawCard = undefined;
        desk.noPlayCount = 0;
        desk.restrictInterrupt = true;
        desk.timeout[player] = false;
        clearTimeout((<any>global)[player]);
        await redisClient.set(dealer, JSON.stringify(desk));

        if (data.is_play_card) {
          await playCardAction(socket, dealer, desk, player, cardPlay, beforeCardPlay);
          await BlueBird.delay(AppConst.TIMEOUT_DELAY);
        }

        SocketService.broadcastPlayDrawCard(dealer, dataCb);

        if (!data.is_play_card || ARR_WILD_SPECIAL.indexOf(cardPlay.special as Special) === -1) {
          await nextPlayerAction(desk, dealer);
        }

        if (callback instanceof Object) {
          callback(undefined, dataCb);
        }

        return;
      } catch (err) {
        CommonService.handleError(err, callback);
      }
    },
  );

  socket.on(
    SocketConst.EMIT.CHALLENGE,
    async (data: Challenge, callback: CallbackWithData<any>) => {
      console.log(`[LogDebug] Event ${SocketConst.EMIT.CHALLENGE}`);
      console.log(data);
      try {
        if ((APP_CONFIG.ENV.NAME as Environment) !== Environment.test) {
          await BlueBird.delay(AppConst.TIMEOUT_DELAY);
        }

        const player = await redisClient.get(`${AppObject.REDIS_PREFIX.PLAYER}:${socket.id}`);
        redisClient.set(
          `${AppObject.REDIS_PREFIX.PLAYER}:${player}`,
          socket.id,
          'EX',
          AppConst.REDIS_EXPIRE_TIME,
        );

        const dealer = await redisClient.get(
          `${AppObject.REDIS_PREFIX.ROOM}:${player}:${socket.id}`,
        );

        const socketIds: any = (await SocketService.getAllClientOfRoom(dealer)) || [];
        if (CommonService.canContinue(dealer, socketIds)) {
          const error = new BaseError({
            message: AppConst.NUMBER_OF_SOCKET_CLIENT_JOIN_DEALER_LOWER_TWO,
          });
          CommonService.handleError(error, callback);
          socket.disconnect(true);
          return;
        }

        const desk: Desk = JSON.parse(await redisClient.get(dealer));
        const beforeCardPlay = cloneDeep(desk.beforeCardPlay);
        const beforePlayer = desk.beforePlayer;
        const isNextPlayer = CommonService.checkNextPlayer(player, desk.nextPlayer);
        if (!isNextPlayer && desk.restrictInterrupt) {
          const error = new BaseError({
            message: AppConst.RESUTRICT_INTERRUPT,
          });
          CommonService.handleError(error, callback);
          return;
        }

        if (!isNextPlayer) {
          await handleError(
            socket,
            player,
            dealer,
            desk,
            AppConst.CARD_PUNISH,
            new BaseError({ message: AppConst.NEXT_PLAYER_INVALID }),
            callback,
            isNextPlayer,
          );
          return;
        }

        if (data.is_challenge === undefined || data.is_challenge === null) {
          await handleError(
            socket,
            player,
            dealer,
            desk,
            AppConst.CARD_PUNISH,
            new BaseError({ message: AppConst.IS_CHALLENGE_IS_REQUIED }),
            callback,
            isNextPlayer,
          );
          return;
        }

        if (
          String(data.is_challenge) !== AppObject.BOOLEAN.TRUE &&
          String(data.is_challenge) !== AppObject.BOOLEAN.FALSE
        ) {
          await handleError(
            socket,
            player,
            dealer,
            desk,
            AppConst.CARD_PUNISH,
            new BaseError({ message: AppConst.PARAM_IS_CHALLENGE_INVALID }),
            callback,
            isNextPlayer,
          );
          return;
        }

        if (
          (beforeCardPlay.special as Special) !== Special.WILD_DRAW_4 ||
          desk.cardAddOn === 0 ||
          (desk.activationWhiteWild && desk.activationWhiteWild[player] > 0)
        ) {
          await handleError(
            socket,
            player,
            dealer,
            desk,
            AppConst.CARD_PUNISH,
            new BaseError({ message: AppConst.CAN_NOT_CHALLENGE }),
            callback,
            isNextPlayer,
          );
          return;
        }

        // console.log(`[LogDebug] Event ${SocketConst.EMIT.CHALLENGE} beforePlayer: `, beforePlayer);
        if (data.is_challenge) {
          // console.log(`[LogDebug] Event ${SocketConst.EMIT.CHALLENGE} data.is_challenge: `, data.is_challenge);
          const cardBeforeWildDraw4 = cloneDeep(desk.cardBeforeWildDraw4);
          // console.log(`[LogDebug] Event ${SocketConst.EMIT.CHALLENGE} cardBeforeWildDraw4: `, cardBeforeWildDraw4);
          const cardOfBeforePlayer = cloneDeep(desk.cardOfPlayer[beforePlayer]);
          // console.log(`[LogDebug] Event ${SocketConst.EMIT.CHALLENGE} cardOfBeforePlayer: `, cardOfBeforePlayer);
          const isChallengeSuccessfully = CommonService.isChallengeSuccessfully(
            cardBeforeWildDraw4,
            cardOfBeforePlayer,
          );
          // console.log(`[LogDebug] Event ${SocketConst.EMIT.CHALLENGE} isChallengeSuccessfully: `, isChallengeSuccessfully);
          const dataEventPublicCard = {
            card_of_player: beforePlayer,
            cards: cardOfBeforePlayer,
          };
          socket.emit(SocketConst.EMIT.PUBLIC_CARD, dataEventPublicCard);
          await BlueBird.delay(AppConst.TIMEOUT_DELAY);
          // create activity: public-card
          activityService.create({
            event: SocketConst.EMIT.PUBLIC_CARD,
            dealer,
            player: '',
            turn: desk.turn,
            contents: {
              player: dataEventPublicCard.card_of_player,
              cards: dataEventPublicCard.cards,
              number_turn_play: desk.numberTurnPlay,
            },
          } as any);

          if (isChallengeSuccessfully) {
            console.log(
              `[LogDebug] Event ${SocketConst.EMIT.CHALLENGE} isChallengeSuccessfully true`,
            );
            let cardDraws: Card[] = [];
            cardDraws.push(desk.revealDesk.pop());
            const { drawDesk, revealDesk, drawCards } = CommonService.drawCard(
              desk,
              AppConst.CARD_DRAW_CHALLENGE_SUCCESSFULLY,
            );
            if (drawCards.length < AppConst.CARD_DRAW_CHALLENGE_SUCCESSFULLY) {
              turnEnd(desk, dealer);
              if (callback instanceof Object) {
                callback(undefined, undefined);
              }
              return;
            }

            desk.beforeCardPlay = desk.cardBeforeWildDraw4;
            desk.drawDesk = drawDesk;
            desk.revealDesk = revealDesk;
            cardDraws = cardDraws.concat(drawCards);
            desk.cardOfPlayer[beforePlayer] = cardOfBeforePlayer.concat(cardDraws);
            desk.cardAddOn = 0;
            desk.mustCallDrawCard = false;
            desk.cardBeforeWildDraw4 = undefined;
            desk.noPlayCount = 0;
            clearTimeout((<any>global)[player]);
            await redisClient.set(dealer, JSON.stringify(desk));

            // create activity: challenge
            const dataCb = {
              challenger: player,
              target: beforePlayer,
              is_challenge: true,
              is_challenge_success: isChallengeSuccessfully,
            };
            activityService.create({
              event: SocketConst.EMIT.CHALLENGE,
              dealer,
              player: dataCb.challenger,
              turn: desk.turn,
              contents: {
                target: dataCb.target,
                is_challenge: dataCb.is_challenge,
                result: {
                  is_challenge_success: isChallengeSuccessfully,
                  player: dataCb.target,
                  cards_receive: cardDraws,
                },
                number_turn_play: desk.numberTurnPlay,
              },
            } as any);

            SocketService.broadcastChallenge(dealer, dataCb);
            await BlueBird.delay(AppConst.TIMEOUT_DELAY);

            const socketIdOfBeforePlayer = await redisClient.get(
              `${AppObject.REDIS_PREFIX.PLAYER}:${beforePlayer}`,
            );
            SocketService.sendCardToPlayer(socketIdOfBeforePlayer, beforePlayer, cardDraws);
            await BlueBird.delay(AppConst.TIMEOUT_DELAY);

            // determined next player
            await nextPlayerAction(desk, dealer, data.is_challenge, isChallengeSuccessfully);

            if (callback instanceof Object) {
              callback(undefined, dataCb);
            }

            return;
          } else {
            console.log(
              `[LogDebug] Event ${SocketConst.EMIT.CHALLENGE} isChallengeSuccessfully false`,
            );
            const { drawDesk, revealDesk, drawCards } = CommonService.drawCard(
              desk,
              AppConst.CARD_DRAW_CHALLENGE_FAILED,
            );
            if (drawCards.length < AppConst.CARD_DRAW_CHALLENGE_FAILED) {
              turnEnd(desk, dealer);
              if (callback instanceof Object) {
                callback(undefined, undefined);
              }
              return;
            }

            desk.drawDesk = drawDesk;
            desk.revealDesk = revealDesk;
            const cardDraws: Card[] = drawCards;
            desk.cardOfPlayer[player] = desk.cardOfPlayer[player].concat(cardDraws);
            desk.cardAddOn = 0;
            desk.mustCallDrawCard = false;
            desk.beforePlayer = player;
            desk.cardBeforeWildDraw4 = undefined;
            desk.noPlayCount = 0;
            desk.timeout[player] = false;
            clearTimeout((<any>global)[player]);
            await redisClient.set(dealer, JSON.stringify(desk));

            // create activity: challenge
            const dataCb = {
              challenger: player,
              target: beforePlayer,
              is_challenge: true,
              is_challenge_success: isChallengeSuccessfully,
            };
            activityService.create({
              event: SocketConst.EMIT.CHALLENGE,
              dealer,
              player: dataCb.challenger,
              turn: desk.turn,
              contents: {
                target: dataCb.target,
                is_challenge: dataCb.is_challenge,
                result: {
                  is_challenge_success: isChallengeSuccessfully,
                  player: dataCb.challenger,
                  cards_receive: cardDraws,
                },
                number_turn_play: desk.numberTurnPlay,
              },
            } as any);

            SocketService.broadcastChallenge(dealer, dataCb);
            await BlueBird.delay(AppConst.TIMEOUT_DELAY);

            SocketService.sendCardToPlayer(socket.id, player, cardDraws);

            // determined next player
            await nextPlayerAction(desk, dealer, data.is_challenge, isChallengeSuccessfully);

            if (callback instanceof Object) {
              callback(undefined, dataCb);
            }

            return;
          }
        } else {
          console.log(`[LogDebug] Event ${SocketConst.EMIT.CHALLENGE} no Challenge`);

          // create activity: challenge
          const dataCb = {
            challenger: player,
            is_challenge: false,
          };
          activityService.create({
            event: SocketConst.EMIT.CHALLENGE,
            dealer,
            player: dataCb.challenger,
            turn: desk.turn,
            contents: {
              target: beforePlayer,
              is_challenge: dataCb.is_challenge,
              number_turn_play: desk.numberTurnPlay,
            },
          } as any);

          SocketService.broadcastChallenge(dealer, dataCb);
          await BlueBird.delay(AppConst.TIMEOUT_DELAY);

          // determined next player
          await nextPlayerAction(desk, dealer, data.is_challenge);

          if (callback instanceof Object) {
            callback(undefined, dataCb);
          }

          return;
        }
      } catch (err) {
        CommonService.handleError(err, callback);
      }
    },
  );

  socket.on(
    SocketConst.EMIT.POINTED_NOT_SAY_UNO,
    async (data: PointedNotSayUno, callback: CallbackWithData<any>) => {
      console.log(`[LogDebug] Event ${SocketConst.EMIT.POINTED_NOT_SAY_UNO}`);
      console.log(data);
      try {
        if ((APP_CONFIG.ENV.NAME as Environment) !== Environment.test) {
          await BlueBird.delay(AppConst.TIMEOUT_DELAY);
        }

        const playerPointed = data.target;
        const player = await redisClient.get(`${AppObject.REDIS_PREFIX.PLAYER}:${socket.id}`);
        redisClient.set(
          `${AppObject.REDIS_PREFIX.PLAYER}:${player}`,
          socket.id,
          'EX',
          AppConst.REDIS_EXPIRE_TIME,
        );

        const dealer = await redisClient.get(
          `${AppObject.REDIS_PREFIX.ROOM}:${player}:${socket.id}`,
        );
        const socketIds: any = (await SocketService.getAllClientOfRoom(dealer)) || [];
        if (CommonService.canContinue(dealer, socketIds)) {
          const error = new BaseError({
            message: AppConst.NUMBER_OF_SOCKET_CLIENT_JOIN_DEALER_LOWER_TWO,
          });
          CommonService.handleError(error, callback);
          socket.disconnect(true);
          return;
        }

        const desk: Desk = JSON.parse(await redisClient.get(dealer));
        if (desk.restrictInterrupt) {
          const error = new BaseError({
            message: AppConst.RESUTRICT_INTERRUPT,
          });
          CommonService.handleError(error, callback);
          return;
        }

        // create activity regardless of errors: pointed-not-say-uno
        if (desk.yellUno[playerPointed]) {
          activityService.create({
            event: SocketConst.EMIT.POINTED_NOT_SAY_UNO,
            dealer,
            player,
            turn: desk.turn,
            contents: {
              target: playerPointed,
              number_turn_play: desk.numberTurnPlay,
              have_say_uno: true,
            },
          } as any);
        } else {
          // console.log(`[LogDebug] Event ${SocketConst.EMIT.POINTED_NOT_SAY_UNO} ${playerPointed} forgot say uno.`);
          // create activity regardless of errors: pointed-not-say-uno
          activityService.create({
            event: SocketConst.EMIT.POINTED_NOT_SAY_UNO,
            dealer,
            player,
            turn: desk.turn,
            contents: {
              target: data.target,
              number_turn_play: desk.numberTurnPlay,
              have_say_uno: false,
            },
          } as any);
        }

        if (!data.target) {
          await handleError(
            socket,
            player,
            dealer,
            desk,
            AppConst.CARD_PUNISH,
            new BaseError({ message: AppConst.PLAYER_NAME_IS_REQUIRED }),
            callback,
            false,
          );
          return;
        }

        const players = desk.players || [];
        if (players.indexOf(playerPointed) === -1) {
          await handleError(
            socket,
            player,
            dealer,
            desk,
            AppConst.CARD_PUNISH,
            new BaseError({ message: AppConst.PLAYER_NAME_INVALID }),
            callback,
            false,
          );
          return;
        }

        const cardOfPlayerPointed = desk.cardOfPlayer[playerPointed];
        if (cardOfPlayerPointed.length !== 1) {
          await handleError(
            socket,
            player,
            dealer,
            desk,
            AppConst.CARD_PUNISH,
            new BaseError({ message: AppConst.CAN_NOT_POINTED_NOT_SAY_UNO }),
            callback,
            false,
          );
          return;
        }

        if (desk.yellUno[playerPointed]) {
          const dataCb = {
            pointer: player,
            target: playerPointed,
            have_say_uno: true,
          };
          SocketService.broadcastPointedNotSayUno(dealer, data);
          socket.broadcast.to(dealer).emit(SocketConst.EMIT.POINTED_NOT_SAY_UNO, dataCb);

          if (callback instanceof Object) {
            callback(undefined, dataCb);
          }

          return;
        }

        const dataCb = {
          player: playerPointed,
          have_say_uno: false,
        };

        await handlePenalty(
          socket,
          data.target,
          dealer,
          desk,
          AppConst.CARD_PUNISH,
          new BaseError({ message: AppConst.DID_NOT_SAY_UNO }),
          false,
        );

        await BlueBird.delay(AppConst.TIMEOUT_DELAY);
        SocketService.broadcastPointedNotSayUno(dealer, dataCb);

        if (callback instanceof Object) {
          callback(undefined, dataCb);
        }

        return;
      } catch (err) {
        CommonService.handleError(err, callback);
      }
    },
  );

  socket.on(
    SocketConst.EMIT.SPECIAL_LOGIC,
    async (data: SpecialLogic, callback: CallbackWithData<any>) => {
      console.log(`[LogDebug] Event ${SocketConst.EMIT.SPECIAL_LOGIC}`);
      console.log(data);

      try {
        if ((APP_CONFIG.ENV.NAME as Environment) !== Environment.test) {
          await BlueBird.delay(AppConst.TIMEOUT_DELAY);
        }

        const player = await redisClient.get(`${AppObject.REDIS_PREFIX.PLAYER}:${socket.id}`);
        redisClient.set(
          `${AppObject.REDIS_PREFIX.PLAYER}:${player}`,
          socket.id,
          'EX',
          AppConst.REDIS_EXPIRE_TIME,
        );

        const dealer = await redisClient.get(
          `${AppObject.REDIS_PREFIX.ROOM}:${player}:${socket.id}`,
        );
        const socketIds: any = (await SocketService.getAllClientOfRoom(dealer)) || [];
        if (CommonService.canContinue(dealer, socketIds)) {
          const error = new BaseError({
            message: AppConst.NUMBER_OF_SOCKET_CLIENT_JOIN_DEALER_LOWER_TWO,
          });
          CommonService.handleError(error, callback);
          socket.disconnect(true);
          return;
        }

        const desk: Desk = JSON.parse(await redisClient.get(dealer));
        if (desk.restrictInterrupt) {
          const error = new BaseError({
            message: AppConst.RESUTRICT_INTERRUPT,
          });
          CommonService.handleError(error, callback);
          return;
        }

        // create activity regardless of errors: special-logic
        activityService.create({
          event: SocketConst.EMIT.SPECIAL_LOGIC,
          dealer,
          player,
          turn: desk.turn,
          contents: {
            title: data.title,
            number_turn_play: desk.numberTurnPlay,
          },
        } as any);

        if (!data.title) {
          await handleError(
            socket,
            player,
            dealer,
            desk,
            AppConst.CARD_PUNISH,
            new BaseError({ message: AppConst.PARAM_TITLE_INVALID }),
            callback,
            false,
          );
          return;
        }
        if (data.title && data.title.length > AppConst.MAX_SPLECIAL_LOGIC_NAME_LENGTH) {
          await handleError(
            socket,
            player,
            dealer,
            desk,
            AppConst.CARD_PUNISH,
            new BaseError({ message: AppConst.SPLECIAL_LOGIC_TITLE_TOO_LONG }),
            callback,
            false,
          );
          return;
        }

        if (desk.specialLogic[player] >= AppConst.MAX_SPECIAL_LOGIC) {
          if (callback instanceof Object) {
            callback(undefined, data);
          }
          return;
        }

        if (!desk.specialLogic || !desk.specialLogic[player]) {
          desk.specialLogic[player] = 0;
        }
        desk.specialLogic[player]++;
        await redisClient.set(dealer, JSON.stringify(desk));

        if (callback instanceof Object) {
          callback(undefined, data);
        }

        return;
      } catch (err) {
        CommonService.handleError(err, callback);
      }
    },
  );

  socket.on('disconnect', async function () {
    console.log(`[LogDebug] ${socket.id} disconnect.`);

    // remove player from room when client disconnect
    const playerName = await redisClient.get(`${AppObject.REDIS_PREFIX.PLAYER}:${socket.id}`);
    const dealerName = await redisClient.get(
      `${AppObject.REDIS_PREFIX.ROOM}:${playerName}:${socket.id}`,
    );
    if (dealerName && playerName) {
      const dealer = await dealerService.detailByCondition({ name: dealerName });
      if (dealer) {
        if ((dealer.status as StatusGame) === StatusGame.NEW) {
          const players = dealer.players || [];
          const newPlayers = remove(players, (player) => {
            return player !== playerName;
          });
          await dealerService.updateByCondition({
            conditions: { _id: dealer._id },
            data: {
              $set: { players: newPlayers },
            },
          });
        }

        // create activity: disconnect
        activityService.create({
          event: 'disconnect',
          dealer: dealerName,
          player: playerName,
          contents: socket.id,
        });
      }
    }

    const keyDealerPattern = `${AppObject.REDIS_PREFIX.ROOM}:${playerName}:*`;
    let keys = await redisClient.keys(keyDealerPattern);
    const keyPlayerPattern = `${AppObject.REDIS_PREFIX.PLAYER}:${playerName}:*`;
    keys = keys.concat(await redisClient.keys(keyPlayerPattern));
    redisClient.del(`${AppObject.REDIS_PREFIX.PLAYER}:${playerName}`);
    redisClient.del(`${AppObject.REDIS_PREFIX.PLAYER}:${socket.id}`);
    keys.forEach((key) => {
      redisClient.del(key);
    });
  });
});

export default 'socketServer';
