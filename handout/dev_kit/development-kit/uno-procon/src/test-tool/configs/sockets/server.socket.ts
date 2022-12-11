import * as redisAdapter from 'socket.io-redis';
import APP_CONFIG from '../../../configs/app.config';

import { TestToolSocketService } from './socket-io.service';
import { AppConst } from '../../../commons/consts/app.const';
import {
  ColorOfWild,
  JoinRoom,
  PlayCard,
  PointedNotSayUno,
  SayUnoAndPlayCard,
  SocketConst,
  SpecialLogic,
} from '../../../configs/sockets/socket.const';
import {
  Color,
  ARR_COLOR_OF_WILD,
  ARR_NUMBER,
  ARR_SPECIAL,
  ARR_COLOR,
  Special,
} from '../../../commons/consts/app.enum';
import { TestToolEventExpectedData } from '../../consts/test-tool.consts';
TestToolSocketService.io.adapter(
  redisAdapter({
    host: APP_CONFIG.ENV.DATABASE.REDIS.HOST,
    port: APP_CONFIG.ENV.DATABASE.REDIS.PORT,
  }),
);
let connectedSocket;
const testToolSocketServer = TestToolSocketService.io.of('/');
testToolSocketServer.use(TestToolSocketService.handlePlayer);

type CallbackWithData<T> = (err: any, data: T) => void;

function catchError(event, error, data, callback) {
  if (callback instanceof Object) {
    callback(error, undefined);
  }
  const expected = TestToolEventExpectedData[event];
  connectedSocket.broadcast.emit(event, { error, expected, actual: data });
  return;
}

