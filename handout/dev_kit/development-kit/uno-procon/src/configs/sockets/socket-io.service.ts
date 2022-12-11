import * as SocketIO from 'socket.io';

import { SocketConst } from './socket.const';
import { Card, Desk, DrawReason, Special, WhiteWild } from '../../commons/consts/app.enum';
export class SocketService {
  public static io = (<any>global).__IO as SocketIO.Server;

  public static handlePlayer(_: SocketIO.Socket, next: (err?: any) => void) {
    return next();
  }

  public static async getAllClientOfRoom(room: string) {
    return new Promise((resolve) => {
      SocketService.io
        .of('/')
        .in(room)
        .clients((error: any, clients: any) => {
          resolve(clients);
        });
    });
  }

  public static getCardCountOfPlayers = (desk: Desk) => {
    const numberCardOfPlayer: any = {};
    const players: string[] = desk.players || [];
    const cardOfPlayer = desk.cardOfPlayer;
    for (const player of players) {
      numberCardOfPlayer[player] = cardOfPlayer[player].length;
    }
    return numberCardOfPlayer;
  };

  public static getDrawReason = (desk: Desk, player: string): DrawReason => {
    let drawReason = DrawReason.NOTING;
    if (desk.mustCallDrawCard) {
      if (desk.activationWhiteWild && desk.activationWhiteWild[player] > 0) {
        drawReason = DrawReason.BIND_2;
      } else if (desk.cardAddOn > 0) {
        if (desk.beforeCardPlay.special === Special.DRAW_2) {
          drawReason = DrawReason.DRAW_2;
        } else if (desk.beforeCardPlay.special === Special.WILD_DRAW_4) {
          drawReason = DrawReason.WILD_DRAW_4;
        }
      }
    }
    return drawReason;
  };

  public static sendCardToPlayer(
    socketId: string,
    player: string,
    cards: Card[],
    isPlenalty = false,
  ) {
    const _sock = SocketService.io.of('/').adapter.nsp.sockets[socketId];
    _sock.emit(SocketConst.EMIT.RECEIVER_CARD, {
      player,
      cards_receive: cards,
      is_penalty: isPlenalty,
    });

    return;
  }

  public static sendCardShuffleWild(socketId: string, player: string, cards: Card[]) {
    const _sock = SocketService.io.of('/').adapter.nsp.sockets[socketId];
    _sock.emit(SocketConst.EMIT.SHUFFLE_WILD, {
      player,
      cards_receive: cards,
    });

    return;
  }

  public static broadcastFirstPlayer(
    room: string,
    player: string,
    card: Card,
    playOrder: string[],
    totalTurn: number,
    whiteWild?: WhiteWild,
  ) {
    SocketService.io.of('/').to(room).emit(SocketConst.EMIT.FIRST_PLAYER, {
      first_player: player,
      first_card: card,
      play_order: playOrder,
      total_turn: totalTurn,
      white_wild: whiteWild,
    });
    return;
  }

  public static async broadcastChoseColorOfWild(socketId: string, player: string) {
    const _sock = SocketService.io.of('/').adapter.nsp.sockets[socketId];
    _sock.emit(SocketConst.EMIT.COLOR_OF_WILD, {
      player: player,
    });

    return;
  }

  public static broadcastNextPlayer(
    desk: Desk,
    socketId: string,
    player: string,
    card: Card,
    mustCallDrawCard?: boolean,
  ) {
    const _sock = SocketService.io.of('/').adapter.nsp.sockets[socketId];
    _sock.emit(SocketConst.EMIT.NEXT_PLAYER, {
      next_player: player,
      before_player: desk.beforePlayer,
      card_before: card,
      card_of_player: desk.cardOfPlayer[player],
      must_call_draw_card: String(mustCallDrawCard) === 'true',
      draw_reason: SocketService.getDrawReason(desk, player),
      turn_right: desk.turnRight,
      number_card_play: desk.numberCardPlay,
      number_turn_play: desk.numberTurnPlay,
      number_card_of_player: SocketService.getCardCountOfPlayers(desk),
    });
    return;
  }

  public static getSocketById(socketId: string) {
    const _sock = SocketService.io.of('/').adapter.nsp.sockets[socketId];

    return _sock;
  }

  public static broadcastChallenge(room: string, data: any) {
    SocketService.io.of('/').to(room).emit(SocketConst.EMIT.CHALLENGE, data);

    return;
  }

  public static broadcastFinishTurn(
    room: string,
    winner: string,
    desk: Desk,
    score: { [key: string]: number },
  ) {
    SocketService.io.of('/').to(room).emit(SocketConst.EMIT.FINISH_TURN, {
      turn_no: desk.turn,
      winner,
      score,
    });

    return;
  }

  public static broadcastFinishGame(
    room: string,
    winner: string,
    turnWin: number,
    order: { [key: string]: number },
    score: { [key: string]: number },
  ) {
    SocketService.io.of('/').to(room).emit(SocketConst.EMIT.FINISH_GAME, {
      winner,
      turn_win: turnWin,
      order,
      total_score: score,
    });

    return;
  }

  public static broadcastSayUnoAndPlayCard(room: string, data: any) {
    SocketService.io.of('/').to(room).emit(SocketConst.EMIT.SAY_UNO_AND_PLAY_CARD, data);

    return;
  }

  public static broadcastPlayCard(room: string, data: any) {
    SocketService.io.of('/').to(room).emit(SocketConst.EMIT.PLAY_CARD, data);

    return;
  }

  public static broadcastDrawCard(room: string, data: any) {
    SocketService.io.of('/').to(room).emit(SocketConst.EMIT.DRAW_CARD, data);
    return;
  }

  public static broadcastPlayDrawCard(room: string, data: any) {
    SocketService.io.of('/').to(room).emit(SocketConst.EMIT.PLAY_DRAW_CARD, data);

    return;
  }

  public static broadcastPointedNotSayUno(room: string, data: any) {
    SocketService.io.of('/').to(room).emit(SocketConst.EMIT.POINTED_NOT_SAY_UNO, data);

    return;
  }
}
