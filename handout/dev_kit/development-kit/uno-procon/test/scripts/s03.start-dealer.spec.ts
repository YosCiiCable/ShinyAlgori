import * as chai from 'chai';
import * as BlueBird from 'bluebird';
import * as IOClient from 'socket.io-client';
import * as jsonSchema from 'chai-json-schema';
import * as shallowDeepEqual from 'chai-shallow-deep-equal';
import { RequestBuilder } from '../helpers/request-builder';
import Consts from '../helpers/consts';
import StaticValues from '../helpers/static-values';
import { StatusGame } from '../../src/commons/consts/app.enum';
import { CommonService } from '../../src/api/commons/common.service';
import { DealerService } from '../../src/api/dealer/dealer.service';
const dealerService = new DealerService();

const request = new RequestBuilder('/admin/dealer');

chai.use(shallowDeepEqual);
chai.use(jsonSchema);

describe(`Admin start Dealer`, () => {
  describe(`Admin start Dealer - successfully`, () => {
    before(async () => {
      await CommonService.resetDb();
      const newDealer = await dealerService.create({
        name: Consts.DEALER_1,
        players: [],
        status: StatusGame.NEW,
        totalTurn: 1000,
      } as any);
      StaticValues.DEALER_ID_1 = newDealer._id;
      const client1 = IOClient.connect(`http://${Consts.SOCKET.HOST}:${Consts.SOCKET.PORT}`, {
        transports: ['websocket'],
        forceNew: true,
      });
      const dataJoinRoom1 = {
        room_name: Consts.DEALER_1,
        player: Consts.PLAYER_1_NAME,
        team: Consts.TEAM_A,
      };
      client1.emit(Consts.SOCKET.EVENT.JOIN_ROOM, dataJoinRoom1);
      await BlueBird.delay(10 * Consts.TIME_DELAY);

      const client2 = IOClient.connect(`http://${Consts.SOCKET.HOST}:${Consts.SOCKET.PORT}`, {
        transports: ['websocket'],
        forceNew: true,
      });
      const dataJoinRoom2 = {
        room_name: Consts.DEALER_1,
        player: Consts.PLAYER_2_NAME,
        team: Consts.TEAM_B,
      };
      client2.emit(Consts.SOCKET.EVENT.JOIN_ROOM, dataJoinRoom2);
      await BlueBird.delay(10 * Consts.TIME_DELAY);

      const client3 = IOClient.connect(`http://${Consts.SOCKET.HOST}:${Consts.SOCKET.PORT}`, {
        transports: ['websocket'],
        forceNew: true,
      });
      const dataJoinRoom3 = {
        room_name: Consts.DEALER_1,
        player: Consts.PLAYER_3_NAME,
        team: Consts.TEAM_C,
      };
      client3.emit(Consts.SOCKET.EVENT.JOIN_ROOM, dataJoinRoom3);
      await BlueBird.delay(10 * Consts.TIME_DELAY);

      const client4 = IOClient.connect(`http://${Consts.SOCKET.HOST}:${Consts.SOCKET.PORT}`, {
        transports: ['websocket'],
        forceNew: true,
      });
      const dataJoinRoom4 = {
        room_name: Consts.DEALER_1,
        player: Consts.PLAYER_4_NAME,
        team: Consts.TEAM_D,
      };
      client4.emit(Consts.SOCKET.EVENT.JOIN_ROOM, dataJoinRoom4);
      await BlueBird.delay(10 * Consts.TIME_DELAY);

      const client5 = IOClient.connect(`http://${Consts.SOCKET.HOST}:${Consts.SOCKET.PORT}`, {
        transports: ['websocket'],
        forceNew: true,
      });
      const dataJoinRoom5 = {
        room_name: Consts.DEALER_1,
        player: Consts.PLAYER_5_NAME,
        team: Consts.TEAM_E,
      };
      client5.emit(Consts.SOCKET.EVENT.JOIN_ROOM, dataJoinRoom5);
      await BlueBird.delay(10 * Consts.TIME_DELAY);
    });

    it(`s03-A-TC001: Admin start Dealer - successfully`, (done) => {
      request
        .post(`/${StaticValues.DEALER_ID_1}/start-dealer`)
        .expectStatus(200)
        .expectBody({
          data: {
            status: 'new',
          },
        })
        .end(done);
    });
  });

  describe(`Admin start Dealer - failed - Reason: Number of player join dealer invalid. Can not start dealer.`, () => {
    before(async () => {
      await CommonService.resetDb();
      const newDealer = await dealerService.create({
        name: Consts.DEALER_3,
        players: [],
        status: StatusGame.NEW,
        totalTurn: 1000,
      } as any);
      StaticValues.DEALER_ID_3 = newDealer._id;
      const client1 = IOClient.connect(`http://${Consts.SOCKET.HOST}:${Consts.SOCKET.PORT}`, {
        transports: ['websocket'],
        forceNew: true,
      });
      const dataJoinRoom1 = {
        room_name: Consts.DEALER_3,
        player: Consts.PLAYER_1_NAME,
        team: Consts.TEAM_A,
      };
      client1.emit(Consts.SOCKET.EVENT.JOIN_ROOM, dataJoinRoom1);
      await BlueBird.delay(Consts.TIME_DELAY);

      // const client2 = IOClient.connect(
      //   `http://${Consts.SOCKET.HOST}:${Consts.SOCKET.PORT}`,
      //   {
      //     transports: ['websocket'],
      //     query: { player: Consts.PLAYER_2 },
      //     forceNew: true
      //   }
      // );
      // const dataJoinRoom2 = {
      //   room_name: Consts.DEALER_3,
      //   player: Consts.PLAYER_2
      // };
      // client2.emit(Consts.SOCKET.EVENT.JOIN_ROOM, dataJoinRoom2);
      // await BlueBird.delay(Consts.TIME_DELAY);

      // const client3 = IOClient.connect(
      //   `http://${Consts.SOCKET.HOST}:${Consts.SOCKET.PORT}`,
      //   {
      //     transports: ['websocket'],
      //     query: { player: Consts.PLAYER_3 },
      //     forceNew: true
      //   }
      // );
      // const dataJoinRoom3 = {
      //   room_name: Consts.DEALER_3,
      //   player: Consts.PLAYER_3
      // };
      // client3.emit(Consts.SOCKET.EVENT.JOIN_ROOM, dataJoinRoom3);
      // await BlueBird.delay(Consts.TIME_DELAY);
    });

    it(`s03-A-TC002: Admin start Dealer - failed - Reason: Number of player join dealer invalid. Can not start dealer.`, (done) => {
      request.post(`/${StaticValues.DEALER_ID_3}/start-dealer`).expectStatus(400).end(done);
    });
  });
});