testToolSocketServer.on('connection', function (socket) {
  connectedSocket = socket;
  // event
  socket.on(SocketConst.EMIT.JOIN_ROOM, async (data: JoinRoom, callback: CallbackWithData<any>) => {
    console.log(`[LogDebug] Test Tool Event ${SocketConst.EMIT.JOIN_ROOM}`);
    console.log(data);
    // validate data
    if (!data.room_name || data.room_name === '') {
      return catchError(
        SocketConst.EMIT.JOIN_ROOM,
        { message: AppConst.ROOM_NAME_IS_REQUIRED },
        data,
        callback,
      );
    }
    if (!data.player) {
      return catchError(
        SocketConst.EMIT.JOIN_ROOM,
        { message: AppConst.PLAYER_NAME_IS_REQUIRED },
        data,
        callback,
      );
    }
    if (data.player && data.player.length > AppConst.MAX_NAME_LENGTH) {
      return catchError(
        SocketConst.EMIT.JOIN_ROOM,
        { message: AppConst.PLAYER_NAME_TOO_LONG },
        data,
        callback,
      );
    }
    socket.broadcast.emit(SocketConst.EMIT.JOIN_ROOM, { data });
    if (callback instanceof Object) {
      callback(undefined, {
        ...data,
      });
    }
  });

  socket.on(
    SocketConst.EMIT.COLOR_OF_WILD,
    async (data: ColorOfWild, callback: CallbackWithData<any>) => {
      console.log(`[LogDebug] Event ${SocketConst.EMIT.COLOR_OF_WILD}`);
      console.log(data);
      // validate data
      if (!data.color_of_wild) {
        return catchError(
          SocketConst.EMIT.COLOR_OF_WILD,
          { message: AppConst.COLOR_WILD_IS_REQUIRED },
          data,
          callback,
        );
      } else if (ARR_COLOR_OF_WILD.indexOf(data.color_of_wild as Color) === -1) {
        return catchError(
          SocketConst.EMIT.COLOR_OF_WILD,
          { message: AppConst.COLOR_WILD_INVALID },
          data,
          callback,
        );
      }
      socket.broadcast.emit(SocketConst.EMIT.COLOR_OF_WILD, { data });
    },
  );

  socket.on(SocketConst.EMIT.PLAY_CARD, async (data: PlayCard, callback: CallbackWithData<any>) => {
    console.log(`[LogDebug] Event ${SocketConst.EMIT.PLAY_CARD}`);
    console.log(data);
    if (!data || !data.card_play) {
      return catchError(
        SocketConst.EMIT.PLAY_CARD,
        { message: AppConst.CARD_PLAY_IS_REQUIRED },
        data,
        callback,
      );
    }
    const { card_play } = data;

    if (!card_play.number) {
      return catchError(
        SocketConst.EMIT.PLAY_CARD,
        { message: AppConst.PARAM_CARD_PLAY_INVALID },
        data,
        callback,
      );
    }

    if (!card_play.color) {
      return catchError(
        SocketConst.EMIT.PLAY_CARD,
        { message: AppConst.PARAM_CARD_PLAY_INVALID },
        data,
        callback,
      );
    }

    if (!card_play.number && card_play.number !== 0 && !card_play.special) {
      return catchError(
        SocketConst.EMIT.PLAY_CARD,
        { message: AppConst.PARAM_CARD_PLAY_INVALID },
        data,
        callback,
      );
    }

    if (card_play.special && ARR_SPECIAL.indexOf(card_play.special as Special) === -1) {
      return catchError(
        SocketConst.EMIT.PLAY_CARD,
        { message: AppConst.SPECIAL_CARD_PLAY_INVALID },
        data,
        callback,
      );
    }

    if (card_play.color && ARR_COLOR.indexOf(card_play.color as Color) === -1) {
      return catchError(
        SocketConst.EMIT.PLAY_CARD,
        { message: AppConst.COLOR_CARD_PLAY_INVALID },
        data,
        callback,
      );
    }

    if (
      (card_play.number || card_play.number === 0) &&
      ARR_NUMBER.indexOf(card_play.number) === -1
    ) {
      return catchError(
        SocketConst.EMIT.PLAY_CARD,
        { message: AppConst.NUMBER_CARD_PLAY_INVALID },
        data,
        callback,
      );
    }
    socket.broadcast.emit(SocketConst.EMIT.PLAY_CARD, { data });
  });

  socket.on(SocketConst.EMIT.DRAW_CARD, async (data: any) => {
    console.log(`[LogDebug] Event ${SocketConst.EMIT.DRAW_CARD}`);
    console.log(data);
    socket.broadcast.emit(SocketConst.EMIT.DRAW_CARD, { data });
  });

  socket.on(
    SocketConst.EMIT.PLAY_DRAW_CARD,
    async (data: { is_play_card: boolean | string }, callback: CallbackWithData<any>) => {
      console.log(`[LogDebug] Event ${SocketConst.EMIT.PLAY_DRAW_CARD}`);
      console.log(data);
      if (!data || data.is_play_card === undefined) {
        return catchError(
          SocketConst.EMIT.PLAY_DRAW_CARD,
          { message: AppConst.IS_PLAY_CARD_IS_REQUIED },
          data,
          callback,
        );
      }
      if (data.is_play_card === 'True') {
        return catchError(
          SocketConst.EMIT.PLAY_DRAW_CARD,
          { message: AppConst.PARAM_IS_PLAY_CARD_INVALID },
          data,
          callback,
        );
      }
      socket.broadcast.emit(SocketConst.EMIT.PLAY_DRAW_CARD, { data });
    },
  );

  socket.on(
    SocketConst.EMIT.SAY_UNO_AND_PLAY_CARD,
    async (data: SayUnoAndPlayCard, callback: CallbackWithData<any>) => {
      console.log(`[LogDebug] Event ${SocketConst.EMIT.SAY_UNO_AND_PLAY_CARD}`);
      console.log(data);
      if (!data || !data.card_play) {
        return catchError(
          SocketConst.EMIT.SAY_UNO_AND_PLAY_CARD,
          { message: AppConst.CARD_PLAY_IS_REQUIRED },
          data,
          callback,
        );
      }
      const { card_play } = data;

      if (!card_play.number) {
        return catchError(
          SocketConst.EMIT.SAY_UNO_AND_PLAY_CARD,
          { message: AppConst.PARAM_CARD_PLAY_INVALID },
          data,
          callback,
        );
      }

      if (!card_play.color) {
        return catchError(
          SocketConst.EMIT.SAY_UNO_AND_PLAY_CARD,
          { message: AppConst.PARAM_CARD_PLAY_INVALID },
          data,
          callback,
        );
      }

      if (!card_play.number && card_play.number !== 0 && !card_play.special) {
        return catchError(
          SocketConst.EMIT.SAY_UNO_AND_PLAY_CARD,
          { message: AppConst.PARAM_CARD_PLAY_INVALID },
          data,
          callback,
        );
      }

      if (card_play.special && ARR_SPECIAL.indexOf(card_play.special as Special) === -1) {
        return catchError(
          SocketConst.EMIT.SAY_UNO_AND_PLAY_CARD,
          { message: AppConst.SPECIAL_CARD_PLAY_INVALID },
          data,
          callback,
        );
      }

      if (card_play.color && ARR_COLOR.indexOf(card_play.color as Color) === -1) {
        return catchError(
          SocketConst.EMIT.SAY_UNO_AND_PLAY_CARD,
          { message: AppConst.COLOR_CARD_PLAY_INVALID },
          data,
          callback,
        );
      }

      if (
        (card_play.number || card_play.number === 0) &&
        ARR_NUMBER.indexOf(card_play.number) === -1
      ) {
        return catchError(
          SocketConst.EMIT.SAY_UNO_AND_PLAY_CARD,
          { message: AppConst.NUMBER_CARD_PLAY_INVALID },
          data,
          callback,
        );
      }
      socket.broadcast.emit(SocketConst.EMIT.SAY_UNO_AND_PLAY_CARD, { data });
    },
  );

  socket.on(
    SocketConst.EMIT.POINTED_NOT_SAY_UNO,
    async (data: PointedNotSayUno, callback: CallbackWithData<any>) => {
      console.log(`[LogDebug] Event ${SocketConst.EMIT.POINTED_NOT_SAY_UNO}`);
      console.log(data);
      if (!data || !data.target) {
        return catchError(
          SocketConst.EMIT.POINTED_NOT_SAY_UNO,
          { message: AppConst.PLAYER_NAME_IS_REQUIRED },
          data,
          callback,
        );
      }
      socket.broadcast.emit(SocketConst.EMIT.POINTED_NOT_SAY_UNO, { data });
    },
  );

  socket.on(
    SocketConst.EMIT.CHALLENGE,
    async (
      data: {
        is_challenge: boolean | string;
      },
      callback: CallbackWithData<any>,
    ) => {
      console.log(`[LogDebug] Event ${SocketConst.EMIT.CHALLENGE}`);
      console.log(data);
      if (!data || data.is_challenge === undefined) {
        return catchError(
          SocketConst.EMIT.CHALLENGE,
          { message: AppConst.IS_CHALLENGE_IS_REQUIED },
          data,
          callback,
        );
      }
      if (data.is_challenge === 'True') {
        return catchError(
          SocketConst.EMIT.CHALLENGE,
          { message: AppConst.IS_CHALLENGE_IS_REQUIED },
          data,
          callback,
        );
      }
      socket.broadcast.emit(SocketConst.EMIT.CHALLENGE, { data });
    },
  );

  socket.on(
    SocketConst.EMIT.SPECIAL_LOGIC,
    async (data: SpecialLogic, callback: CallbackWithData<any>) => {
      console.log(`[LogDebug] Event ${SocketConst.EMIT.SPECIAL_LOGIC}`);
      console.log(data);
      if (!data || !data.title) {
        return catchError(
          SocketConst.EMIT.SPECIAL_LOGIC,
          { message: AppConst.PARAM_TITLE_INVALID },
          data,
          callback,
        );
      }
      if (data.title.length > AppConst.MAX_SPLECIAL_LOGIC_NAME_LENGTH) {
        return catchError(
          SocketConst.EMIT.SPECIAL_LOGIC,
          { message: AppConst.SPLECIAL_LOGIC_TITLE_TOO_LONG },
          data,
          callback,
        );
      }
      socket.broadcast.emit(SocketConst.EMIT.SPECIAL_LOGIC, { data });
    },
  );

  socket.on('disconnect', async function () {
    console.log(`[LogDebug] Test Tool ${socket.id} disconnect.`);
  });
});

export default 'testToolSocketServer';
