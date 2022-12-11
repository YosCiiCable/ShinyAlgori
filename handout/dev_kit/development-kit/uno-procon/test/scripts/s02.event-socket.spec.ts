import * as chai from 'chai';
import * as BlueBird from 'bluebird';
import * as IOClient from 'socket.io-client';
import * as jsonSchema from 'chai-json-schema';
import * as shallowDeepEqual from 'chai-shallow-deep-equal';
import Consts from '../helpers/consts';
import StaticValues from '../helpers/static-values';
import { Color, Desk, Special, StatusGame, WhiteWild } from '../../src/commons/consts/app.enum';
import { CommonService } from '../../src/api/commons/common.service';
import { DealerService } from '../../src/api/dealer/dealer.service';
import { PlayerService } from '../../src/api/player/player.service';
const dealerService = new DealerService();
const playerService = new PlayerService();

let client1: any;
let client2: any;
let client3: any;
let client4: any;
chai.use(shallowDeepEqual);
chai.use(jsonSchema);

describe('Test Event Socket', () => {
  before(async () => {
    const newDealer = await dealerService.create({
      name: Consts.DEALER_2,
      players: [],
      status: StatusGame.NEW,
      totalTurn: Consts.TOTAL_TURN,
      whiteWild: Consts.WHITE_WILD.BIND_2,
    } as any);
    StaticValues.DEALER_ID = newDealer._id;

    await playerService.create({
      _id: Consts.PLAYER_1,
      name: Consts.PLAYER_1_NAME,
      team: Consts.TEAM_A,
    } as any);
    await playerService.create({
      _id: Consts.PLAYER_2,
      name: Consts.PLAYER_2_NAME,
      team: Consts.TEAM_B,
    } as any);
    await playerService.create({
      _id: Consts.PLAYER_3,
      name: Consts.PLAYER_3_NAME,
      team: Consts.TEAM_C,
    } as any);
    await playerService.create({
      _id: Consts.PLAYER_4,
      name: Consts.PLAYER_4_NAME,
      team: Consts.TEAM_D,
    } as any);
  });

  describe(`Test event ${Consts.SOCKET.EVENT.JOIN_ROOM}`, () => {
    it(`s02-A-TC001: Player 1 join Dealer - successfully`, (done) => {
      client1 = IOClient.connect(`http://${Consts.SOCKET.HOST}:${Consts.SOCKET.PORT}`, {
        transports: ['websocket'],
        forceNew: true,
      });
      const dataJoinRoom = {
        room_name: Consts.DEALER_2,
        player: Consts.PLAYER_1_NAME,
        team: Consts.TEAM_A,
      };
      client1.emit(Consts.SOCKET.EVENT.JOIN_ROOM, dataJoinRoom, function (err, res) {
        chai.expect(err).to.equal(null);
        chai.expect(res.room_name).to.equal(dataJoinRoom.room_name);
        chai.expect(res.player).to.equal(dataJoinRoom.player);
        chai.expect(res.team).to.equal(dataJoinRoom.team);
        done();
      });
    });

    it(`s02-A-TC002: Player 2 join Dealer - successfully`, (done) => {
      client2 = IOClient.connect(`http://${Consts.SOCKET.HOST}:${Consts.SOCKET.PORT}`, {
        transports: ['websocket'],
        forceNew: true,
      });
      const dataJoinRoom = {
        room_name: Consts.DEALER_2,
        player: Consts.PLAYER_2_NAME,
        team: Consts.TEAM_B,
      };
      client2.emit(Consts.SOCKET.EVENT.JOIN_ROOM, dataJoinRoom, function (err, res) {
        chai.expect(err).to.equal(null);
        chai.expect(res.room_name).to.equal(dataJoinRoom.room_name);
        chai.expect(res.player).to.equal(dataJoinRoom.player);
        done();
      });
    });

    it(`s02-A-TC003: Player 3 join Dealer - successfully`, (done) => {
      client3 = IOClient.connect(`http://${Consts.SOCKET.HOST}:${Consts.SOCKET.PORT}`, {
        transports: ['websocket'],
        forceNew: true,
      });
      const dataJoinRoom = {
        room_name: Consts.DEALER_2,
        player: Consts.PLAYER_3_NAME,
        team: Consts.TEAM_C,
      };
      client3.emit(Consts.SOCKET.EVENT.JOIN_ROOM, dataJoinRoom, function (err, res) {
        chai.expect(err).to.equal(null);
        chai.expect(res.room_name).to.equal(dataJoinRoom.room_name);
        chai.expect(res.player).to.equal(dataJoinRoom.player);
        done();
      });
    });

    it(`s02-A-TC004: Player 4 join Dealer - successfully`, (done) => {
      client4 = IOClient.connect(`http://${Consts.SOCKET.HOST}:${Consts.SOCKET.PORT}`, {
        transports: ['websocket'],
        forceNew: true,
      });
      const dataJoinRoom = {
        room_name: Consts.DEALER_2,
        player: Consts.PLAYER_4_NAME,
        team: Consts.TEAM_D,
      };
      client4.emit(Consts.SOCKET.EVENT.JOIN_ROOM, dataJoinRoom, function (err, res) {
        chai.expect(err).to.equal(null);
        chai.expect(res.room_name).to.equal(dataJoinRoom.room_name);
        chai.expect(res.player).to.equal(dataJoinRoom.player);
        done();
      });
    });

    it(`s02-A-TC006: More Player 1 join Dealer - failed Reason: Player name duplicate`, (done) => {
      const client = IOClient.connect(`http://${Consts.SOCKET.HOST}:${Consts.SOCKET.PORT}`, {
        transports: ['websocket'],
        forceNew: true,
      });
      const dataJoinRoom = {
        room_name: Consts.DEALER_2,
        player: Consts.PLAYER_1_NAME,
        team: Consts.TEAM_A,
      };
      client.emit(Consts.SOCKET.EVENT.JOIN_ROOM, dataJoinRoom, function (err, res) {
        chai.expect(err.message).to.equal('Player name duplicate.');
        chai.expect(err.code).to.equal('bad_request');
        chai.expect(err.status).to.equal(400);
        chai.expect(res).to.equal(null);
        done();
      });
    });

    it(`s02-A-TC007: Player 5 join Dealer - failed Reason: Room name is required`, (done) => {
      const client = IOClient.connect(`http://${Consts.SOCKET.HOST}:${Consts.SOCKET.PORT}`, {
        transports: ['websocket'],
        forceNew: true,
      });
      const dataJoinRoom = {
        player: Consts.PLAYER_5_NAME,
        team: Consts.TEAM_E,
      };
      client.emit(Consts.SOCKET.EVENT.JOIN_ROOM, dataJoinRoom, function (err, res) {
        chai.expect(err.message).to.equal('Room name is required.');
        chai.expect(err.code).to.equal('bad_request');
        chai.expect(err.status).to.equal(400);
        chai.expect(res).to.equal(null);
        done();
      });
    });

    it(`s02-A-TC008: Player 5 join Dealer - failed Reason: Player name is required`, (done) => {
      const client = IOClient.connect(`http://${Consts.SOCKET.HOST}:${Consts.SOCKET.PORT}`, {
        transports: ['websocket'],
        forceNew: true,
      });
      const dataJoinRoom = {
        room_name: Consts.DEALER_2,
        team: Consts.TEAM_A,
      };
      client.emit(Consts.SOCKET.EVENT.JOIN_ROOM, dataJoinRoom, function (err, res) {
        chai.expect(err.message).to.equal('Player name is required.');
        chai.expect(err.code).to.equal('bad_request');
        chai.expect(err.status).to.equal(400);
        chai.expect(res).to.equal(null);
        done();
      });
    });

    it(`s02-A-TC011: Player 1 join Dealer - failed Reason: Player name too long`, (done) => {
      const client = IOClient.connect(`http://${Consts.SOCKET.HOST}:${Consts.SOCKET.PORT}`, {
        transports: ['websocket'],
        forceNew: true,
      });
      const dataJoinRoom = {
        room_name: Consts.DEALER_2,
        player: '123456789012345678901234567890',
        team: Consts.PLAYER_1_NAME,
      };
      client.emit(Consts.SOCKET.EVENT.JOIN_ROOM, dataJoinRoom, async function (err, res) {
        chai.expect(err.message).to.equal('Player name too long.');
        chai.expect(err.code).to.equal('bad_request');
        chai.expect(err.status).to.equal(400);
        chai.expect(res).to.equal(null);
        await BlueBird.delay(5 * Consts.TIME_DELAY);
        done();
      });
    });
  });

  /* /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */

  /** Test Event Consts.SOCKET.EVENT.COLOR_OF_WILD */
  describe(`Test Event ${Consts.SOCKET.EVENT.COLOR_OF_WILD}`, () => {
    before(async () => {
      await dealerService.startDealer(StaticValues.DEALER_ID);
    });

    it(`s02-B-TC001: Player 1 chose color for Wild - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.BLACK,
          special: Special.WILD,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        isSkip: true,
        numberTurnPlay: 2,
        restrictInterrupt: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.COLOR_OF_WILD,
          {
            color_of_wild: Color.RED,
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(2 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.WILD);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(0);
      await Promise.resolve();
    });

    it(`s02-B-TC002: Player 1 chose color for Wild_draw_4 - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.BLACK,
          special: Special.WILD_DRAW_4,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        isSkip: true,
        restrictInterrupt: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.COLOR_OF_WILD,
          {
            color_of_wild: Color.YELLOW,
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(2 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.WILD_DRAW_4);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.YELLOW);
      chai.expect(desk.cardAddOn).to.equal(4);
      await Promise.resolve();
    });

    it(`s02-B-TC003: Player 1 chose color for Wild_shuffle - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.BLACK,
          special: Special.WILD_SHUFFLE,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        isSkip: true,
        restrictInterrupt: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.COLOR_OF_WILD,
          {
            color_of_wild: Color.YELLOW,
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(2 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.WILD_SHUFFLE);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.YELLOW);
      chai.expect(desk.cardAddOn).to.equal(0);
      await Promise.resolve();
    });

    it(`s02-B-TC004: Player 1 chose color for Wild_draw_4 - failed Reason: Color wild is required`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.BLACK,
          special: Special.WILD_DRAW_4,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        isSkip: true,
        restrictInterrupt: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(Consts.SOCKET.EVENT.COLOR_OF_WILD, {}, () => {
          resolve();
        });
      });
      await BlueBird.delay(5 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.WILD_DRAW_4);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.BLACK);
      chai.expect(desk.cardAddOn).to.equal(0);
      await Promise.resolve();
    });

    it(`s02-B-TC005: Player 1 chose color for Wild_draw_4 - failed Reason: Color wild invalid`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.BLACK,
          special: Special.WILD_DRAW_4,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        isSkip: true,
        restrictInterrupt: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.COLOR_OF_WILD,
          {
            color_of_wild: Color.BLACK,
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(5 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.WILD_DRAW_4);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.BLACK);
      chai.expect(desk.cardAddOn).to.equal(0);
      await Promise.resolve();
    });

    it(`s02-B-TC006: Player 1 chose color for Wild_draw_4 - failed Reason: Player chose color of wild invalid`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_3,
        nextPlayer: Consts.PLAYER_4,
        beforeCardPlay: {
          color: Color.BLACK,
          special: Special.WILD_DRAW_4,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        isSkip: true,
        restrictInterrupt: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.COLOR_OF_WILD,
          {
            color_of_wild: Color.RED,
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(5 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_4);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.WILD_DRAW_4);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.BLACK);
      chai.expect(desk.cardAddOn).to.equal(0);
      await Promise.resolve();
    });

    it(`s02-B-TC007: Player 1 chose color for Wild_draw_4 - failed Reason: Can not chose color of wild`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.YELLOW,
          special: Special.DRAW_2,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        isSkip: true,
        restrictInterrupt: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.COLOR_OF_WILD,
          {
            color_of_wild: Color.RED,
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(5 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.DRAW_2);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.YELLOW);
      chai.expect(desk.cardAddOn).to.equal(0);
      await Promise.resolve();
    });

    it(`s02-B-TC008: Player 1 chose color for Wild_draw_4 (Player 1 have 1 card) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.BLACK,
          special: Special.WILD,
        },
        cardOfPlayer: [],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        isSkip: true,
        restrictInterrupt: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.COLOR_OF_WILD,
          {
            color_of_wild: Color.RED,
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(5 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.turn).to.equal(2);
      chai.expect(desk.numberTurnPlay).to.equal(1);
      chai.expect(desk.numberCardPlay).to.equal(1);
      await Promise.resolve();
    });

    it(`s02-B-TC009: First player is Player 1, first card is Black Wild) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        firstPlayer: Consts.PLAYER_1,
        beforePlayer: Consts.PLAYER_1,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.BLACK,
          special: Special.WILD,
        },
        cardOfPlayer: [
          {
            color: Color.BLACK,
            special: Special.SKIP,
          },
          {
            color: Color.RED,
            number: 9,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        isSkip: true,
        numberTurnPlay: 1,
        restrictInterrupt: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.COLOR_OF_WILD,
          {
            color_of_wild: Color.RED,
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(3 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.firstPlayer).to.equal(Consts.PLAYER_1);
      chai.expect(desk.beforePlayer).to.equal(Consts.PLAYER_1);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.turn).to.equal(1);
      chai.expect(desk.numberTurnPlay).to.equal(2);
      chai.expect(desk.numberCardPlay).to.equal(1);
      await Promise.resolve();
    });

    it(`s02-B-TC010: Player 1 chose color for Wild - failed Reason: Already changed color`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          special: Special.WILD,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        isSkip: true,
        restrictInterrupt: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.COLOR_OF_WILD,
          {
            color_of_wild: Color.RED,
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(5 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.WILD);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(3);
      await Promise.resolve();
    });

    it(`s02-B-TC011: Player 1 plays black wild_draw_4 and wins - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.BLACK,
          special: Special.WILD_DRAW_4,
        },
        cardOfPlayer: [],
        cardAddOn: 0,
        yellUno: true,
        turnRight: true,
        mustCallDrawCard: false,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.COLOR_OF_WILD,
          {
            color_of_wild: Color.RED,
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(5 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.turn).to.equal(2); // 対戦終了済み
      await Promise.resolve();
    });
  });

  /* /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */

  /** Test Event Consts.SOCKET.EVENT.PLAY_CARD */
  describe(`Test Event ${Consts.SOCKET.EVENT.PLAY_CARD}`, () => {
    it(`s02-C-TC001: Player 1 play card Red 9 (before card Red 6) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          number: 6,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.RED,
            number: 9,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        isSkip: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.PLAY_CARD,
          {
            card_play: {
              color: Color.RED,
              number: 9,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(2 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.number).to.equal(9);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(0);
      await Promise.resolve();
    });

    it(`s02-C-TC002: Player 1 play card Red 0 (before card Red 6) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          number: 6,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.RED,
            number: 0,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        isSkip: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.PLAY_CARD,
          {
            card_play: {
              color: Color.RED,
              number: 0,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(2 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.number).to.equal(0);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(0);
      await Promise.resolve();
    });

    it(`s02-C-TC003: Player 1 play card Blue 5 (before card Red 5) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          number: 5,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.BLUE,
            number: 5,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        isSkip: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.PLAY_CARD,
          {
            card_play: {
              color: Color.BLUE,
              number: 5,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(2 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.number).to.equal(5);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.BLUE);
      chai.expect(desk.cardAddOn).to.equal(0);
      await Promise.resolve();
    });

    it(`s02-C-TC004: Player 1 play card Blue 5 (before card Blue Wild_shuffle) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.BLUE,
          special: Special.WILD_SHUFFLE,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.BLUE,
            number: 5,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        isSkip: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.PLAY_CARD,
          {
            card_play: {
              color: Color.BLUE,
              number: 5,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(2 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.number).to.equal(5);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.BLUE);
      chai.expect(desk.cardAddOn).to.equal(0);
      await Promise.resolve();
    });

    it(`s02-C-TC005: Player 1 play card Blue Skip (before card Blue 6) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.BLUE,
          number: 6,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        isSkip: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.PLAY_CARD,
          {
            card_play: {
              color: Color.BLUE,
              special: Special.SKIP,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(2 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_3);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.SKIP);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.BLUE);
      chai.expect(desk.cardAddOn).to.equal(0);
      await Promise.resolve();
    });

    it(`s02-C-TC006: Player 1 play card Blue Skip (before card Blue Reverse) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_2,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.BLUE,
          special: Special.REVERSE,
          // number: 6
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: false,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.PLAY_CARD,
          {
            card_play: {
              color: Color.BLUE,
              special: Special.SKIP,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(2 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_3);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.SKIP);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.BLUE);
      chai.expect(desk.turnRight).to.equal(false);
      chai.expect(desk.cardAddOn).to.equal(0);
      await Promise.resolve();
    });

    it(`s02-C-TC007: Player 1 play card Blue Skip (before card Red Skip) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_3,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          special: Special.SKIP,
          // number: 6,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        isSkip: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.PLAY_CARD,
          {
            card_play: {
              color: Color.BLUE,
              special: Special.SKIP,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(2 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_3);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.SKIP);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.BLUE);
      chai.expect(desk.cardAddOn).to.equal(0);
      await Promise.resolve();
    });

    it(`s02-C-TC008: Player 1 play card Red Reverse (before card Red 6) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          // special: Special.SKIP,
          number: 6,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.RED,
            special: Special.REVERSE,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.PLAY_CARD,
          {
            card_play: {
              color: Color.RED,
              special: Special.REVERSE,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(2 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_4);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.REVERSE);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(0);
      await Promise.resolve();
    });

    it(`s02-C-TC009: Player 1 play card Red Reverse (before card Blue Reverse) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_2,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.BLUE,
          special: Special.REVERSE,
          // number: 6,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.RED,
            special: Special.REVERSE,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: false,
        isSkip: false,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.PLAY_CARD,
          {
            card_play: {
              color: Color.RED,
              special: Special.REVERSE,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(2 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.REVERSE);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(0);
      await Promise.resolve();
    });

    it(`s02-C-TC010: Player 1 play card Red Draw_2 (before card Red 6) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          // special: Special.REVERSE,
          number: 6,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.RED,
            special: Special.DRAW_2,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        isSkip: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.PLAY_CARD,
          {
            player: Consts.PLAYER_1,
            card_play: {
              color: Color.RED,
              special: Special.DRAW_2,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(2 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.DRAW_2);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(2);
      await Promise.resolve();
    });

    it(`s02-C-TC011: Player 1 play card Red Draw_2 (before card Blue Draw_2) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.BLUE,
          special: Special.DRAW_2,
          // number: 6,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.RED,
            special: Special.DRAW_2,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: false,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.PLAY_CARD,
          {
            card_play: {
              color: Color.RED,
              special: Special.DRAW_2,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(2 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.DRAW_2);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(2);
      chai.expect(desk.mustCallDrawCard).to.equal(true);
      await Promise.resolve();
    });

    it(`s02-C-TC012: Player 1 play card Wild (before card Blue 6) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.BLUE,
          // special: Special.DRAW_2,
          number: 6,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.BLACK,
            special: Special.WILD,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        isSkip: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.PLAY_CARD,
          {
            player: Consts.PLAYER_1,
            card_play: {
              color: Color.BLACK,
              special: Special.WILD,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(2 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_1);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.WILD);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.BLACK);
      chai.expect(desk.cardAddOn).to.equal(0);
      await Promise.resolve();
    });

    it(`s02-C-TC013: Player 1 play card Wild (before card Red Skip) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_3,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          special: Special.SKIP,
          // number: 6,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.BLACK,
            special: Special.WILD,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        isSkip: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.PLAY_CARD,
          {
            card_play: {
              color: Color.BLACK,
              special: Special.WILD,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(2 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_1);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.WILD);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.BLACK);
      chai.expect(desk.cardAddOn).to.equal(0);
      await Promise.resolve();
    });

    it(`s02-C-TC014: Player 1 play card Wild (before card Red Wild_draw_4) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          special: Special.WILD_DRAW_4,
          // number: 6,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.BLACK,
            special: Special.WILD,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: false,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.PLAY_CARD,
          {
            card_play: {
              color: Color.BLACK,
              special: Special.WILD,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(2 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_1);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.WILD);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.BLACK);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.mustCallDrawCard).to.equal(false);
      await Promise.resolve();
    });

    it(`s02-C-TC015: Player 1 play card Wild_draw_4 (before card Blue 6) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.BLUE,
          // special: Special.WILD_DRAW_4,
          number: 6,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.BLACK,
            special: Special.WILD_DRAW_4,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.PLAY_CARD,
          {
            card_play: {
              color: Color.BLACK,
              special: Special.WILD_DRAW_4,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(2 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_1);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.WILD_DRAW_4);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.BLACK);
      chai.expect(desk.cardAddOn).to.equal(0);
      await Promise.resolve();
    });

    it(`s02-C-TC016: Player 1 play card Wild_draw_4 (before card Red Skip) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_3,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          special: Special.SKIP,
          // number: 6,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.BLACK,
            special: Special.WILD_DRAW_4,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.PLAY_CARD,
          {
            card_play: {
              color: Color.BLACK,
              special: Special.WILD_DRAW_4,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(2 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_1);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.WILD_DRAW_4);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.BLACK);
      chai.expect(desk.cardAddOn).to.equal(0);
      await Promise.resolve();
    });

    it(`s02-C-TC017: Player 1 play card Wild_draw_4 (before card Blue Wild) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.BLUE,
          special: Special.WILD,
          // number: 6,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.BLACK,
            special: Special.WILD_DRAW_4,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: false,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.PLAY_CARD,
          {
            card_play: {
              color: Color.BLACK,
              special: Special.WILD_DRAW_4,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(2 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_1);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.WILD_DRAW_4);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.BLACK);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.mustCallDrawCard).to.equal(false);
      await Promise.resolve();
    });

    it(`s02-C-TC018: Player 1 play card Wild_shuffle (before card Blue 6) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.BLUE,
          // special: Special.WILD,
          number: 6,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.BLACK,
            special: Special.WILD_SHUFFLE,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
      });
      await CommonService.setCardOfPlayer(Consts.DEALER_2, Consts.PLAYER_2, [
        {
          color: Color.YELLOW,
          number: 1,
        },
        {
          color: Color.BLUE,
          special: Special.SKIP,
        },
        {
          color: Color.BLUE,
          special: Special.REVERSE,
        },
      ]);
      await CommonService.setCardOfPlayer(Consts.DEALER_2, Consts.PLAYER_3, [
        {
          color: Color.RED,
          number: 9,
        },
      ]);
      await CommonService.setCardOfPlayer(Consts.DEALER_2, Consts.PLAYER_4, [
        {
          color: Color.YELLOW,
          number: 1,
        },
        {
          color: Color.GREEN,
          special: Special.DRAW_2,
        },
        {
          color: Color.GREEN,
          number: 2,
        },
        {
          color: Color.GREEN,
          number: 5,
        },
      ]);
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.PLAY_CARD,
          {
            card_play: {
              color: Color.BLACK,
              special: Special.WILD_SHUFFLE,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(3 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_1);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.WILD_SHUFFLE);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.BLACK);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(2);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_2].length).to.equal(3);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_3].length).to.equal(2);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_4].length).to.equal(2);
      await Promise.resolve();
    });

    it(`s02-C-TC019: Player 1 play card Wild_shuffle (before card Red Skip) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_3,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          special: Special.SKIP,
          // number: 6,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.BLACK,
            special: Special.WILD_SHUFFLE,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
      });
      await CommonService.setCardOfPlayer(Consts.DEALER_2, Consts.PLAYER_2, [
        {
          color: Color.YELLOW,
          number: 1,
        },
        {
          color: Color.BLUE,
          special: Special.SKIP,
        },
        {
          color: Color.BLUE,
          special: Special.REVERSE,
        },
      ]);
      await CommonService.setCardOfPlayer(Consts.DEALER_2, Consts.PLAYER_3, [
        {
          color: Color.RED,
          number: 9,
        },
      ]);
      await CommonService.setCardOfPlayer(Consts.DEALER_2, Consts.PLAYER_4, [
        {
          color: Color.YELLOW,
          number: 1,
        },
        {
          color: Color.GREEN,
          special: Special.DRAW_2,
        },
        {
          color: Color.GREEN,
          number: 2,
        },
        {
          color: Color.GREEN,
          number: 5,
        },
      ]);
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.PLAY_CARD,
          {
            card_play: {
              color: Color.BLACK,
              special: Special.WILD_SHUFFLE,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(3 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_1);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.WILD_SHUFFLE);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.BLACK);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(2);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_2].length).to.equal(3);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_3].length).to.equal(2);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_4].length).to.equal(2);
      await Promise.resolve();
    });

    it(`s02-C-TC020: Player 1 play card Wild_shuffle (before card Wild_draw_4) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          special: Special.WILD_DRAW_4,
          // number: 6,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.BLACK,
            special: Special.WILD_SHUFFLE,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: false,
      });
      await CommonService.setCardOfPlayer(Consts.DEALER_2, Consts.PLAYER_2, [
        {
          color: Color.YELLOW,
          number: 1,
        },
        {
          color: Color.BLUE,
          special: Special.SKIP,
        },
        {
          color: Color.BLUE,
          special: Special.REVERSE,
        },
      ]);
      await CommonService.setCardOfPlayer(Consts.DEALER_2, Consts.PLAYER_3, [
        {
          color: Color.RED,
          number: 9,
        },
      ]);
      await CommonService.setCardOfPlayer(Consts.DEALER_2, Consts.PLAYER_4, [
        {
          color: Color.YELLOW,
          number: 1,
        },
        {
          color: Color.GREEN,
          special: Special.DRAW_2,
        },
        {
          color: Color.GREEN,
          number: 2,
        },
        {
          color: Color.GREEN,
          number: 5,
        },
      ]);
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.PLAY_CARD,
          {
            card_play: {
              color: Color.BLACK,
              special: Special.WILD_SHUFFLE,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(3 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_1);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.WILD_SHUFFLE);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.BLACK);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.mustCallDrawCard).to.equal(false);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(2);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_2].length).to.equal(3);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_3].length).to.equal(2);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_4].length).to.equal(2);
      await Promise.resolve();
    });

    it(`s02-C-TC021: Player 1 play card Red 9 (before card Red 6) - failed - Reason: Card play is required`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          number: 6,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.RED,
            number: 9,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(Consts.SOCKET.EVENT.PLAY_CARD, {}, () => {
          resolve();
        });
      });
      await BlueBird.delay(5 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.number).to.equal(6);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(0);
      await Promise.resolve();
    });

    it(`s02-C-TC022: Player 1 play card Red 9 (before card Red 6) - failed - Reason: Param card play invalid`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          // special: Special.WILD_DRAW_4,
          number: 6,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.RED,
            number: 9,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.PLAY_CARD,
          {
            card_play: {
              color: Color.RED,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(5 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.number).to.equal(6);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(0);
      await Promise.resolve();
    });

    it(`s02-C-TC023: Player 1 play card Red Reverse (before card Red 6) - failed - Reason: Special card play invalid`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          // special: Special.WILD_DRAW_4,
          number: 6,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.RED,
            special: Special.REVERSE,
            // number: 9,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.PLAY_CARD,
          {
            card_play: {
              color: Color.RED,
              special: 'Reverses',
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(5 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.number).to.equal(6);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(0);
      await Promise.resolve();
    });

    it(`s02-C-TC024: Player 1 play card Red 9 (before card Red 6) - failed - Reason: Color card play invalid`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          // special: Special.WILD_DRAW_4,
          number: 6,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.RED,
            // special: Special.REVERSE,
            number: 9,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.PLAY_CARD,
          {
            card_play: {
              color: 'grey',
              number: 9,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(5 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.number).to.equal(6);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(0);
      await Promise.resolve();
    });

    it(`s02-C-TC025: Player 1 play card Red 9 (before card Red 6) - failed - Reason: Number card play invalid`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          // special: Special.WILD_DRAW_4,
          number: 6,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.RED,
            // special: Special.REVERSE,
            number: 9,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.PLAY_CARD,
          {
            card_play: {
              color: Color.RED,
              number: 10,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(5 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.number).to.equal(6);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(0);
      await Promise.resolve();
    });

    it(`s02-C-TC027: Player 1 play card Red 9 (before card Red 6) - failed - Reason: Card play not exist of player`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          // special: Special.WILD_DRAW_4,
          number: 6,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.BLACK,
            special: Special.WILD_DRAW_4,
            // number: 9,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.PLAY_CARD,
          {
            card_play: {
              color: Color.RED,
              // special: Special.WILD_DRAW_4,
              number: 9,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(5 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.number).to.equal(6);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(4);
      await Promise.resolve();
    });

    it(`s02-C-TC028: Player 1 play card Red Draw_2 (before card Blue 6) - failed - Reason: Card play invalid with card before`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.BLUE,
          // special: Special.WILD_DRAW_4,
          number: 6,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.RED,
            special: Special.DRAW_2,
            // number: 9,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.PLAY_CARD,
          {
            card_play: {
              color: Color.RED,
              special: Special.DRAW_2,
              // number: 9,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(5 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.number).to.equal(6);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.BLUE);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(4);
      await Promise.resolve();
    });

    it(`s02-C-TC029: Player 1 play card Blue Skip (before card Red 5) - failed - Reason: Card play invalid with card before`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          // special: Special.WILD_DRAW_4,
          number: 5,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.RED,
            special: Special.DRAW_2,
            // number: 9,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        isSkip: false,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.PLAY_CARD,
          {
            card_play: {
              color: Color.BLUE,
              special: Special.SKIP,
              // number: 9,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(5 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.number).to.equal(5);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(4);
      await Promise.resolve();
    });

    it(`s02-C-TC030: Player 1 play card Red Draw_2 (before card Blue Skip) - failed - Reason: Card play invalid with card before`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.BLUE,
          special: Special.SKIP,
          // number: 5,
        },
        cardOfPlayer: [
          {
            color: Color.RED,
            special: Special.DRAW_2,
          },
          {
            color: Color.RED,
            // special: Special.DRAW_2,
            number: 9,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.PLAY_CARD,
          {
            card_play: {
              color: Color.RED,
              special: Special.DRAW_2,
              // number: 9,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(5 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.SKIP);
      // chai.expect(desk.beforeCardPlay.number).to.equal(5);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.BLUE);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(4);
      await Promise.resolve();
    });

    it(`s02-C-TC031: Player 1 play card Blue Skip (Player 4 play card Blue Wild) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.BLUE,
          special: Special.WILD,
          // number: 5,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.RED,
            // special: Special.DRAW_2,
            number: 9,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: false,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.PLAY_CARD,
          {
            card_play: {
              color: Color.BLUE,
              special: Special.SKIP,
              // number: 9,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(2 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_3);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.SKIP);
      // chai.expect(desk.beforeCardPlay.number).to.equal(5);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.BLUE);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.mustCallDrawCard).to.equal(false);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(1);
      await Promise.resolve();
    });

    it(`s02-C-TC032: Player 1 play card Blue Skip (Player 3 play card Blue Wild) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.BLUE,
          special: Special.WILD,
          // number: 5,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.RED,
            // special: Special.DRAW_2,
            number: 9,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: false,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.PLAY_CARD,
          {
            card_play: {
              color: Color.BLUE,
              special: Special.SKIP,
              // number: 9,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(2 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_3);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.SKIP);
      // chai.expect(desk.beforeCardPlay.number).to.equal(5);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.BLUE);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(1);
      await Promise.resolve();
    });

    it(`s02-C-TC033: Player 1 play card Blue 6 (Player 4 play card Blue Wild) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.BLUE,
          special: Special.WILD,
          // number: 5,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.BLUE,
            // special: Special.DRAW_2,
            number: 6,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: false,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.PLAY_CARD,
          {
            card_play: {
              color: Color.BLUE,
              // special: Special.SKIP,
              number: 6,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(2 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      // chai.expect(desk.beforeCardPlay.special).to.equal(Special.SKIP);
      chai.expect(desk.beforeCardPlay.number).to.equal(6);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.BLUE);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(1);
      await Promise.resolve();
    });

    it(`s02-C-TC034: Player 1 play card Red 6 (Player 4 play card Blue Wild) - failed - Reason: Card play invalid with card before`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.BLUE,
          special: Special.WILD,
          // number: 5,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.RED,
            // special: Special.DRAW_2,
            number: 6,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: false,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.PLAY_CARD,
          {
            card_play: {
              color: Color.RED,
              // special: Special.SKIP,
              number: 6,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(5 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.WILD);
      // chai.expect(desk.beforeCardPlay.number).to.equal(6);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.BLUE);
      chai.expect(desk.mustCallDrawCard).to.equal(false);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(4);
      await Promise.resolve();
    });

    it(`s02-C-TC035: Player 1 play card Blue Skip (Player 3 play card Blue Wild_draw_4) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.BLUE,
          special: Special.WILD_DRAW_4,
          // number: 5,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.RED,
            // special: Special.DRAW_2,
            number: 9,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: false,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.PLAY_CARD,
          {
            card_play: {
              color: Color.BLUE,
              special: Special.SKIP,
              // number: 9,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(2 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_3);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.SKIP);
      // chai.expect(desk.beforeCardPlay.number).to.equal(5);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.BLUE);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.mustCallDrawCard).to.equal(false);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(1);
      await Promise.resolve();
    });

    it(`s02-C-TC036: Player 1 play card Blue Draw_2 (Player 3 play card Blue Wild_draw_4) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.BLUE,
          special: Special.WILD_DRAW_4,
          // number: 5,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.BLUE,
            special: Special.DRAW_2,
            // number: 9,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: false,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.PLAY_CARD,
          {
            card_play: {
              color: Color.BLUE,
              special: Special.DRAW_2,
              // number: 9,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(2 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.DRAW_2);
      // chai.expect(desk.beforeCardPlay.number).to.equal(5);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.BLUE);
      chai.expect(desk.cardAddOn).to.equal(2);
      chai.expect(desk.mustCallDrawCard).to.equal(true);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(1);
      await Promise.resolve();
    });

    it(`s02-C-TC037: Player 1 play card Blue 6 (Player 3 play card Blue Wild_draw_4) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.BLUE,
          special: Special.WILD_DRAW_4,
          // number: 5,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.BLUE,
            // special: Special.DRAW_2,
            number: 6,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: false,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.PLAY_CARD,
          {
            card_play: {
              color: Color.BLUE,
              // special: Special.DRAW_2,
              number: 6,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(2 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      // chai.expect(desk.beforeCardPlay.special).to.equal(Special.DRAW_2);
      chai.expect(desk.beforeCardPlay.number).to.equal(6);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.BLUE);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.mustCallDrawCard).to.equal(false);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(1);
      await Promise.resolve();
    });

    it(`s02-C-TC038: Player 1 play card Red 6 (Player 3 play card Blue Wild_draw_4) - failed - Error: Card play invalid with card before`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.BLUE,
          special: Special.WILD_DRAW_4,
          // number: 5,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.BLUE,
            // special: Special.DRAW_2,
            number: 6,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: false,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.PLAY_CARD,
          {
            card_play: {
              color: Color.RED,
              // special: Special.DRAW_2,
              number: 6,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(5 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.WILD_DRAW_4);
      // chai.expect(desk.beforeCardPlay.number).to.equal(6);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.BLUE);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.mustCallDrawCard).to.equal(false);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(4); // cardOfPlayer(2) + penalty(2)
      await Promise.resolve();
    });

    it(`s02-C-TC039: Player 1 play card Blue Skip (before card Wild_draw_4) - failed - Reason: Card play invalid with card before`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.BLUE,
          special: Special.WILD_DRAW_4,
          // number: 5,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.RED,
            // special: Special.DRAW_2,
            number: 9,
          },
        ],
        cardAddOn: 4,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.PLAY_CARD,
          {
            card_play: {
              color: Color.BLUE,
              special: Special.SKIP,
              // number: 9,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(5 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.WILD_DRAW_4);
      // chai.expect(desk.beforeCardPlay.number).to.equal(5);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.BLUE);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.mustCallDrawCard).to.equal(false);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(8); // cardOfPlayer(2) + penalty(2) + WILD_DRAW_4(4)
      await Promise.resolve();
    });

    it(`s02-C-TC040: Player 1 play card Blue 5 (before card Red Wild_shuffle) - failed - Reason: Card play invalid with card before`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          special: Special.WILD_SHUFFLE,
          // number: 5,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.BLUE,
            // special: Special.DRAW_2,
            number: 5,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.PLAY_CARD,
          {
            card_play: {
              color: Color.BLUE,
              // special: Special.SKIP,
              number: 5,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(5 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.WILD_SHUFFLE);
      // chai.expect(desk.beforeCardPlay.number).to.equal(5);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(4); // cardOfPlayer(2) + penalty(2)
      await Promise.resolve();
    });

    it(`s02-C-TC041: Player 1 can not call play card Blue 5 (next player is Player 4) - failed - Reason: Next player invalid`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_3,
        nextPlayer: Consts.PLAYER_4,
        beforeCardPlay: {
          color: Color.RED,
          number: 5,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.BLUE,
            // special: Special.DRAW_2,
            number: 5,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
      });
      await CommonService.setCardOfPlayer(Consts.DEALER_2, Consts.PLAYER_1, [
        {
          color: Color.YELLOW,
          number: 1,
        },
        {
          color: Color.BLUE,
          special: Special.SKIP,
        },
        {
          color: Color.BLUE,
          special: Special.REVERSE,
        },
      ]);
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.PLAY_CARD,
          {
            card_play: {
              color: Color.BLUE,
              // special: Special.SKIP,
              number: 5,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(5 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_4);
      chai.expect(desk.beforeCardPlay.number).to.equal(5);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(5); // cardOfPlayer(3) + penalty(2)
      await Promise.resolve();
    });

    it(`s02-C-TC042: Finish a turn game successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          number: 6,
        },
        cardOfPlayer: [
          {
            color: Color.RED,
            number: 9,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
      });
      await CommonService.setOrderOfDesk(Consts.DEALER_2, 1, {
        [Consts.PLAYER_1]: 0,
        [Consts.PLAYER_2]: 0,
        [Consts.PLAYER_3]: 0,
        [Consts.PLAYER_4]: 0,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.PLAY_CARD,
          {
            card_play: {
              color: Color.RED,
              number: 9,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(5 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.order[Consts.PLAYER_1]).to.equal(1);
      await Promise.resolve();
    });

    it(`s02-C-TC043: Player 1 play card Red Draw_2 (before card Blue Draw_2) - failed - Error: Can not call event play-card`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.BLUE,
          special: Special.DRAW_2,
          // number: 6,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.RED,
            special: Special.DRAW_2,
          },
        ],
        cardAddOn: 2,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.PLAY_CARD,
          {
            card_play: {
              color: Color.RED,
              special: Special.DRAW_2,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(5 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      // chai.expect(desk.beforeCardPlay.special).to.equal(Special.DRAW_2);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.BLUE);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.mustCallDrawCard).to.equal(false);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(6); // cardOfPlayer(2) + penalty(2) + DRAW_2(2)
      await Promise.resolve();
    });

    it(`s02-C-TC044: Player 1 play card Wild (before card Red Wild_draw_4) - failed - Error: Can not call event play-card`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          special: Special.WILD_DRAW_4,
          // number: 6,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.BLACK,
            special: Special.WILD,
          },
        ],
        cardAddOn: 4,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.PLAY_CARD,
          {
            card_play: {
              color: Color.BLACK,
              special: Special.WILD,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(5 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      // chai.expect(desk.beforeCardPlay.special).to.equal(Special.WILD_DRAW_4);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.mustCallDrawCard).to.equal(false);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(8); // cardOfPlayer(2) + penalty(2) + WILD_DRAW_4(4)
      await Promise.resolve();
    });

    it(`s02-C-TC045: Player 1 play card Wild (before card Red Draw_2) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          special: Special.DRAW_2,
          // number: 6,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.BLACK,
            special: Special.WILD,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: false,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.PLAY_CARD,
          {
            card_play: {
              color: Color.BLACK,
              special: Special.WILD,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(2 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_1);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.WILD);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.BLACK);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.mustCallDrawCard).to.equal(false);
      await Promise.resolve();
    });

    it(`s02-C-TC046: Player 1 play card Wild (before card Red Draw_2) - failed - Error: Can not call event play-card`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          special: Special.DRAW_2,
          // number: 6,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.BLACK,
            special: Special.WILD,
          },
        ],
        cardAddOn: 2,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.PLAY_CARD,
          {
            card_play: {
              color: Color.BLACK,
              special: Special.WILD,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(5 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.DRAW_2);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.mustCallDrawCard).to.equal(false);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(6); // cardOfPlayer(2) + penalty(2) + DRAW_2(2)
      await Promise.resolve();
    });

    it(`s02-C-TC047: Player 1 play card Wild_draw_4 (before card Red Draw_2) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          special: Special.DRAW_2,
          // number: 6,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.BLACK,
            special: Special.WILD_DRAW_4,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: false,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.PLAY_CARD,
          {
            card_play: {
              color: Color.BLACK,
              special: Special.WILD_DRAW_4,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(2 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_1);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.WILD_DRAW_4);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.BLACK);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.mustCallDrawCard).to.equal(false);
      await Promise.resolve();
    });

    it(`s02-C-TC048: Player 1 play card Wild_draw_4 (before card Red Draw_2) - failed - Error: Card play invalid with card before`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          special: Special.DRAW_2,
          // number: 6,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.BLACK,
            special: Special.WILD_DRAW_4,
          },
        ],
        cardAddOn: 2,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.PLAY_CARD,
          {
            card_play: {
              color: Color.BLACK,
              special: Special.WILD_DRAW_4,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(5 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.DRAW_2);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.mustCallDrawCard).to.equal(false);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(6); // cardOfPlayer(2) + penalty(2) + DRAW_2(2)
      await Promise.resolve();
    });

    it(`s02-C-TC049: Player 1 play card Wild_draw_4 (before card Red Wild_draw_4) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          special: Special.WILD_DRAW_4,
          // number: 6,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.BLACK,
            special: Special.WILD_DRAW_4,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: false,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.PLAY_CARD,
          {
            card_play: {
              color: Color.BLACK,
              special: Special.WILD_DRAW_4,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(2 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_1);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.WILD_DRAW_4);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.BLACK);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.mustCallDrawCard).to.equal(false);
      await Promise.resolve();
    });

    it(`s02-C-TC050: Player 1 play card Wild_draw_4 (before card Red Wild_draw_4) - failed - Error: Card play invalid with card before`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          special: Special.WILD_DRAW_4,
          // number: 6,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.BLACK,
            special: Special.WILD_DRAW_4,
          },
        ],
        cardAddOn: 4,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.PLAY_CARD,
          {
            card_play: {
              color: Color.BLACK,
              special: Special.WILD_DRAW_4,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(5 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.WILD_DRAW_4);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.mustCallDrawCard).to.equal(false);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(8); // cardOfPlayer(2) + penalty(2) + WILD_DRAW_4(4)
      await Promise.resolve();
    });

    it(`s02-C-TC051: Player 1 play card Blue Reverse (Player 3 play card Blue Wild_draw_4) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.BLUE,
          special: Special.WILD_DRAW_4,
          // number: 5,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.REVERSE,
          },
          {
            color: Color.RED,
            // special: Special.DRAW_2,
            number: 9,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: false,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.PLAY_CARD,
          {
            card_play: {
              color: Color.BLUE,
              special: Special.REVERSE,
              // number: 9,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(2 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_4);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.REVERSE);
      // chai.expect(desk.beforeCardPlay.number).to.equal(5);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.BLUE);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.mustCallDrawCard).to.equal(false);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(1);
      await Promise.resolve();
    });

    it(`s02-C-TC052: Player 1 play card Wild_shuffle (before card Red Wild_draw_4) - failed - Error: Card play invalid with card before`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          special: Special.WILD_DRAW_4,
          // number: 6,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.BLACK,
            special: Special.WILD_SHUFFLE,
          },
        ],
        cardAddOn: 4,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.PLAY_CARD,
          {
            card_play: {
              color: Color.BLACK,
              special: Special.WILD_SHUFFLE,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(5 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.WILD_DRAW_4);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.mustCallDrawCard).to.equal(false);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(8); // cardOfPlayer(2) + penalty(2) + WILD_DRAW_4(4)
      await Promise.resolve();
    });

    it(`s02-C-TC053: Player 1 play card Wild_shuffle (before card Blue Draw_2) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.BLUE,
          special: Special.DRAW_2,
          // number: 6,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.BLACK,
            special: Special.WILD_SHUFFLE,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: false,
      });
      await CommonService.setCardOfPlayer(Consts.DEALER_2, Consts.PLAYER_2, [
        {
          color: Color.YELLOW,
          number: 1,
        },
        {
          color: Color.BLUE,
          special: Special.SKIP,
        },
        {
          color: Color.BLUE,
          special: Special.REVERSE,
        },
      ]);
      await CommonService.setCardOfPlayer(Consts.DEALER_2, Consts.PLAYER_3, [
        {
          color: Color.RED,
          number: 9,
        },
      ]);
      await CommonService.setCardOfPlayer(Consts.DEALER_2, Consts.PLAYER_4, [
        {
          color: Color.YELLOW,
          number: 1,
        },
        {
          color: Color.GREEN,
          special: Special.DRAW_2,
        },
        {
          color: Color.GREEN,
          number: 2,
        },
        {
          color: Color.GREEN,
          number: 5,
        },
      ]);
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.PLAY_CARD,
          {
            card_play: {
              color: Color.BLACK,
              special: Special.WILD_SHUFFLE,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(3 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_1);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.WILD_SHUFFLE);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.BLACK);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.mustCallDrawCard).to.equal(false);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(2);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_2].length).to.equal(3);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_3].length).to.equal(2);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_4].length).to.equal(2);
      await Promise.resolve();
    });

    it(`s02-C-TC054: Player 1 play card Wild_shuffle (before card Red Draw_2) - failed - Error: Card play invalid with card before`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          special: Special.DRAW_2,
          // number: 6,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.BLACK,
            special: Special.WILD_SHUFFLE,
          },
        ],
        cardAddOn: 2,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.PLAY_CARD,
          {
            card_play: {
              color: Color.BLACK,
              special: Special.WILD_SHUFFLE,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(5 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.DRAW_2);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.mustCallDrawCard).to.equal(false);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(6); // cardOfPlayer(2) + penalty(2) + DRAW_2(2)
      await Promise.resolve();
    });

    it(`s02-C-TC055: Player 1 play card White_wild[bind_2] (before card Red 6) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          special: Special.DRAW_2,
          // number: 6,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.BLACK,
            special: Special.WHITE_WILD,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: false,
        whiteWild: WhiteWild.BIND_2,
        activationWhiteWild: {},
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.PLAY_CARD,
          {
            card_play: {
              color: Color.BLACK,
              special: Special.WHITE_WILD,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(3 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.WHITE_WILD);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.mustCallDrawCard).to.equal(true);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(1);
      chai.expect(desk.activationWhiteWild).to.not.undefined;
      if (desk.activationWhiteWild) {
        chai.expect(desk.activationWhiteWild[Consts.PLAYER_2]).to.equal(2);
      }
      await Promise.resolve();
    });

    it(`s02-C-TC056: Player 1 play card White_wild[bind_2] (before card Red Skip) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_3,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          special: Special.SKIP,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.BLACK,
            special: Special.WHITE_WILD,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: false,
        whiteWild: WhiteWild.BIND_2,
        activationWhiteWild: {},
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.PLAY_CARD,
          {
            card_play: {
              color: Color.BLACK,
              special: Special.WHITE_WILD,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(3 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.WHITE_WILD);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.mustCallDrawCard).to.equal(true);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(1);
      chai.expect(desk.activationWhiteWild).to.not.undefined;
      if (desk.activationWhiteWild) {
        chai.expect(desk.activationWhiteWild[Consts.PLAYER_2]).to.equal(2);
      }
      await Promise.resolve();
    });

    it(`s02-C-TC057: Player 1 play card White_wild[bind_2] (before card Red Reverse) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_2,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          special: Special.REVERSE,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.BLACK,
            special: Special.WHITE_WILD,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: false,
        mustCallDrawCard: false,
        whiteWild: WhiteWild.BIND_2,
        activationWhiteWild: {},
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.PLAY_CARD,
          {
            card_play: {
              color: Color.BLACK,
              special: Special.WHITE_WILD,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(3 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_4);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.WHITE_WILD);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.mustCallDrawCard).to.equal(true);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(1);
      chai.expect(desk.activationWhiteWild).to.not.undefined;
      if (desk.activationWhiteWild) {
        chai.expect(desk.activationWhiteWild[Consts.PLAYER_4]).to.equal(2);
      }
      await Promise.resolve();
    });

    it(`s02-C-TC058: Player 1 play card White_wild[bind_2] (before card Red Draw_2) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          special: Special.DRAW_2,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.BLACK,
            special: Special.WHITE_WILD,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: false,
        whiteWild: WhiteWild.BIND_2,
        activationWhiteWild: {},
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.PLAY_CARD,
          {
            card_play: {
              color: Color.BLACK,
              special: Special.WHITE_WILD,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(3 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.WHITE_WILD);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.mustCallDrawCard).to.equal(true);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(1);
      chai.expect(desk.activationWhiteWild).to.not.undefined;
      if (desk.activationWhiteWild) {
        chai.expect(desk.activationWhiteWild[Consts.PLAYER_2]).to.equal(2);
      }
      await Promise.resolve();
    });

    it(`s02-C-TC059: Player 1 play card White_wild[bind_2] (before card Red Wild) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          special: Special.WILD,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.BLACK,
            special: Special.WHITE_WILD,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: false,
        whiteWild: WhiteWild.BIND_2,
        activationWhiteWild: {},
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.PLAY_CARD,
          {
            card_play: {
              color: Color.BLACK,
              special: Special.WHITE_WILD,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(3 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.WHITE_WILD);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.mustCallDrawCard).to.equal(true);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(1);
      chai.expect(desk.activationWhiteWild).to.not.undefined;
      if (desk.activationWhiteWild) {
        chai.expect(desk.activationWhiteWild[Consts.PLAYER_2]).to.equal(2);
      }
      await Promise.resolve();
    });

    it(`s02-C-TC060: Player 1 play card White_wild[bind_2] (before card Red Wild_shuffle) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          special: Special.WILD_SHUFFLE,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.BLACK,
            special: Special.WHITE_WILD,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: false,
        whiteWild: WhiteWild.BIND_2,
        activationWhiteWild: {},
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.PLAY_CARD,
          {
            card_play: {
              color: Color.BLACK,
              special: Special.WHITE_WILD,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(3 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.WHITE_WILD);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.mustCallDrawCard).to.equal(true);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(1);
      chai.expect(desk.activationWhiteWild).to.not.undefined;
      if (desk.activationWhiteWild) {
        chai.expect(desk.activationWhiteWild[Consts.PLAYER_2]).to.equal(2);
      }
      await Promise.resolve();
    });

    it(`s02-C-TC061: Player 1 play card White_wild[bind_2] (before card Red Wild_draw_4) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          special: Special.WILD_DRAW_4,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.BLACK,
            special: Special.WHITE_WILD,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: false,
        whiteWild: WhiteWild.BIND_2,
        activationWhiteWild: {},
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.PLAY_CARD,
          {
            card_play: {
              color: Color.BLACK,
              special: Special.WHITE_WILD,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(3 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.WHITE_WILD);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.mustCallDrawCard).to.equal(true);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(1);
      chai.expect(desk.activationWhiteWild).to.not.undefined;
      if (desk.activationWhiteWild) {
        chai.expect(desk.activationWhiteWild[Consts.PLAYER_2]).to.equal(2);
      }
      await Promise.resolve();
    });

    it(`s02-C-TC062: Player 1 play card White_wild[bind_2] (before card Red Draw_2) - failed - Error: Card play invalid with card before`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          special: Special.DRAW_2,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.BLACK,
            special: Special.WHITE_WILD,
          },
        ],
        cardAddOn: 2,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: true,
        whiteWild: WhiteWild.BIND_2,
        activationWhiteWild: {},
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.PLAY_CARD,
          {
            card_play: {
              color: Color.BLACK,
              special: Special.WHITE_WILD,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(5 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.DRAW_2);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.mustCallDrawCard).to.equal(false);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(6); // cardOfPlayer(2) + penalty(2) + DRAW_2(2)
      await Promise.resolve();
    });

    it(`s02-C-TC063: Player 1 play card White_wild[bind_2] (before card Red Wild_draw_4) - failed - Error: Card play invalid with card before`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          special: Special.WILD_DRAW_4,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.BLACK,
            special: Special.WHITE_WILD,
          },
        ],
        cardAddOn: 4,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: true,
        whiteWild: WhiteWild.BIND_2,
        activationWhiteWild: {},
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.PLAY_CARD,
          {
            card_play: {
              color: Color.BLACK,
              special: Special.WHITE_WILD,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(5 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.WILD_DRAW_4);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.mustCallDrawCard).to.equal(false);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(8); // cardOfPlayer(2) + penalty(2) + WILD_DRAW_4(4)
      await Promise.resolve();
    });

    it(`s02-C-TC064: Player 1 play card White_wild[bind_2] (before card Red 6 White_wild 2nd times) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          number: 6,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.BLACK,
            special: Special.WHITE_WILD,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: false,
        whiteWild: WhiteWild.BIND_2,
        activationWhiteWild: {
          [Consts.PLAYER_2]: 1,
        },
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.PLAY_CARD,
          {
            card_play: {
              color: Color.BLACK,
              special: Special.WHITE_WILD,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(3 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.WHITE_WILD);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.mustCallDrawCard).to.equal(true);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(1);
      chai.expect(desk.activationWhiteWild).to.not.undefined;
      if (desk.activationWhiteWild) {
        chai.expect(desk.activationWhiteWild[Consts.PLAYER_2]).to.equal(3);
      }
      await Promise.resolve();
    });

    it(`s02-C-TC065: Player 1 plays red draw 2 and wins - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          number: 6,
        },
        cardOfPlayer: [
          {
            color: Color.RED,
            special: Special.DRAW_2,
          },
        ],
        cardAddOn: 0,
        yellUno: true,
        turnRight: true,
        mustCallDrawCard: false,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.PLAY_CARD,
          {
            card_play: {
              color: Color.RED,
              special: Special.DRAW_2,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(5 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.turn).to.equal(2); // 対戦終了済み
      await Promise.resolve();
    });

    it(`s02-C-TC066: Player 1 plays black shuffle_wild and wins - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          number: 6,
        },
        cardOfPlayer: [
          {
            color: Color.BLACK,
            special: Special.WILD_SHUFFLE,
          },
        ],
        cardAddOn: 0,
        yellUno: true,
        turnRight: true,
        mustCallDrawCard: false,
      });
      await CommonService.setCardOfPlayer(Consts.DEALER_2, Consts.PLAYER_2, [
        {
          color: Color.YELLOW,
          number: 1,
        },
        {
          color: Color.BLUE,
          special: Special.SKIP,
        },
        {
          color: Color.BLUE,
          special: Special.REVERSE,
        },
      ]);
      await CommonService.setCardOfPlayer(Consts.DEALER_2, Consts.PLAYER_3, [
        {
          color: Color.RED,
          number: 9,
        },
      ]);
      await CommonService.setCardOfPlayer(Consts.DEALER_2, Consts.PLAYER_4, [
        {
          color: Color.YELLOW,
          number: 1,
        },
        {
          color: Color.GREEN,
          special: Special.DRAW_2,
        },
        {
          color: Color.GREEN,
          number: 2,
        },
        {
          color: Color.GREEN,
          number: 5,
        },
      ]);
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.PLAY_CARD,
          {
            card_play: {
              color: Color.BLACK,
              special: Special.WILD_SHUFFLE,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(3 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(0);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_2].length).to.equal(3);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_3].length).to.equal(3);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_4].length).to.equal(2);
      await Promise.resolve();
    });

    it(`s02-C-TC067: Player 1 plays white_wild and wins - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          number: 6,
        },
        cardOfPlayer: [
          {
            color: Color.BLACK,
            special: Special.WHITE_WILD,
          },
        ],
        cardAddOn: 0,
        yellUno: true,
        turnRight: true,
        mustCallDrawCard: false,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.PLAY_CARD,
          {
            card_play: {
              color: Color.BLACK,
              special: Special.WHITE_WILD,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(5 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.turn).to.equal(2); // 対戦終了済み
      await Promise.resolve();
    });

    it(`s02-C-TC068: Player 1 can not call play card Blue 5 (next player is Player 4) - failed - Reason: Interrupts are restricted`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_3,
        nextPlayer: Consts.PLAYER_4,
        beforeCardPlay: {
          color: Color.RED,
          number: 5,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.BLUE,
            // special: Special.DRAW_2,
            number: 5,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        restrictInterrupt: true,
      });
      await CommonService.setCardOfPlayer(Consts.DEALER_2, Consts.PLAYER_1, [
        {
          color: Color.YELLOW,
          number: 1,
        },
        {
          color: Color.BLUE,
          special: Special.SKIP,
        },
        {
          color: Color.BLUE,
          special: Special.REVERSE,
        },
      ]);
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.PLAY_CARD,
          {
            card_play: {
              color: Color.BLUE,
              number: 5,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(5 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_4);
      chai.expect(desk.beforeCardPlay.number).to.equal(5);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(3); // cardOfPlayer(3) + penalty(0)
      await Promise.resolve();
    });
  });

  /* /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */

  /** Test Event Consts.SOCKET.EVENT.SAY_UNO_AND_PLAY_CARD */
  describe(`Test Event ${Consts.SOCKET.EVENT.SAY_UNO_AND_PLAY_CARD}`, () => {
    it(`s02-D-TC001: Player 1 say uno and play card Red 9 (before card Red 6) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          number: 6,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.RED,
            number: 9,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: false,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.SAY_UNO_AND_PLAY_CARD,
          {
            card_play: {
              color: Color.RED,
              number: 9,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(2 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.number).to.equal(9);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(0);
      await Promise.resolve();
    });

    it(`s02-D-TC002: Player 1 say uno and play card Red 0 (before card Red 6) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          number: 6,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.RED,
            number: 0,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.SAY_UNO_AND_PLAY_CARD,
          {
            card_play: {
              color: Color.RED,
              number: 0,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(2 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.number).to.equal(0);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(0);
      await Promise.resolve();
    });

    it(`s02-D-TC003: Player 1 say uno and play card Blue 5 (before card Red 5) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          number: 5,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.BLUE,
            number: 5,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.SAY_UNO_AND_PLAY_CARD,
          {
            card_play: {
              color: Color.BLUE,
              number: 5,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(2 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.number).to.equal(5);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.BLUE);
      chai.expect(desk.cardAddOn).to.equal(0);
      await Promise.resolve();
    });

    it(`s02-D-TC004: Player 1 say uno and play card Blue 5 (before card Blue Wild_shuffle) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.BLUE,
          special: Special.WILD_SHUFFLE,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.BLUE,
            number: 5,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.SAY_UNO_AND_PLAY_CARD,
          {
            card_play: {
              color: Color.BLUE,
              number: 5,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(2 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.number).to.equal(5);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.BLUE);
      chai.expect(desk.cardAddOn).to.equal(0);
      await Promise.resolve();
    });

    it(`s02-D-TC005: Player 1 say uno and play card Blue Skip (before card Blue 6) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.BLUE,
          number: 6,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.SAY_UNO_AND_PLAY_CARD,
          {
            card_play: {
              color: Color.BLUE,
              special: Special.SKIP,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(2 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_3);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.SKIP);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.BLUE);
      chai.expect(desk.cardAddOn).to.equal(0);
      await Promise.resolve();
    });

    it(`s02-D-TC006: Player 1 say uno and play card Blue Skip (before card Blue Reverse) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_2,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.BLUE,
          special: Special.REVERSE,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: false,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.SAY_UNO_AND_PLAY_CARD,
          {
            card_play: {
              color: Color.BLUE,
              special: Special.SKIP,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(2 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_3);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.SKIP);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.BLUE);
      chai.expect(desk.turnRight).to.equal(false);
      chai.expect(desk.cardAddOn).to.equal(0);
      await Promise.resolve();
    });

    it(`s02-D-TC007: Player 1 say uno and play card Blue Skip (before card Red Skip) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_3,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          special: Special.SKIP,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.SAY_UNO_AND_PLAY_CARD,
          {
            card_play: {
              color: Color.BLUE,
              special: Special.SKIP,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(2 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_3);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.SKIP);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.BLUE);
      chai.expect(desk.cardAddOn).to.equal(0);
      await Promise.resolve();
    });

    it(`s02-D-TC008: Player 1 say uno and play card Red Reverse (before card Red 6) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          number: 6,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.RED,
            special: Special.REVERSE,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.SAY_UNO_AND_PLAY_CARD,
          {
            card_play: {
              color: Color.RED,
              special: Special.REVERSE,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(2 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_4);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.REVERSE);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(0);
      await Promise.resolve();
    });

    it(`s02-D-TC009: Player 1 say uno and play card Red Reverse (before card Blue Reverse) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_2,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.BLUE,
          special: Special.REVERSE,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.RED,
            special: Special.REVERSE,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: false,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.SAY_UNO_AND_PLAY_CARD,
          {
            card_play: {
              color: Color.RED,
              special: Special.REVERSE,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(2 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.REVERSE);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(0);
      await Promise.resolve();
    });

    it(`s02-D-TC010: Player 1 say uno and play card Red Draw_2 (before card Red 6) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          number: 6,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.RED,
            special: Special.DRAW_2,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.SAY_UNO_AND_PLAY_CARD,
          {
            card_play: {
              color: Color.RED,
              special: Special.DRAW_2,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(2 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.DRAW_2);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(2);
      await Promise.resolve();
    });

    it(`s02-D-TC011: Player 1 say uno and play card Red Draw_2 (before card Blue Draw_2) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.BLUE,
          special: Special.DRAW_2,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.RED,
            special: Special.DRAW_2,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.SAY_UNO_AND_PLAY_CARD,
          {
            card_play: {
              color: Color.RED,
              special: Special.DRAW_2,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(2 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.DRAW_2);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(2);
      chai.expect(desk.mustCallDrawCard).to.equal(true);
      await Promise.resolve();
    });

    it(`s02-D-TC012: Player 1 say uno and play card Wild (before card Blue 6) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.BLUE,
          number: 6,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.BLACK,
            special: Special.WILD,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.SAY_UNO_AND_PLAY_CARD,
          {
            card_play: {
              color: Color.BLACK,
              special: Special.WILD,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(2 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_1);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.WILD);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.BLACK);
      chai.expect(desk.cardAddOn).to.equal(0);
      await Promise.resolve();
    });

    it(`s02-D-TC013: Player 1 say uno and play card Wild (before card Red Skip) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_3,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          special: Special.SKIP,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.BLACK,
            special: Special.WILD,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.SAY_UNO_AND_PLAY_CARD,
          {
            card_play: {
              color: Color.BLACK,
              special: Special.WILD,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(2 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_1);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.WILD);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.BLACK);
      chai.expect(desk.cardAddOn).to.equal(0);
      await Promise.resolve();
    });

    it(`s02-D-TC014: Player 1 say uno and play card Wild (before card Red Wild_draw_4) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          special: Special.WILD_DRAW_4,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.BLACK,
            special: Special.WILD,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.SAY_UNO_AND_PLAY_CARD,
          {
            card_play: {
              color: Color.BLACK,
              special: Special.WILD,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(2 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_1);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.WILD);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.BLACK);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.mustCallDrawCard).to.equal(false);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(1);
      await Promise.resolve();
    });

    it(`s02-D-TC015: Player 1 say uno and play card Wild_draw_4 (before card Blue 6) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.BLUE,
          number: 6,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.BLACK,
            special: Special.WILD_DRAW_4,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.SAY_UNO_AND_PLAY_CARD,
          {
            card_play: {
              color: Color.BLACK,
              special: Special.WILD_DRAW_4,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(2 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_1);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.WILD_DRAW_4);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.BLACK);
      chai.expect(desk.cardAddOn).to.equal(0);
      await Promise.resolve();
    });

    it(`s02-D-TC016: Player 1 say uno and play card Wild_draw_4 (before card Red Skip) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_3,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          special: Special.SKIP,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.BLACK,
            special: Special.WILD_DRAW_4,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.SAY_UNO_AND_PLAY_CARD,
          {
            card_play: {
              color: Color.BLACK,
              special: Special.WILD_DRAW_4,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(2 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_1);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.WILD_DRAW_4);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.BLACK);
      chai.expect(desk.cardAddOn).to.equal(0);
      await Promise.resolve();
    });

    it(`s02-D-TC017: Player 1 say uno and play card play card Wild_draw_4 (before card Blue Wild) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.BLUE,
          special: Special.WILD,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.BLACK,
            special: Special.WILD_DRAW_4,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.SAY_UNO_AND_PLAY_CARD,
          {
            card_play: {
              color: Color.BLACK,
              special: Special.WILD_DRAW_4,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(2 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_1);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.WILD_DRAW_4);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.BLACK);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.mustCallDrawCard).to.equal(false);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(1);
      await Promise.resolve();
    });

    it(`s02-D-TC018: Player 1 say uno and play card Wild_shuffle (before card Blue 6) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.BLUE,
          number: 6,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.BLACK,
            special: Special.WILD_SHUFFLE,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
      });
      await CommonService.setCardOfPlayer(Consts.DEALER_2, Consts.PLAYER_2, [
        {
          color: Color.YELLOW,
          number: 1,
        },
        {
          color: Color.BLUE,
          special: Special.SKIP,
        },
        {
          color: Color.BLUE,
          special: Special.REVERSE,
        },
      ]);
      await CommonService.setCardOfPlayer(Consts.DEALER_2, Consts.PLAYER_3, [
        {
          color: Color.RED,
          number: 9,
        },
      ]);
      await CommonService.setCardOfPlayer(Consts.DEALER_2, Consts.PLAYER_4, [
        {
          color: Color.YELLOW,
          number: 1,
        },
        {
          color: Color.GREEN,
          special: Special.DRAW_2,
        },
        {
          color: Color.GREEN,
          number: 2,
        },
        {
          color: Color.GREEN,
          number: 5,
        },
      ]);
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.SAY_UNO_AND_PLAY_CARD,
          {
            card_play: {
              color: Color.BLACK,
              special: Special.WILD_SHUFFLE,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(3 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_1);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.WILD_SHUFFLE);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.BLACK);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(2);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_2].length).to.equal(3);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_3].length).to.equal(2);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_4].length).to.equal(2);
      await Promise.resolve();
    });

    it(`s02-D-TC019: Player 1 say uno and play card Wild_shuffle (before card Blue 6) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_3,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.BLUE,
          // special: Special.SKIP,
          number: 6,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.BLACK,
            special: Special.WILD_SHUFFLE,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
      });
      await CommonService.setCardOfPlayer(Consts.DEALER_2, Consts.PLAYER_2, [
        {
          color: Color.YELLOW,
          number: 1,
        },
        {
          color: Color.BLUE,
          special: Special.SKIP,
        },
        {
          color: Color.BLUE,
          special: Special.REVERSE,
        },
      ]);
      await CommonService.setCardOfPlayer(Consts.DEALER_2, Consts.PLAYER_3, [
        {
          color: Color.RED,
          number: 9,
        },
      ]);
      await CommonService.setCardOfPlayer(Consts.DEALER_2, Consts.PLAYER_4, [
        {
          color: Color.YELLOW,
          number: 1,
        },
        {
          color: Color.GREEN,
          special: Special.DRAW_2,
        },
        {
          color: Color.GREEN,
          number: 2,
        },
        {
          color: Color.GREEN,
          number: 5,
        },
      ]);
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.SAY_UNO_AND_PLAY_CARD,
          {
            card_play: {
              color: Color.BLACK,
              special: Special.WILD_SHUFFLE,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(3 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_1);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.WILD_SHUFFLE);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.BLACK);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(2);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_2].length).to.equal(3);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_3].length).to.equal(2);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_4].length).to.equal(2);
      await Promise.resolve();
    });

    it(`s02-D-TC020: Player 1 say uno and play card Wild_shuffle (before card Wild_draw_4) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          special: Special.WILD_DRAW_4,
          // number: 6,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.BLACK,
            special: Special.WILD_SHUFFLE,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: false,
      });
      await CommonService.setCardOfPlayer(Consts.DEALER_2, Consts.PLAYER_2, [
        {
          color: Color.YELLOW,
          number: 1,
        },
        {
          color: Color.BLUE,
          special: Special.SKIP,
        },
        {
          color: Color.BLUE,
          special: Special.REVERSE,
        },
      ]);
      await CommonService.setCardOfPlayer(Consts.DEALER_2, Consts.PLAYER_3, [
        {
          color: Color.RED,
          number: 9,
        },
      ]);
      await CommonService.setCardOfPlayer(Consts.DEALER_2, Consts.PLAYER_4, [
        {
          color: Color.YELLOW,
          number: 1,
        },
        {
          color: Color.GREEN,
          special: Special.DRAW_2,
        },
        {
          color: Color.GREEN,
          number: 2,
        },
        {
          color: Color.GREEN,
          number: 5,
        },
      ]);
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.SAY_UNO_AND_PLAY_CARD,
          {
            card_play: {
              color: Color.BLACK,
              special: Special.WILD_SHUFFLE,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(3 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_1);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.WILD_SHUFFLE);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.BLACK);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.mustCallDrawCard).to.equal(false);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(2);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_2].length).to.equal(3);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_3].length).to.equal(2);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_4].length).to.equal(2);
      await Promise.resolve();
    });

    it(`s02-D-TC021: Player 1 say uno and play card Red 9 (before card Red 6) - failed - Reason: Card play is required`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          number: 6,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.RED,
            number: 9,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(Consts.SOCKET.EVENT.SAY_UNO_AND_PLAY_CARD, {}, () => {
          resolve();
        });
      });
      await BlueBird.delay(5 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.number).to.equal(6);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(0);
      await Promise.resolve();
    });

    it(`s02-D-TC022: Player 1 say uno and play card Red 9 (before card Red 6) - failed - Reason: Param card play invalid`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          // special: Special.WILD_DRAW_4,
          number: 6,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.RED,
            number: 9,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.SAY_UNO_AND_PLAY_CARD,
          {
            card_play: {
              color: Color.RED,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(5 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.number).to.equal(6);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(4);
      await Promise.resolve();
    });

    it(`s02-D-TC023: Player 1 say uno and play card Red Reverse (before card Red 6) - failed - Reason: Special card play invalid`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          // special: Special.WILD_DRAW_4,
          number: 6,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.RED,
            special: Special.REVERSE,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.SAY_UNO_AND_PLAY_CARD,
          {
            card_play: {
              color: Color.RED,
              special: 'Reverses',
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(5 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.number).to.equal(6);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(0);
      await Promise.resolve();
    });

    it(`s02-D-TC024: Player 1 say uno and play card Red 9 (before card Red 6) - failed - Reason: Color card play invalid`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          // special: Special.WILD_DRAW_4,
          number: 6,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.RED,
            // special: Special.REVERSE,
            number: 9,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.SAY_UNO_AND_PLAY_CARD,
          {
            card_play: {
              color: 'grey',
              number: 9,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(5 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.number).to.equal(6);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(0);
      await Promise.resolve();
    });

    it(`s02-D-TC025: Player 1 say uno and play card Red 9 (before card Red 6) - failed - Reason: Number card play invalid`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          // special: Special.WILD_DRAW_4,
          number: 6,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.RED,
            // special: Special.REVERSE,
            number: 9,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.SAY_UNO_AND_PLAY_CARD,
          {
            card_play: {
              color: Color.RED,
              number: 10,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(5 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.number).to.equal(6);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(0);
      await Promise.resolve();
    });

    it(`s02-D-TC027: Player 1 say uno and play card Red 9 (before card Red 6) - failed - Reason: Card play not exist of player`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          // special: Special.WILD_DRAW_4,
          number: 6,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.BLACK,
            special: Special.WILD_DRAW_4,
            // number: 9,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.SAY_UNO_AND_PLAY_CARD,
          {
            card_play: {
              color: Color.RED,
              // special: Special.WILD_DRAW_4,
              number: 9,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(5 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.number).to.equal(6);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(4);
      await Promise.resolve();
    });

    it(`s02-D-TC028: Player 1 say uno and play card Red Draw_2 (before card Blue 6) - failed - Reason: Card play invalid with card before`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.BLUE,
          // special: Special.WILD_DRAW_4,
          number: 6,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.RED,
            special: Special.DRAW_2,
            // number: 9,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.SAY_UNO_AND_PLAY_CARD,
          {
            card_play: {
              color: Color.RED,
              special: Special.DRAW_2,
              // number: 9,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(5 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.number).to.equal(6);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.BLUE);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(4);
      await Promise.resolve();
    });

    it(`s02-D-TC029: Player 1 say uno and play card Blue Skip (before card Red 5) - failed - Reason: Card play invalid with card before`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          // special: Special.WILD_DRAW_4,
          number: 5,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.RED,
            special: Special.DRAW_2,
            // number: 9,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.SAY_UNO_AND_PLAY_CARD,
          {
            card_play: {
              color: Color.BLUE,
              special: Special.SKIP,
              // number: 9,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(5 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.number).to.equal(5);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(4);
      await Promise.resolve();
    });

    it(`s02-D-TC030: Player 1 say uno and play card Red Draw_2 (before card Blue Skip) - failed - Reason: Card play invalid with card before`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.BLUE,
          special: Special.SKIP,
          // number: 5,
        },
        cardOfPlayer: [
          {
            color: Color.RED,
            special: Special.DRAW_2,
          },
          {
            color: Color.RED,
            // special: Special.DRAW_2,
            number: 9,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.SAY_UNO_AND_PLAY_CARD,
          {
            card_play: {
              color: Color.RED,
              special: Special.DRAW_2,
              // number: 9,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(5 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.SKIP);
      // chai.expect(desk.beforeCardPlay.number).to.equal(5);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.BLUE);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(4);
      await Promise.resolve();
    });

    it(`s02-D-TC031: Player 1 say uno and play card Blue Skip (before card Blue Wild) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.BLUE,
          special: Special.WILD,
          // number: 5,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.RED,
            // special: Special.DRAW_2,
            number: 9,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: false,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.SAY_UNO_AND_PLAY_CARD,
          {
            card_play: {
              color: Color.BLUE,
              special: Special.SKIP,
              // number: 9,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(2 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_3);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.SKIP);
      // chai.expect(desk.beforeCardPlay.number).to.equal(5);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.BLUE);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.mustCallDrawCard).to.equal(false);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(1);
      await Promise.resolve();
    });

    it(`s02-D-TC032: Player 1 say uno and play card Blue Skip (Player 3 play card Blue Wild) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.BLUE,
          special: Special.WILD,
          // number: 5,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.RED,
            // special: Special.DRAW_2,
            number: 9,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: false,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.SAY_UNO_AND_PLAY_CARD,
          {
            card_play: {
              color: Color.BLUE,
              special: Special.SKIP,
              // number: 9,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(2 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_3);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.SKIP);
      // chai.expect(desk.beforeCardPlay.number).to.equal(5);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.BLUE);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.mustCallDrawCard).to.equal(false);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(1);
      await Promise.resolve();
    });

    it(`s02-D-TC033: Player 1 say uno and play card Blue 6 (Player 4 play card Blue Wild) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.BLUE,
          special: Special.WILD,
          // number: 5,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.BLUE,
            // special: Special.DRAW_2,
            number: 6,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: false,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.SAY_UNO_AND_PLAY_CARD,
          {
            card_play: {
              color: Color.BLUE,
              // special: Special.SKIP,
              number: 6,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(2 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      // chai.expect(desk.beforeCardPlay.special).to.equal(Special.SKIP);
      chai.expect(desk.beforeCardPlay.number).to.equal(6);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.BLUE);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.mustCallDrawCard).to.equal(false);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(1);
      await Promise.resolve();
    });

    it(`s02-D-TC034: Player 1 say uno and play card Red 6 (Player 4 play card Blue Wild) - failed - Reason: Card play invalid with card before`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.BLUE,
          special: Special.WILD,
          // number: 5,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.RED,
            // special: Special.DRAW_2,
            number: 6,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: false,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.SAY_UNO_AND_PLAY_CARD,
          {
            card_play: {
              color: Color.RED,
              // special: Special.SKIP,
              number: 6,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(5 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.WILD);
      // chai.expect(desk.beforeCardPlay.number).to.equal(6);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.BLUE);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.mustCallDrawCard).to.equal(false);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(4);
      await Promise.resolve();
    });

    it(`s02-D-TC035: Player 1 say uno and play card Blue Skip (Player 3 play card Blue Wild_draw_4) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.BLUE,
          special: Special.WILD_DRAW_4,
          // number: 5,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.RED,
            // special: Special.DRAW_2,
            number: 6,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: false,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.SAY_UNO_AND_PLAY_CARD,
          {
            card_play: {
              color: Color.BLUE,
              special: Special.SKIP,
              // number: 6,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(2 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_3);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.SKIP);
      // chai.expect(desk.beforeCardPlay.number).to.equal(6);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.BLUE);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.mustCallDrawCard).to.equal(false);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(1);
      await Promise.resolve();
    });

    it(`s02-D-TC036: Player 1 say uno and play card Blue Draw_2 (Player 3 play card Blue Wild_draw_4) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.BLUE,
          special: Special.WILD_DRAW_4,
          // number: 5,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.DRAW_2,
          },
          {
            color: Color.RED,
            // special: Special.DRAW_2,
            number: 6,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: false,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.SAY_UNO_AND_PLAY_CARD,
          {
            card_play: {
              color: Color.BLUE,
              special: Special.DRAW_2,
              // number: 6,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(2 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.DRAW_2);
      // chai.expect(desk.beforeCardPlay.number).to.equal(6);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.BLUE);
      chai.expect(desk.cardAddOn).to.equal(2);
      chai.expect(desk.mustCallDrawCard).to.equal(true);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(1);
      await Promise.resolve();
    });

    it(`s02-D-TC037: Player 1 say uno and play card Blue 6 (Player 3 play card Blue Wild_draw_4) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.BLUE,
          special: Special.WILD_DRAW_4,
          // number: 5,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.DRAW_2,
          },
          {
            color: Color.BLUE,
            // special: Special.DRAW_2,
            number: 6,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: false,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.SAY_UNO_AND_PLAY_CARD,
          {
            card_play: {
              color: Color.BLUE,
              // special: Special.DRAW_2,
              number: 6,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(2 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      // chai.expect(desk.beforeCardPlay.special).to.equal(Special.DRAW_2);
      chai.expect(desk.beforeCardPlay.number).to.equal(6);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.BLUE);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.mustCallDrawCard).to.equal(false);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(1);
      await Promise.resolve();
    });

    it(`s02-D-TC038: Player 1 say uno and play card Red 6 (Player 3 play card Blue Wild_draw_4) - failed - Reason: Card play invalid with card before`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.BLUE,
          special: Special.WILD_DRAW_4,
          // number: 5,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.DRAW_2,
          },
          {
            color: Color.RED,
            // special: Special.DRAW_2,
            number: 6,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: false,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.SAY_UNO_AND_PLAY_CARD,
          {
            card_play: {
              color: Color.RED,
              // special: Special.DRAW_2,
              number: 6,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(5 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.WILD_DRAW_4);
      // chai.expect(desk.beforeCardPlay.number).to.equal(6);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.BLUE);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.mustCallDrawCard).to.equal(false);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(4);
      await Promise.resolve();
    });

    it(`s02-D-TC039: Player 1 say uno and play card Blue Skip (before card Wild_draw_4) - failed - Reason: Card play invalid with card before`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.BLUE,
          special: Special.WILD_DRAW_4,
          // number: 5,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.RED,
            // special: Special.DRAW_2,
            number: 9,
          },
        ],
        cardAddOn: 4,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.SAY_UNO_AND_PLAY_CARD,
          {
            card_play: {
              color: Color.BLUE,
              special: Special.SKIP,
              // number: 9,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(5 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.WILD_DRAW_4);
      // chai.expect(desk.beforeCardPlay.number).to.equal(5);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.BLUE);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.mustCallDrawCard).to.equal(false);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(8); // cardOfPlayer(2) + penalty(2) + WILD_DRAW_4(4)
      await Promise.resolve();
    });

    it(`s02-D-TC040: Player 1 say uno and play card Blue 5 (before card Red Wild_shuffle) - failed - Reason: Card play invalid with card before`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          special: Special.WILD_SHUFFLE,
          // number: 5,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.BLUE,
            // special: Special.DRAW_2,
            number: 5,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.SAY_UNO_AND_PLAY_CARD,
          {
            card_play: {
              color: Color.BLUE,
              // special: Special.SKIP,
              number: 5,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(5 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.WILD_SHUFFLE);
      // chai.expect(desk.beforeCardPlay.number).to.equal(5);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(4);
      await Promise.resolve();
    });

    it(`s02-D-TC041: Player 1 can not say uno and play card Blue 5 (next player is Player 4) - failed - Reason: Next player invalid`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_3,
        nextPlayer: Consts.PLAYER_4,
        beforeCardPlay: {
          color: Color.RED,
          number: 5,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.BLUE,
            // special: Special.DRAW_2,
            number: 5,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
      });
      await CommonService.setCardOfPlayer(Consts.DEALER_2, Consts.PLAYER_1, [
        {
          color: Color.YELLOW,
          number: 1,
        },
        {
          color: Color.BLUE,
          special: Special.SKIP,
        },
        {
          color: Color.BLUE,
          special: Special.REVERSE,
        },
      ]);
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.SAY_UNO_AND_PLAY_CARD,
          {
            card_play: {
              color: Color.BLUE,
              // special: Special.SKIP,
              number: 5,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(5 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_4);
      chai.expect(desk.beforeCardPlay.number).to.equal(5);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(5); // cardOfPlayer(3) + penalty(2)
      await Promise.resolve();
    });

    it(`s02-D-TC042: Player 1 can not say uno and play card Blue 5 (Player 1 remain 3 cards on the hand) - failed - Reason: Can not say uno and play card`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          number: 5,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.BLUE,
            // special: Special.DRAW_2,
            number: 5,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.SAY_UNO_AND_PLAY_CARD,
          {
            card_play: {
              color: Color.BLUE,
              // special: Special.SKIP,
              number: 5,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(5 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.number).to.equal(5);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(0);
      await Promise.resolve();
    });

    it(`s02-D-TC043: Player 1 say uno and play card Red Draw_2 (before card Blue Draw_2) - failed - Error: Card play invalid with card before`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.BLUE,
          special: Special.DRAW_2,
          // number: 6,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.RED,
            special: Special.DRAW_2,
          },
        ],
        cardAddOn: 2,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.SAY_UNO_AND_PLAY_CARD,
          {
            card_play: {
              color: Color.RED,
              special: Special.DRAW_2,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(5 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.DRAW_2);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.BLUE);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.mustCallDrawCard).to.equal(false);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(6); // cardOfPlayer(2) + penalty(2) + DRAW_2(2)
      await Promise.resolve();
    });

    it(`s02-D-TC044: Player 1 say uno and play card Wild (before card Red Wild_draw_4) - failed - Error: Card play invalid with card before`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          special: Special.WILD_DRAW_4,
          // number: 6,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.BLACK,
            special: Special.WILD,
          },
        ],
        cardAddOn: 4,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.SAY_UNO_AND_PLAY_CARD,
          {
            card_play: {
              color: Color.BLACK,
              special: Special.WILD,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(5 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.WILD_DRAW_4);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.mustCallDrawCard).to.equal(false);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(8); // cardOfPlayer(2) + penalty(2) + WILD_DRAW_4(4)
      await Promise.resolve();
    });

    it(`s02-D-TC045: Player 1 say uno and play card Wild (before card Red Draw_2) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          special: Special.DRAW_2,
          // number: 6,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.BLACK,
            special: Special.WILD,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: false,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.SAY_UNO_AND_PLAY_CARD,
          {
            card_play: {
              color: Color.BLACK,
              special: Special.WILD,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(2 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_1);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.WILD);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.BLACK);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.mustCallDrawCard).to.equal(false);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(1);
      await Promise.resolve();
    });

    it(`s02-D-TC046: Player 1 say uno and play card Wild (before card Red Draw_2) - failed - Error: Card play invalid with card before`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          special: Special.DRAW_2,
          // number: 6,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.BLACK,
            special: Special.WILD,
          },
        ],
        cardAddOn: 2,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.SAY_UNO_AND_PLAY_CARD,
          {
            card_play: {
              color: Color.BLACK,
              special: Special.WILD,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(5 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.DRAW_2);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.mustCallDrawCard).to.equal(false);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(6); // cardOfPlayer(2) + penalty(2) + DRAW_2(2)
      await Promise.resolve();
    });

    it(`s02-D-TC047: Player 1 say uno and play card Wild_draw_4 (before card Red Wild_draw_4) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          special: Special.WILD_DRAW_4,
          // number: 6,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.BLACK,
            special: Special.WILD_DRAW_4,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: false,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.SAY_UNO_AND_PLAY_CARD,
          {
            card_play: {
              color: Color.BLACK,
              special: Special.WILD_DRAW_4,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(5 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_1);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.WILD_DRAW_4);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.BLACK);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.mustCallDrawCard).to.equal(false);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(1);
      await Promise.resolve();
    });

    it(`s02-D-TC048: Player 1 say uno and play card Wild_draw_4 (before card Red Wild_draw_4) - failed - Error: Card play invalid with card before`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          special: Special.WILD_DRAW_4,
          // number: 6,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.BLACK,
            special: Special.WILD_DRAW_4,
          },
        ],
        cardAddOn: 4,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.SAY_UNO_AND_PLAY_CARD,
          {
            card_play: {
              color: Color.BLACK,
              special: Special.WILD_DRAW_4,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(5 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.WILD_DRAW_4);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.mustCallDrawCard).to.equal(false);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(8); // cardOfPlayer(2) + penalty(2) + WILD_DRAW_4(4)
      await Promise.resolve();
    });

    it(`s02-D-TC049: Player 1 say uno and play card Wild_draw_4 (before card Red Draw_2) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          special: Special.DRAW_2,
          // number: 6,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.BLACK,
            special: Special.WILD_DRAW_4,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: false,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.SAY_UNO_AND_PLAY_CARD,
          {
            card_play: {
              color: Color.BLACK,
              special: Special.WILD_DRAW_4,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(2 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_1);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.WILD_DRAW_4);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.BLACK);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.mustCallDrawCard).to.equal(false);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(1);
      await Promise.resolve();
    });

    it(`s02-D-TC050: Player 1 say uno and play card Wild_draw_4 (before card Red Draw_2) - failed - Error: Card play invalid with card before`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          special: Special.DRAW_2,
          // number: 6,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.BLACK,
            special: Special.WILD_DRAW_4,
          },
        ],
        cardAddOn: 2,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.SAY_UNO_AND_PLAY_CARD,
          {
            card_play: {
              color: Color.BLACK,
              special: Special.WILD_DRAW_4,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(5 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.DRAW_2);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.mustCallDrawCard).to.equal(false);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(6); // cardOfPlayer(2) + penalty(2) + DRAW_2(2)
      await Promise.resolve();
    });

    it(`s02-D-TC051: Player 1 say uno and play card Wild_shuffle (before card Red Wild_draw_4) - failed - Error: Card play invalid with card before`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          special: Special.WILD_DRAW_4,
          // number: 6,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.BLACK,
            special: Special.WILD_SHUFFLE,
          },
        ],
        cardAddOn: 4,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.SAY_UNO_AND_PLAY_CARD,
          {
            card_play: {
              color: Color.BLACK,
              special: Special.WILD_SHUFFLE,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(5 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.WILD_DRAW_4);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.mustCallDrawCard).to.equal(false);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(8); // cardOfPlayer(2) + penalty(2) + WILD_DRAW_4(4)
      await Promise.resolve();
    });

    it(`s02-D-TC052: Player 1 say uno and play card Wild_shuffle (before card Red Draw_2) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          special: Special.DRAW_2,
          // number: 6,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.BLACK,
            special: Special.WILD_SHUFFLE,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: false,
      });
      await CommonService.setCardOfPlayer(Consts.DEALER_2, Consts.PLAYER_2, [
        {
          color: Color.YELLOW,
          number: 1,
        },
        {
          color: Color.BLUE,
          special: Special.SKIP,
        },
        {
          color: Color.BLUE,
          special: Special.REVERSE,
        },
      ]);
      await CommonService.setCardOfPlayer(Consts.DEALER_2, Consts.PLAYER_3, [
        {
          color: Color.RED,
          number: 9,
        },
      ]);
      await CommonService.setCardOfPlayer(Consts.DEALER_2, Consts.PLAYER_4, [
        {
          color: Color.YELLOW,
          number: 1,
        },
        {
          color: Color.GREEN,
          special: Special.DRAW_2,
        },
        {
          color: Color.GREEN,
          number: 2,
        },
        {
          color: Color.GREEN,
          number: 5,
        },
      ]);
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.SAY_UNO_AND_PLAY_CARD,
          {
            card_play: {
              color: Color.BLACK,
              special: Special.WILD_SHUFFLE,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(3 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_1);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.WILD_SHUFFLE);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.BLACK);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.mustCallDrawCard).to.equal(false);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(2);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_2].length).to.equal(3);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_3].length).to.equal(2);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_4].length).to.equal(2);
      await Promise.resolve();
    });

    it(`s02-D-TC053: Player 1 say uno and play card Wild_shuffle (before card Red Draw_2) - failed - Error: Card play invalid with card before`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          special: Special.DRAW_2,
          // number: 6,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.BLACK,
            special: Special.WILD_SHUFFLE,
          },
        ],
        cardAddOn: 2,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.SAY_UNO_AND_PLAY_CARD,
          {
            card_play: {
              color: Color.BLACK,
              special: Special.WILD_SHUFFLE,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(5 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.DRAW_2);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.mustCallDrawCard).to.equal(false);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(6); // cardOfPlayer(2) + penalty(2) + DRAW_2(2)
      await Promise.resolve();
    });

    it(`s02-D-TC054: Player 1 say uno and play card White_wild[bind_2] (before card Red 6) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          special: Special.DRAW_2,
          // number: 6,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.BLACK,
            special: Special.WHITE_WILD,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: false,
        whiteWild: WhiteWild.BIND_2,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.SAY_UNO_AND_PLAY_CARD,
          {
            card_play: {
              color: Color.BLACK,
              special: Special.WHITE_WILD,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(3 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.WHITE_WILD);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.mustCallDrawCard).to.equal(true);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(1);
      if (desk.activationWhiteWild) {
        chai.expect(desk.activationWhiteWild[Consts.PLAYER_2]).to.equal(2);
      }
      await Promise.resolve();
    });

    it(`s02-D-TC055: Player 1 say uno and play card White_wild[bind_2] (before card Red Skip) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_3,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          special: Special.SKIP,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.BLACK,
            special: Special.WHITE_WILD,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: false,
        whiteWild: WhiteWild.BIND_2,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.SAY_UNO_AND_PLAY_CARD,
          {
            card_play: {
              color: Color.BLACK,
              special: Special.WHITE_WILD,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(3 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.WHITE_WILD);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.mustCallDrawCard).to.equal(true);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(1);
      if (desk.activationWhiteWild) {
        chai.expect(desk.activationWhiteWild[Consts.PLAYER_2]).to.equal(2);
      }
      await Promise.resolve();
    });

    it(`s02-D-TC056: Player 1 say uno and play card White_wild[bind_2] (before card Red Reverse) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_2,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          special: Special.REVERSE,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.BLACK,
            special: Special.WHITE_WILD,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: false,
        mustCallDrawCard: false,
        whiteWild: WhiteWild.BIND_2,
        activationWhiteWild: {},
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.SAY_UNO_AND_PLAY_CARD,
          {
            card_play: {
              color: Color.BLACK,
              special: Special.WHITE_WILD,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(3 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_4);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.WHITE_WILD);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.mustCallDrawCard).to.equal(true);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(1);
      if (desk.activationWhiteWild) {
        chai.expect(desk.activationWhiteWild[Consts.PLAYER_4]).to.equal(2);
      }
      await Promise.resolve();
    });

    it(`s02-D-TC057: Player 1 say uno and play card White_wild[bind_2] (before card Red Draw_2) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          special: Special.DRAW_2,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.BLACK,
            special: Special.WHITE_WILD,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: false,
        whiteWild: WhiteWild.BIND_2,
        activationWhiteWild: {},
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.SAY_UNO_AND_PLAY_CARD,
          {
            card_play: {
              color: Color.BLACK,
              special: Special.WHITE_WILD,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(3 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.WHITE_WILD);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.mustCallDrawCard).to.equal(true);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(1);
      if (desk.activationWhiteWild) {
        chai.expect(desk.activationWhiteWild[Consts.PLAYER_2]).to.equal(2);
      }
      await Promise.resolve();
    });

    it(`s02-D-TC058: Player 1 say uno and play card White_wild[bind_2] (before card Red Wild) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          special: Special.WILD,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.BLACK,
            special: Special.WHITE_WILD,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: false,
        whiteWild: WhiteWild.BIND_2,
        activationWhiteWild: {},
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.SAY_UNO_AND_PLAY_CARD,
          {
            card_play: {
              color: Color.BLACK,
              special: Special.WHITE_WILD,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(3 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.WHITE_WILD);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.mustCallDrawCard).to.equal(true);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(1);
      if (desk.activationWhiteWild) {
        chai.expect(desk.activationWhiteWild[Consts.PLAYER_2]).to.equal(2);
      }
      await Promise.resolve();
    });

    it(`s02-D-TC059: Player 1 say uno and play card White_wild[bind_2] (before card Red Wild_shuffle) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          special: Special.WILD_SHUFFLE,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.BLACK,
            special: Special.WHITE_WILD,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: false,
        whiteWild: WhiteWild.BIND_2,
        activationWhiteWild: {},
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.SAY_UNO_AND_PLAY_CARD,
          {
            card_play: {
              color: Color.BLACK,
              special: Special.WHITE_WILD,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(3 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.WHITE_WILD);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.mustCallDrawCard).to.equal(true);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(1);
      if (desk.activationWhiteWild) {
        chai.expect(desk.activationWhiteWild[Consts.PLAYER_2]).to.equal(2);
      }
      await Promise.resolve();
    });

    it(`s02-D-TC060: Player 1 say uno and play card White_wild[bind_2] (before card Red Wild_draw_4) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          special: Special.WILD_DRAW_4,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.BLACK,
            special: Special.WHITE_WILD,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: false,
        whiteWild: WhiteWild.BIND_2,
        activationWhiteWild: {},
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.SAY_UNO_AND_PLAY_CARD,
          {
            card_play: {
              color: Color.BLACK,
              special: Special.WHITE_WILD,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(3 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.WHITE_WILD);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.mustCallDrawCard).to.equal(true);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(1);
      if (desk.activationWhiteWild) {
        chai.expect(desk.activationWhiteWild[Consts.PLAYER_2]).to.equal(2);
      }
      await Promise.resolve();
    });

    it(`s02-D-TC061: Player 1 say uno and play card White_wild[bind_2] (before card Red Draw_2) - failed - Error: Card play invalid with card before`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          special: Special.DRAW_2,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.BLACK,
            special: Special.WHITE_WILD,
          },
        ],
        cardAddOn: 2,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: true,
        whiteWild: WhiteWild.BIND_2,
        activationWhiteWild: {},
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.SAY_UNO_AND_PLAY_CARD,
          {
            card_play: {
              color: Color.BLACK,
              special: Special.WHITE_WILD,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(5 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.DRAW_2);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.mustCallDrawCard).to.equal(false);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(6); // cardOfPlayer(2) + penalty(2) + DRAW_2(2)
      await Promise.resolve();
    });

    it(`s02-D-TC062: Player 1 say uno and play card White_wild[bind_2] (before card Red Wild_draw_2) - failed - Error: Card play invalid with card before`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          special: Special.WILD_DRAW_4,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.BLACK,
            special: Special.WHITE_WILD,
          },
        ],
        cardAddOn: 4,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: true,
        whiteWild: WhiteWild.BIND_2,
        activationWhiteWild: {},
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.SAY_UNO_AND_PLAY_CARD,
          {
            card_play: {
              color: Color.BLACK,
              special: Special.WHITE_WILD,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(5 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.WILD_DRAW_4);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.mustCallDrawCard).to.equal(false);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(8); // cardOfPlayer(2) + penalty(2) + WILD_DRAW_4(2)
      await Promise.resolve();
    });

    it(`s02-D-TC063: Player 1 say uno and play card White_wild[bind_2] (before card Red 6 White_wild 2nd times) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          number: 6,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.BLACK,
            special: Special.WHITE_WILD,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: false,
        whiteWild: WhiteWild.BIND_2,
        activationWhiteWild: {},
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.SAY_UNO_AND_PLAY_CARD,
          {
            card_play: {
              color: Color.BLACK,
              special: Special.WHITE_WILD,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(3 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.WHITE_WILD);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.mustCallDrawCard).to.equal(true);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(1);
      chai.expect(desk.activationWhiteWild).to.not.undefined;
      if (desk.activationWhiteWild) {
        chai.expect(desk.activationWhiteWild[Consts.PLAYER_2]).to.equal(2);
      }
      await Promise.resolve();
    });

    it(`s02-D-TC064: Player 1 can not say uno and play card Blue 5 (next player is Player 4) - failed - Reason: Interrupts are restricted`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_3,
        nextPlayer: Consts.PLAYER_4,
        beforeCardPlay: {
          color: Color.RED,
          number: 5,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.BLUE,
            // special: Special.DRAW_2,
            number: 5,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        restrictInterrupt: true,
      });
      await CommonService.setCardOfPlayer(Consts.DEALER_2, Consts.PLAYER_1, [
        {
          color: Color.YELLOW,
          number: 1,
        },
        {
          color: Color.BLUE,
          special: Special.SKIP,
        },
        {
          color: Color.BLUE,
          special: Special.REVERSE,
        },
      ]);
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.SAY_UNO_AND_PLAY_CARD,
          {
            card_play: {
              color: Color.BLUE,
              // special: Special.SKIP,
              number: 5,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(5 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_4);
      chai.expect(desk.beforeCardPlay.number).to.equal(5);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(3); // cardOfPlayer(3) + penalty(0)
      await Promise.resolve();
    });
  });

  /* /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */
  /** Test Event Consts.SOCKET.EVENT.DRAW_CARD */
  describe(`Test Event ${Consts.SOCKET.EVENT.DRAW_CARD}`, () => {
    it(`s02-I-TC001: Player 1 draw card (before card Red Draw_2) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          special: Special.DRAW_2,
          // number: 0
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.RED,
            number: 9,
          },
        ],
        cardAddOn: 2,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(Consts.SOCKET.EVENT.DRAW_CARD, {}, () => {
          resolve();
        });
      });
      await BlueBird.delay(2 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.DRAW_2);
      // chai.expect(desk.beforeCardPlay.number).to.equal(9);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(4);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.mustCallDrawCard).to.equal(false);
      chai.expect(desk.canCallPlayDrawCard).to.equal(false);
      await Promise.resolve();
    });

    it(`s02-I-TC002: Player 1 draw card (before card Red Wild) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          special: Special.WILD,
          // number: 0
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.RED,
            number: 9,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: false,
      });
      await CommonService.pushCardToDesk(Consts.DEALER_2, [
        {
          color: Color.RED,
          number: 9,
        },
      ]);
      await new Promise<void>((resolve) => {
        client1.emit(Consts.SOCKET.EVENT.DRAW_CARD, {}, () => {
          resolve();
        });
      });
      await BlueBird.delay(2 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_1);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.WILD);
      // chai.expect(desk.beforeCardPlay.number).to.equal(9);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(3);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.mustCallDrawCard).to.equal(false);
      chai.expect(desk.canCallPlayDrawCard).to.equal(true);
      chai.expect(desk.cardBeforeDrawCard).to.eql({
        color: Color.RED,
        number: 9,
      });
      await Promise.resolve();
    });

    it(`s02-I-TC003: Player 1 draw card (before card Red Wild_draw_4) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          special: Special.WILD_DRAW_4,
          // number: 0
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.RED,
            number: 9,
          },
        ],
        cardAddOn: 4,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(Consts.SOCKET.EVENT.DRAW_CARD, {}, () => {
          resolve();
        });
      });
      await BlueBird.delay(2 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.WILD_DRAW_4);
      // chai.expect(desk.beforeCardPlay.number).to.equal(9);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(6);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.mustCallDrawCard).to.equal(false);
      chai.expect(desk.canCallPlayDrawCard).to.equal(false);
      await Promise.resolve();
    });

    it(`s02-I-TC004: Player 1 draw card (before card Red Draw_2) - successfully
    `, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          special: Special.WILD_DRAW_4,
          // number: 0
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.RED,
            number: 9,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: true,
      });
      await CommonService.pushCardToDesk(Consts.DEALER_2, [
        {
          color: Color.RED,
          number: 2,
        },
      ]);
      await new Promise<void>((resolve) => {
        client1.emit(Consts.SOCKET.EVENT.DRAW_CARD, {}, () => {
          resolve();
        });
      });
      await BlueBird.delay(2 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_1);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.WILD_DRAW_4);
      // chai.expect(desk.beforeCardPlay.number).to.equal(9);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(3);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.mustCallDrawCard).to.equal(false);
      chai.expect(desk.canCallPlayDrawCard).to.equal(true);
      await Promise.resolve();
    });

    it(`s02-I-TC005: Player 1 draw-card (before card Red 6) - failed Reason: Can not draw card exceed 25`, async () => {
      const cardsOfPlayer = [...Consts.CARD_SET_25];

      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          number: 6,
        },
        cardOfPlayer: cardsOfPlayer,
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: false,
      });
      await new Promise<void>((resolve) => {
        client1.emit(Consts.SOCKET.EVENT.DRAW_CARD, {}, () => {
          resolve();
        });
      });
      await BlueBird.delay(5 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.number).to.equal(6);
      // chai.expect(desk.beforeCardPlay.number).to.equal(0);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(25);
      chai.expect(desk.cardAddOn).to.equal(0);
      await Promise.resolve();
    });

    it(`s02-I-TC006: Player 1 can not call draw card (next player is Player 4) Reason: Next player invalid`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_3,
        nextPlayer: Consts.PLAYER_4,
        beforeCardPlay: {
          color: Color.RED,
          special: Special.WILD_DRAW_4,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.RED,
            number: 9,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: false,
      });
      await CommonService.setCardOfPlayer(Consts.DEALER_2, Consts.PLAYER_1, [
        {
          color: Color.RED,
          number: 1,
        },
        {
          color: Color.RED,
          number: 0,
        },
      ]);
      await new Promise<void>((resolve) => {
        client1.emit(Consts.SOCKET.EVENT.DRAW_CARD, {}, () => {
          resolve();
        });
      });
      await BlueBird.delay(2 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_4);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.WILD_DRAW_4);
      // chai.expect(desk.beforeCardPlay.number).to.equal(9);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(4); // cardOfPlayer(2) + penalty(2)
      chai.expect(desk.cardAddOn).to.equal(0);
      await Promise.resolve();
    });

    it(`s02-I-TC007: Player 1 draw card (before card Red Draw_2 Player 1 have 25 cards) - successfully`, async () => {
      const cardsOfPlayer = [...Consts.CARD_SET_25];

      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          special: Special.DRAW_2,
          // number: 0
        },
        cardOfPlayer: cardsOfPlayer,
        cardAddOn: 2,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(Consts.SOCKET.EVENT.DRAW_CARD, {}, () => {
          resolve();
        });
      });
      await BlueBird.delay(3 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.DRAW_2);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(cardsOfPlayer.length + 2);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.canCallPlayDrawCard).to.equal(false);
      await Promise.resolve();
    });

    it(`s02-I-TC008: Player 1 draw card (before card Red Wild_draw_4 Player 1 have 25 cards) - successfully`, async () => {
      const cardsOfPlayer = [...Consts.CARD_SET_25];

      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          special: Special.WILD_DRAW_4,
          // number: 0
        },
        cardOfPlayer: cardsOfPlayer,
        cardAddOn: 4,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(Consts.SOCKET.EVENT.DRAW_CARD, {}, () => {
          resolve();
        });
      });
      await BlueBird.delay(3 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.WILD_DRAW_4);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(cardsOfPlayer.length + 4);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.canCallPlayDrawCard).to.equal(false);
      await Promise.resolve();
    });

    it(`s02-I-TC009: Player 1 draw card (before card Red White_wild) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          special: Special.WHITE_WILD,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.RED,
            number: 9,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: true,
        activationWhiteWild: {
          [Consts.PLAYER_1]: 2,
        },
      });
      await new Promise<void>((resolve) => {
        client1.emit(Consts.SOCKET.EVENT.DRAW_CARD, {}, () => {
          resolve();
        });
      });
      await BlueBird.delay(3 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.WHITE_WILD);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(3);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.canCallPlayDrawCard).to.equal(false);
      chai.expect(desk.activationWhiteWild).to.not.undefined;
      if (desk.activationWhiteWild) {
        chai.expect(desk.activationWhiteWild[Consts.PLAYER_1]).to.equal(1);
      }
      await Promise.resolve();
    });

    it(`s02-I-TC010: Player 1 draw card (before card Red White_wild Player 1 have 25 cards) - successfully`, async () => {
      const cardsOfPlayer = [...Consts.CARD_SET_25];

      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          special: Special.WHITE_WILD,
        },
        cardOfPlayer: cardsOfPlayer,
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: true,
        activationWhiteWild: {
          [Consts.PLAYER_1]: 2,
        },
      });
      await new Promise<void>((resolve) => {
        client1.emit(Consts.SOCKET.EVENT.DRAW_CARD, {}, () => {
          resolve();
        });
      });
      await BlueBird.delay(3 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.WHITE_WILD);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(cardsOfPlayer.length + 1);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.canCallPlayDrawCard).to.equal(false);
      chai.expect(desk.activationWhiteWild).to.not.undefined;
      if (desk.activationWhiteWild) {
        chai.expect(desk.activationWhiteWild[Consts.PLAYER_1]).to.equal(1);
      }
      await Promise.resolve();
    });

    it(`s02-I-TC011: Player 1 draw card (before card Red 6 White_wild 2nd lap) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          number: 6,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.RED,
            number: 9,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: true,
        activationWhiteWild: {
          [Consts.PLAYER_1]: 1,
        },
      });
      await new Promise<void>((resolve) => {
        client1.emit(Consts.SOCKET.EVENT.DRAW_CARD, {}, () => {
          resolve();
        });
      });
      await BlueBird.delay(3 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.number).to.equal(6);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(3);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.canCallPlayDrawCard).to.equal(false);
      chai.expect(desk.activationWhiteWild).to.not.undefined;
      if (desk.activationWhiteWild) {
        chai.expect(desk.activationWhiteWild[Consts.PLAYER_1]).to.equal(0);
      }
      await Promise.resolve();
    });

    it(`s02-I-TC012: Player 1 draw card (before card Red 6 White_wild 2nd lap Player 1 have 25 cards) - successfully`, async () => {
      const cardsOfPlayer = [...Consts.CARD_SET_25];

      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          number: 6,
        },
        cardOfPlayer: cardsOfPlayer,
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: true,
        activationWhiteWild: {
          [Consts.PLAYER_1]: 1,
        },
      });
      await new Promise<void>((resolve) => {
        client1.emit(Consts.SOCKET.EVENT.DRAW_CARD, {}, () => {
          resolve();
        });
      });
      await BlueBird.delay(3 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.number).to.equal(6);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(cardsOfPlayer.length + 1);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.canCallPlayDrawCard).to.equal(false);
      chai.expect(desk.activationWhiteWild).to.not.undefined;
      if (desk.activationWhiteWild) {
        chai.expect(desk.activationWhiteWild[Consts.PLAYER_1]).to.equal(0);
      }
      await Promise.resolve();
    });

    it(`s02-I-TC013: Player 1 draw card (before card Red 6 Player 1 has 25 cards) - successfully`, async () => {
      const cardOfPlayer = [...Consts.CARD_SET_25];

      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          number: 6,
        },
        cardOfPlayer,
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: false,
      });
      await new Promise<void>((resolve) => {
        client1.emit(Consts.SOCKET.EVENT.DRAW_CARD, {}, () => {
          resolve();
        });
      });
      await BlueBird.delay(2 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.number).to.equal(6);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(cardOfPlayer.length);
      chai.expect(desk.cardAddOn).to.equal(0);
      await Promise.resolve();
    });

    it(`s02-I-TC014: Player 1 no play card (before card Red Draw 2 Player 1 has 25 cards) - successfully`, async () => {
      const cardOfPlayer = [...Consts.CARD_SET_25];

      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          special: Special.DRAW_2,
        },
        cardOfPlayer,
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: false,
      });
      await new Promise<void>((resolve) => {
        client1.emit(Consts.SOCKET.EVENT.DRAW_CARD, {}, () => {
          resolve();
        });
      });
      await BlueBird.delay(2 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.DRAW_2);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(cardOfPlayer.length);
      chai.expect(desk.cardAddOn).to.equal(0);
      await Promise.resolve();
    });

    it(`s02-I-TC015: 39 consecutive no-play-cards`, async () => {
      const cardOfPlayer = [...Consts.CARD_SET_25];

      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          number: 6,
        },
        cardOfPlayer,
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: false,
        noPlayCount: 39,
      });
      await new Promise<void>((resolve) => {
        client1.emit(Consts.SOCKET.EVENT.DRAW_CARD, {}, () => {
          resolve();
        });
      });
      await BlueBird.delay(2 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.number).to.equal(6);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(cardOfPlayer.length);
      chai.expect(desk.noPlayCount).to.equal(40);
      await Promise.resolve();
    });

    it(`s02-I-TC016: 40 consecutive no-play-cards`, async () => {
      const cardOfPlayer = [...Consts.CARD_SET_25];

      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          number: 6,
        },
        cardOfPlayer,
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: false,
        noPlayCount: 40,
      });
      await new Promise<void>((resolve) => {
        client1.emit(Consts.SOCKET.EVENT.DRAW_CARD, {}, () => {
          resolve();
        });
      });
      await BlueBird.delay(5 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(7);
      chai.expect(desk.noPlayCount).to.equal(0);
      await Promise.resolve();
    });

    it(`s02-I-TC017: ReverlDesk leaves the top card and returns to the drawDesk.`, async () => {
      const before: Desk = await CommonService.getDesk(Consts.DEALER_2);
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          special: Special.WILD_DRAW_4,
        },
        cardOfPlayer: before.cardOfPlayer[Consts.PLAYER_1],
        cardAddOn: 4,
        turnRight: true,
        yellUno: false,
        drawDesk: before.revealDesk,
        revealDesk: before.drawDesk,
      });

      await new Promise<void>((resolve) => {
        client1.emit(Consts.SOCKET.EVENT.DRAW_CARD, {}, () => {
          resolve();
        });
      });
      await BlueBird.delay(3 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(11);
      chai.expect(desk.revealDesk.length).to.equal(1);
      chai.expect(desk.drawDesk.length).to.equal(79);
      await Promise.resolve();
    });

    it(`s02-I-TC018: Player 1 can not call draw card (next player is Player 4) Reason: Interrupts are restricted`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_3,
        nextPlayer: Consts.PLAYER_4,
        beforeCardPlay: {
          color: Color.RED,
          special: Special.WILD_DRAW_4,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.RED,
            number: 9,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: false,
        restrictInterrupt: true,
      });
      await CommonService.setCardOfPlayer(Consts.DEALER_2, Consts.PLAYER_1, [
        {
          color: Color.RED,
          number: 1,
        },
        {
          color: Color.RED,
          number: 0,
        },
      ]);
      await new Promise<void>((resolve) => {
        client1.emit(Consts.SOCKET.EVENT.DRAW_CARD, {}, () => {
          resolve();
        });
      });
      await BlueBird.delay(2 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_4);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.WILD_DRAW_4);
      // chai.expect(desk.beforeCardPlay.number).to.equal(9);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(2); // cardOfPlayer(2) + penalty(0)
      chai.expect(desk.cardAddOn).to.equal(0);
      await Promise.resolve();
    });
  });

  /* /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */
  /** Test Event Consts.SOCKET.EVENT.PLAY_DRAW_CARD */
  describe(`Test Event ${Consts.SOCKET.EVENT.PLAY_DRAW_CARD}`, () => {
    it(`s02-J-TC001: Player 1 draw card Red 9 and can play (before card Red 0) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          number: 0,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.YELLOW,
            number: 9,
          },
          {
            color: Color.RED,
            number: 9,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: false,
        canCallPlayDrawCard: true,
        cardBeforeDrawCard: {
          color: Color.RED,
          number: 9,
        },
        restrictInterrupt: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.PLAY_DRAW_CARD,
          {
            is_play_card: true,
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(2 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.number).to.equal(9);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(2);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.mustCallDrawCard).to.equal(false);
      chai.expect(desk.canCallPlayDrawCard).to.equal(false);
      await Promise.resolve();
    });

    it(`s02-J-TC002: Player 1 draw card Blue 6 and can play (before card Red 6) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          number: 6,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.YELLOW,
            number: 9,
          },
          {
            color: Color.BLUE,
            number: 6,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: false,
        canCallPlayDrawCard: true,
        cardBeforeDrawCard: {
          color: Color.BLUE,
          number: 6,
        },
        restrictInterrupt: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(Consts.SOCKET.EVENT.PLAY_DRAW_CARD, { is_play_card: true }, () => {
          resolve();
        });
      });
      await BlueBird.delay(2 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.number).to.equal(6);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.BLUE);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(2);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.mustCallDrawCard).to.equal(false);
      chai.expect(desk.canCallPlayDrawCard).to.equal(false);
      await Promise.resolve();
    });

    it(`s02-J-TC003: Player 1 draw card Red 0 and can play (before card Red 6) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          number: 6,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.YELLOW,
            number: 9,
          },
          {
            color: Color.RED,
            number: 0,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: false,
        canCallPlayDrawCard: true,
        cardBeforeDrawCard: {
          color: Color.RED,
          number: 0,
        },
        restrictInterrupt: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(Consts.SOCKET.EVENT.PLAY_DRAW_CARD, { is_play_card: true }, () => {
          resolve();
        });
      });
      await BlueBird.delay(2 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.number).to.equal(0);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(2);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.mustCallDrawCard).to.equal(false);
      chai.expect(desk.canCallPlayDrawCard).to.equal(false);
      await Promise.resolve();
    });

    it(`s02-J-TC004: Player 1 draw card Blue 6 and can play (before card Blue Skip) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_3,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.BLUE,
          special: Special.SKIP,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.YELLOW,
            number: 9,
          },
          {
            color: Color.BLUE,
            number: 6,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: false,
        canCallPlayDrawCard: true,
        cardBeforeDrawCard: {
          color: Color.BLUE,
          number: 6,
        },
        restrictInterrupt: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(Consts.SOCKET.EVENT.PLAY_DRAW_CARD, { is_play_card: true }, () => {
          resolve();
        });
      });
      await BlueBird.delay(2 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.number).to.equal(6);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.BLUE);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(2);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.mustCallDrawCard).to.equal(false);
      chai.expect(desk.canCallPlayDrawCard).to.equal(false);
      await Promise.resolve();
    });

    it(`s02-J-TC005: Player 1 draw card Blue 6 and can play (before card Blue Reverse) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_2,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.BLUE,
          special: Special.REVERSE,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.YELLOW,
            number: 9,
          },
          {
            color: Color.BLUE,
            number: 6,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: false,
        mustCallDrawCard: false,
        canCallPlayDrawCard: true,
        cardBeforeDrawCard: {
          color: Color.BLUE,
          number: 6,
        },
        restrictInterrupt: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(Consts.SOCKET.EVENT.PLAY_DRAW_CARD, { is_play_card: true }, () => {
          resolve();
        });
      });
      await BlueBird.delay(2 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_4);
      chai.expect(desk.beforeCardPlay.number).to.equal(6);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.BLUE);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(2);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.mustCallDrawCard).to.equal(false);
      chai.expect(desk.canCallPlayDrawCard).to.equal(false);
      await Promise.resolve();
    });

    it(`s02-J-TC006: Player 1 draw card Blue 6 and can play (before card Blue Wild_shuffle) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.BLUE,
          special: Special.WILD_SHUFFLE,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.YELLOW,
            number: 9,
          },
          {
            color: Color.BLUE,
            number: 6,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: false,
        canCallPlayDrawCard: true,
        cardBeforeDrawCard: {
          color: Color.BLUE,
          number: 6,
        },
        restrictInterrupt: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(Consts.SOCKET.EVENT.PLAY_DRAW_CARD, { is_play_card: true }, () => {
          resolve();
        });
      });
      await BlueBird.delay(2 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.number).to.equal(6);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.BLUE);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(2);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.mustCallDrawCard).to.equal(false);
      chai.expect(desk.canCallPlayDrawCard).to.equal(false);
      await Promise.resolve();
    });

    it(`s02-J-TC007: Player 1 draw card Blue Skip and can play (before card Blue 6) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.BLUE,
          number: 6,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.YELLOW,
            number: 9,
          },
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: false,
        canCallPlayDrawCard: true,
        cardBeforeDrawCard: {
          color: Color.BLUE,
          special: Special.SKIP,
        },
        restrictInterrupt: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(Consts.SOCKET.EVENT.PLAY_DRAW_CARD, { is_play_card: true }, () => {
          resolve();
        });
      });
      await BlueBird.delay(2 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_3);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.SKIP);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.BLUE);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(2);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.mustCallDrawCard).to.equal(false);
      chai.expect(desk.canCallPlayDrawCard).to.equal(false);
      await Promise.resolve();
    });

    it(`s02-J-TC008: Player 1 draw card Blue Reverse and can play (before card Blue 6) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.BLUE,
          number: 6,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.YELLOW,
            number: 9,
          },
          {
            color: Color.BLUE,
            special: Special.REVERSE,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: false,
        canCallPlayDrawCard: true,
        cardBeforeDrawCard: {
          color: Color.BLUE,
          special: Special.REVERSE,
        },
        restrictInterrupt: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(Consts.SOCKET.EVENT.PLAY_DRAW_CARD, { is_play_card: true }, () => {
          resolve();
        });
      });
      await BlueBird.delay(2 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_4);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.REVERSE);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.BLUE);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(2);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.turnRight).to.equal(false);
      chai.expect(desk.mustCallDrawCard).to.equal(false);
      chai.expect(desk.canCallPlayDrawCard).to.equal(false);
      await Promise.resolve();
    });

    it(`s02-J-TC009: Player 1 draw card Blue Reverse and can play (before card Blue Skip) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_3,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.BLUE,
          special: Special.SKIP,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.YELLOW,
            number: 9,
          },
          {
            color: Color.BLUE,
            special: Special.REVERSE,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: false,
        canCallPlayDrawCard: true,
        cardBeforeDrawCard: {
          color: Color.BLUE,
          special: Special.REVERSE,
        },
        restrictInterrupt: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(Consts.SOCKET.EVENT.PLAY_DRAW_CARD, { is_play_card: true }, () => {
          resolve();
        });
      });
      await BlueBird.delay(2 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_4);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.REVERSE);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.BLUE);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(2);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.mustCallDrawCard).to.equal(false);
      chai.expect(desk.canCallPlayDrawCard).to.equal(false);
      await Promise.resolve();
    });

    it(`s02-J-TC010: Player 1 draw card Blue Draw_2 and can play (before card Blue 6) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.BLUE,
          number: 6,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.YELLOW,
            number: 9,
          },
          {
            color: Color.BLUE,
            special: Special.DRAW_2,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: false,
        canCallPlayDrawCard: true,
        cardBeforeDrawCard: {
          color: Color.BLUE,
          special: Special.DRAW_2,
        },
        restrictInterrupt: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(Consts.SOCKET.EVENT.PLAY_DRAW_CARD, { is_play_card: true }, () => {
          resolve();
        });
      });
      await BlueBird.delay(2 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.DRAW_2);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.BLUE);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(2);
      chai.expect(desk.cardAddOn).to.equal(2);
      chai.expect(desk.mustCallDrawCard).to.equal(true);
      chai.expect(desk.canCallPlayDrawCard).to.equal(false);
      await Promise.resolve();
    });

    it(`s02-J-TC011: Player 1 draw card Wild and can play (before card Blue 6) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.BLUE,
          number: 6,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.YELLOW,
            number: 9,
          },
          {
            color: Color.BLACK,
            special: Special.WILD,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: false,
        canCallPlayDrawCard: true,
        cardBeforeDrawCard: {
          color: Color.BLACK,
          special: Special.WILD,
        },
        restrictInterrupt: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(Consts.SOCKET.EVENT.PLAY_DRAW_CARD, { is_play_card: true }, () => {
          resolve();
        });
      });
      await BlueBird.delay(2 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_1);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.WILD);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.BLACK);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(2);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.mustCallDrawCard).to.equal(false);
      chai.expect(desk.canCallPlayDrawCard).to.equal(false);
      await Promise.resolve();
    });

    it(`s02-J-TC012: Player 1 draw card Wild_draw_4 and can play (before card Blue 6) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.BLUE,
          number: 6,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.YELLOW,
            number: 9,
          },
          {
            color: Color.BLACK,
            special: Special.WILD_DRAW_4,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: false,
        canCallPlayDrawCard: true,
        cardBeforeDrawCard: {
          color: Color.BLACK,
          special: Special.WILD_DRAW_4,
        },
        restrictInterrupt: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(Consts.SOCKET.EVENT.PLAY_DRAW_CARD, { is_play_card: true }, () => {
          resolve();
        });
      });
      await BlueBird.delay(2 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_1);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.WILD_DRAW_4);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.BLACK);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(2);
      chai.expect(desk.cardAddOn).to.equal(0); // Adding to cardAddOn is a color-of-wild event
      chai.expect(desk.mustCallDrawCard).to.equal(false);
      chai.expect(desk.canCallPlayDrawCard).to.equal(false);
      await Promise.resolve();
    });

    it(`s02-J-TC013: Player 1 draw card Wild_shuffle and can play (before card Blue 6) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.BLUE,
          number: 6,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.YELLOW,
            number: 9,
          },
          {
            color: Color.BLACK,
            special: Special.WILD_SHUFFLE,
          },
        ],
        cardAddOn: 0,
        yellUno: false,

        turnRight: true,
        mustCallDrawCard: false,
        canCallPlayDrawCard: true,
        cardBeforeDrawCard: {
          color: Color.BLACK,
          special: Special.WILD_SHUFFLE,
        },
        restrictInterrupt: true,
      });
      await CommonService.setCardOfPlayer(Consts.DEALER_2, Consts.PLAYER_2, [
        {
          color: Color.YELLOW,
          number: 1,
        },
        {
          color: Color.BLUE,
          special: Special.SKIP,
        },
        {
          color: Color.BLUE,
          special: Special.REVERSE,
        },
      ]);
      await CommonService.setCardOfPlayer(Consts.DEALER_2, Consts.PLAYER_3, [
        {
          color: Color.RED,
          number: 9,
        },
      ]);
      await CommonService.setCardOfPlayer(Consts.DEALER_2, Consts.PLAYER_4, [
        {
          color: Color.YELLOW,
          number: 1,
        },
        {
          color: Color.GREEN,
          special: Special.DRAW_2,
        },
        {
          color: Color.GREEN,
          number: 2,
        },
        {
          color: Color.GREEN,
          number: 5,
        },
      ]);
      await BlueBird.delay(2 * Consts.TIME_DELAY);
      await new Promise<void>((resolve) => {
        client1.emit(Consts.SOCKET.EVENT.PLAY_DRAW_CARD, { is_play_card: true }, () => {
          resolve();
        });
      });
      await BlueBird.delay(3 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_1);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.WILD_SHUFFLE);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.BLACK);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(2);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_2].length).to.equal(3);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_3].length).to.equal(3);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_4].length).to.equal(2);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.mustCallDrawCard).to.equal(false);
      chai.expect(desk.canCallPlayDrawCard).to.equal(false);
      await Promise.resolve();
    });

    it(`s02-J-TC014: Player 1 can not call play-draw-card (Player 1 not call draw-card) - failed Reason: Can not play draw card`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.BLUE,
          number: 6,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.YELLOW,
            number: 9,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: false,
        canCallPlayDrawCard: false,
        restrictInterrupt: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(Consts.SOCKET.EVENT.PLAY_DRAW_CARD, { is_play_card: true }, () => {
          resolve();
        });
      });
      await BlueBird.delay(5 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.number).to.equal(6);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.BLUE);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(4); // cardOfPlayer(2) + penalty(2)
      chai.expect(desk.cardAddOn).to.equal(0);
      await Promise.resolve();
    });

    it(`s02-J-TC015: Player 1 can not call play-draw-card (next player is Player 4) Reason: Next player invalid`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_3,
        nextPlayer: Consts.PLAYER_4,
        beforeCardPlay: {
          color: Color.BLUE,
          number: 6,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.YELLOW,
            number: 9,
          },
          {
            color: Color.BLUE,
            number: 9,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: false,
        canCallPlayDrawCard: true,
        cardBeforeDrawCard: {
          color: Color.BLUE,
          number: 9,
        },
        restrictInterrupt: true,
      });
      await CommonService.setCardOfPlayer(Consts.DEALER_2, Consts.PLAYER_1, [
        {
          color: Color.GREEN,
          number: 1,
        },
      ]);
      await new Promise<void>((resolve) => {
        client1.emit(Consts.SOCKET.EVENT.PLAY_DRAW_CARD, { is_play_card: true }, () => {
          resolve();
        });
      });
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_4);
      chai.expect(desk.beforeCardPlay.number).to.equal(6);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.BLUE);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(1); // cardOfPlayer(1) + penalty(0)
      chai.expect(desk.cardAddOn).to.equal(0);
      await Promise.resolve();
    });

    it(`s02-J-TC016: Player 1 draw card White_wild[bind_2] and can play (before card Red 6) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          special: Special.DRAW_2,
          // number: 6,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.BLACK,
            special: Special.WHITE_WILD,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: false,
        canCallPlayDrawCard: true,
        cardBeforeDrawCard: {
          color: Color.BLACK,
          special: Special.WHITE_WILD,
        },
        whiteWild: WhiteWild.BIND_2,
        activationWhiteWild: {},
        restrictInterrupt: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.PLAY_DRAW_CARD,
          {
            is_play_card: true,
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(3 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.WHITE_WILD);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.mustCallDrawCard).to.equal(true);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(1);
      if (desk.activationWhiteWild) {
        chai.expect(desk.activationWhiteWild[Consts.PLAYER_2]).to.equal(2);
      }
      await Promise.resolve();
    });

    it(`s02-J-TC017: Player 1 draw card White_wild[bind_2] and can play (before card Red Skip) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_3,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          special: Special.SKIP,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.BLACK,
            special: Special.WHITE_WILD,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: false,
        canCallPlayDrawCard: true,
        cardBeforeDrawCard: {
          color: Color.BLACK,
          special: Special.WHITE_WILD,
        },
        whiteWild: WhiteWild.BIND_2,
        activationWhiteWild: {},
        restrictInterrupt: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.PLAY_DRAW_CARD,
          {
            is_play_card: true,
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(3 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.WHITE_WILD);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.mustCallDrawCard).to.equal(true);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(1);
      if (desk.activationWhiteWild) {
        chai.expect(desk.activationWhiteWild[Consts.PLAYER_2]).to.equal(2);
      }
      await Promise.resolve();
    });

    it(`s02-J-TC018: Player 1 draw card White_wild[bind_2] and can play (before card Red Reverse) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_2,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          special: Special.REVERSE,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.BLACK,
            special: Special.WHITE_WILD,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: false,
        mustCallDrawCard: false,
        canCallPlayDrawCard: true,
        cardBeforeDrawCard: {
          color: Color.BLACK,
          special: Special.WHITE_WILD,
        },
        whiteWild: WhiteWild.BIND_2,
        activationWhiteWild: {},
        restrictInterrupt: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.PLAY_DRAW_CARD,
          {
            is_play_card: true,
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(3 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_4);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.WHITE_WILD);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.mustCallDrawCard).to.equal(true);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(1);
      if (desk.activationWhiteWild) {
        chai.expect(desk.activationWhiteWild[Consts.PLAYER_4]).to.equal(2);
      }
      await Promise.resolve();
    });

    it(`s02-J-TC019: Player 1 draw card White_wild[bind_2] and can play (before card Red Draw_2) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          special: Special.DRAW_2,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.BLACK,
            special: Special.WHITE_WILD,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: false,
        canCallPlayDrawCard: true,
        cardBeforeDrawCard: {
          color: Color.BLACK,
          special: Special.WHITE_WILD,
        },
        whiteWild: WhiteWild.BIND_2,
        activationWhiteWild: {},
        restrictInterrupt: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.PLAY_DRAW_CARD,
          {
            is_play_card: true,
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(3 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.WHITE_WILD);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.mustCallDrawCard).to.equal(true);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(1);
      if (desk.activationWhiteWild) {
        chai.expect(desk.activationWhiteWild[Consts.PLAYER_2]).to.equal(2);
      }
      await Promise.resolve();
    });

    it(`s02-J-TC020: Player 1 draw card White_wild[bind_2] and can play (before card Red Wild) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          special: Special.WILD,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.BLACK,
            special: Special.WHITE_WILD,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: false,
        canCallPlayDrawCard: true,
        cardBeforeDrawCard: {
          color: Color.BLACK,
          special: Special.WHITE_WILD,
        },
        whiteWild: WhiteWild.BIND_2,
        activationWhiteWild: {},
        restrictInterrupt: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.PLAY_DRAW_CARD,
          {
            is_play_card: true,
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(3 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.WHITE_WILD);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.mustCallDrawCard).to.equal(true);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(1);
      if (desk.activationWhiteWild) {
        chai.expect(desk.activationWhiteWild[Consts.PLAYER_2]).to.equal(2);
      }
      await Promise.resolve();
    });

    it(`s02-J-TC021: Player 1 draw card White_wild[bind_2] and can play (before card Red Wild_shuffle) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          special: Special.WILD_SHUFFLE,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.BLACK,
            special: Special.WHITE_WILD,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: false,
        canCallPlayDrawCard: true,
        cardBeforeDrawCard: {
          color: Color.BLACK,
          special: Special.WHITE_WILD,
        },
        whiteWild: WhiteWild.BIND_2,
        activationWhiteWild: {},
        restrictInterrupt: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.PLAY_DRAW_CARD,
          {
            is_play_card: true,
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(3 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.WHITE_WILD);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.mustCallDrawCard).to.equal(true);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(1);
      if (desk.activationWhiteWild) {
        chai.expect(desk.activationWhiteWild[Consts.PLAYER_2]).to.equal(2);
      }
      await Promise.resolve();
    });

    it(`s02-J-TC022: Player 1 draw card White_wild[bind_2] and can play (before card Red Wild_draw_4) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          special: Special.WILD_DRAW_4,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.BLACK,
            special: Special.WHITE_WILD,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: false,
        canCallPlayDrawCard: true,
        cardBeforeDrawCard: {
          color: Color.BLACK,
          special: Special.WHITE_WILD,
        },
        whiteWild: WhiteWild.BIND_2,
        activationWhiteWild: {},
        restrictInterrupt: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.PLAY_DRAW_CARD,
          {
            is_play_card: true,
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(3 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.WHITE_WILD);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.mustCallDrawCard).to.equal(true);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(1);
      if (desk.activationWhiteWild) {
        chai.expect(desk.activationWhiteWild[Consts.PLAYER_2]).to.equal(2);
      }
      await Promise.resolve();
    });

    it(`s02-J-TC023: Player 1 play draw card White_wild[bind_2] (before card Red 6 White_wild 2nd times) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          number: 6,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.BLACK,
            special: Special.WHITE_WILD,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: false,
        canCallPlayDrawCard: true,
        cardBeforeDrawCard: {
          color: Color.BLACK,
          special: Special.WHITE_WILD,
        },
        whiteWild: WhiteWild.BIND_2,
        activationWhiteWild: {
          [Consts.PLAYER_2]: 1,
        },
        restrictInterrupt: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.PLAY_DRAW_CARD,
          {
            is_play_card: true,
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(3 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.WHITE_WILD);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.mustCallDrawCard).to.equal(true);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(1);
      if (desk.activationWhiteWild) {
        chai.expect(desk.activationWhiteWild[Consts.PLAYER_2]).to.equal(3);
      }
      await Promise.resolve();
    });

    it(`s02-J-TC024: Player 1 not play card Red 9 and can play (before card Red 0) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          number: 0,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.RED,
            number: 9,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: false,
        canCallPlayDrawCard: true,
        cardBeforeDrawCard: {
          color: Color.RED,
          number: 9,
        },
        restrictInterrupt: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.PLAY_DRAW_CARD,
          {
            is_play_card: false,
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(3 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.number).to.equal(0);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(2);
      await Promise.resolve();
    });
  });

  /* /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */

  /** Test Event Consts.SOCKET.EVENT.CHALLENGE */
  describe(`Test Event ${Consts.SOCKET.EVENT.CHALLENGE}`, () => {
    beforeEach(async () => {
      await CommonService.setCardOfDesk(Consts.DEALER_2);
    });

    it(`s02-F-TC001: Player 1 challenge Player 4 lose (before card Red Wild_draw_4, Player 3 play card Red 6, Player 4 have card Blue 6) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          special: Special.WILD_DRAW_4,
          // number: 6
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
        ],
        cardAddOn: 4,
        yellUno: false,
        cardBeforeWildDraw4: {
          color: Color.RED,
          // special: Special.WILD_DRAW_4,
          number: 6,
        },
        turnRight: true,
        mustCallDrawCard: true,
      });
      await CommonService.setCardOfPlayer(Consts.DEALER_2, Consts.PLAYER_4, [
        {
          color: Color.BLUE,
          // special: Special.SKIP
          number: 6,
        },
      ]);
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.CHALLENGE,
          {
            is_challenge: true,
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(3 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_1);
      chai.expect(desk.beforeCardPlay.number).to.equal(6);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_4].length).to.equal(6);
      await Promise.resolve();
    });

    it(`s02-F-TC002: Player 1 challenge Player 4 lose (before card Red Wild_draw_4, Player 3 play card Red Reverse, Player 4 have card Red 6) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          special: Special.WILD_DRAW_4,
          // number: 6
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
        ],
        cardAddOn: 4,
        yellUno: false,
        cardBeforeWildDraw4: {
          color: Color.RED,
          special: Special.REVERSE,
          // number: 6
        },
        turnRight: false,
        mustCallDrawCard: true,
      });
      await CommonService.setCardOfPlayer(Consts.DEALER_2, Consts.PLAYER_4, [
        {
          color: Color.RED,
          // special: Special.SKIP
          number: 6,
        },
      ]);
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.CHALLENGE,
          {
            is_challenge: true,
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(3 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_1);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.REVERSE);
      // chai.expect(desk.beforeCardPlay.number).to.equal(6);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_4].length).to.equal(6);
      await Promise.resolve();
    });

    it(`s02-F-TC003: Player 1 challenge Player 4 lose (before card Red Wild_draw_4, Player 2 play card Red Skip, Player 4 have card Blue Skip) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          special: Special.WILD_DRAW_4,
          // number: 6
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
        ],
        cardAddOn: 4,
        yellUno: false,
        cardBeforeWildDraw4: {
          color: Color.RED,
          special: Special.SKIP,
          // number: 6
        },
        turnRight: true,
        mustCallDrawCard: true,
      });
      await CommonService.setCardOfPlayer(Consts.DEALER_2, Consts.PLAYER_4, [
        {
          color: Color.BLUE,
          special: Special.SKIP,
          // number: 6
        },
      ]);
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.CHALLENGE,
          {
            is_challenge: true,
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(3 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_1);
      // chai.expect(desk.beforeCardPlay.number).to.equal(6);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.SKIP);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_4].length).to.equal(6);
      await Promise.resolve();
    });

    it(`s02-F-TC004: Player 1 challenge Player 4 lose (before card Red Wild_draw_4, Player 3 play card Red Draw_2, Player 4 have card Red Reverse) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          special: Special.WILD_DRAW_4,
          // number: 6
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
        ],
        cardAddOn: 4,
        yellUno: false,
        cardBeforeWildDraw4: {
          color: Color.RED,
          special: Special.DRAW_2,
          // number: 6
        },
        turnRight: true,
        mustCallDrawCard: true,
      });
      await CommonService.setCardOfPlayer(Consts.DEALER_2, Consts.PLAYER_4, [
        {
          color: Color.RED,
          special: Special.REVERSE,
          // number: 6
        },
      ]);
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.CHALLENGE,
          {
            is_challenge: true,
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(3 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_1);
      // chai.expect(desk.beforeCardPlay.number).to.equal(6);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.DRAW_2);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_4].length).to.equal(6);
      await Promise.resolve();
    });

    it(`s02-F-TC005: Player 1 challenge Player 4 lose (before card Red Wild_draw_4, Player 3 play card Red Wild, Player 4 have card Wild) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          special: Special.WILD_DRAW_4,
          // number: 6
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
        ],
        cardAddOn: 4,
        yellUno: false,
        cardBeforeWildDraw4: {
          color: Color.RED,
          special: Special.WILD,
          // number: 6
        },
        turnRight: true,
        mustCallDrawCard: true,
      });
      await CommonService.setCardOfPlayer(Consts.DEALER_2, Consts.PLAYER_4, [
        {
          color: Color.BLACK,
          special: Special.WILD,
          // number: 6
        },
      ]);
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.CHALLENGE,
          {
            is_challenge: true,
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(3 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_1);
      // chai.expect(desk.beforeCardPlay.number).to.equal(6);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.WILD);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_4].length).to.equal(6);
      await Promise.resolve();
    });

    it(`s02-F-TC006: Player 1 challenge Player 4 lose (before card Red Wild_draw_4, Player 3 play card Red Wild_shuffle, Player 4 have card Red 6) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          special: Special.WILD_DRAW_4,
          // number: 6
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
        ],
        cardAddOn: 4,
        yellUno: false,
        cardBeforeWildDraw4: {
          color: Color.RED,
          special: Special.WILD_SHUFFLE,
          // number: 6
        },
        turnRight: true,
        mustCallDrawCard: true,
      });
      await CommonService.setCardOfPlayer(Consts.DEALER_2, Consts.PLAYER_4, [
        {
          color: Color.RED,
          // special: Special.WILD
          number: 6,
        },
      ]);
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.CHALLENGE,
          {
            is_challenge: true,
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(3 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_1);
      // chai.expect(desk.beforeCardPlay.number).to.equal(6);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.WILD_SHUFFLE);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_4].length).to.equal(6);
      await Promise.resolve();
    });

    it(`s02-F-TC007: Player 1 challenge Player 4 win (before card Red Wild_draw_4, Player 3 play card Red 6) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          special: Special.WILD_DRAW_4,
          // number: 6
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
        ],
        cardAddOn: 4,
        yellUno: false,
        cardBeforeWildDraw4: {
          color: Color.RED,
          // special: Special.WILD_SHUFFLE,
          number: 6,
        },
        turnRight: true,
        mustCallDrawCard: true,
      });
      await CommonService.setCardOfPlayer(Consts.DEALER_2, Consts.PLAYER_4, [
        {
          color: Color.BLUE,
          // special: Special.WILD
          number: 5,
        },
      ]);
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.CHALLENGE,
          {
            is_challenge: true,
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(3 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      // chai.expect(desk.beforeCardPlay.number).to.equal(6);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.WILD_DRAW_4);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(7);
      await Promise.resolve();
    });

    it(`s02-F-TC008: Player 1 challenge Player 4 win (before card Red Wild_draw_4, Player 3 play card Red Wild) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          special: Special.WILD_DRAW_4,
          // number: 6
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
        ],
        cardAddOn: 4,
        yellUno: false,
        cardBeforeWildDraw4: {
          color: Color.RED,
          special: Special.WILD,
          // number: 6
        },
        turnRight: true,
        mustCallDrawCard: true,
      });
      await CommonService.setCardOfPlayer(Consts.DEALER_2, Consts.PLAYER_4, [
        {
          color: Color.BLUE,
          // special: Special.WILD
          number: 5,
        },
      ]);
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.CHALLENGE,
          {
            is_challenge: true,
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(3 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      // chai.expect(desk.beforeCardPlay.number).to.equal(6);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.WILD_DRAW_4);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(7);
      await Promise.resolve();
    });

    it(`s02-F-TC009: Player 1 challenge Player 4 lose (before card Red Wild_draw_4, Player 3 play card Red Wild_shuffle) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          special: Special.WILD_DRAW_4,
          // number: 6
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
        ],
        cardAddOn: 4,
        yellUno: false,
        cardBeforeWildDraw4: {
          color: Color.RED,
          special: Special.WILD_SHUFFLE,
          // number: 6
        },
        turnRight: true,
        mustCallDrawCard: true,
      });
      await CommonService.setCardOfPlayer(Consts.DEALER_2, Consts.PLAYER_4, [
        {
          color: Color.BLUE,
          // special: Special.WILD
          number: 5,
        },
      ]);
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.CHALLENGE,
          {
            is_challenge: true,
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(3 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      // chai.expect(desk.beforeCardPlay.number).to.equal(6);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.WILD_DRAW_4);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(7);
      await Promise.resolve();
    });

    it(`s02-F-TC010: Player 1 don't challenge Player 4 (before card Red Wild_draw_4) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          special: Special.WILD_DRAW_4,
          // number: 6
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
        ],
        cardAddOn: 4,
        yellUno: false,
        cardBeforeWildDraw4: {
          color: Color.RED,
          // special: Special.WILD_SHUFFLE,
          number: 6,
        },
        turnRight: true,
        mustCallDrawCard: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.CHALLENGE,
          {
            is_challenge: false,
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(5 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_1);
      // chai.expect(desk.beforeCardPlay.number).to.equal(6);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.WILD_DRAW_4);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(4);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(1);
      await Promise.resolve();
    });

    it(`s02-F-TC011: Player 1 challenge Player 4 (before card Red 6) - failed - Reason: Can not challenge`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          // special: Special.WILD_DRAW_4,
          number: 6,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.CHALLENGE,
          {
            is_challenge: true,
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(5 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.number).to.equal(6);
      // chai.expect(desk.beforeCardPlay.special).to.equal(Special.WILD_DRAW_4);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(3); // cardOfPlayer(1) + penalty(2)
      await Promise.resolve();
    });

    it(`s02-F-TC012: Player 1 challenge Player 4 (before card Red Skip) - failed - Reason: Can not challenge`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_3,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          special: Special.SKIP,
          // number: 6
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.CHALLENGE,
          {
            is_challenge: true,
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(5 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      // chai.expect(desk.beforeCardPlay.number).to.equal(6);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.SKIP);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(3); // cardOfPlayer(1) + penalty(2)
      await Promise.resolve();
    });

    it(`s02-F-TC013: Player 1 challenge Player 4 (before card Red Reverse) - failed - Reason: Can not challenge`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_2,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          special: Special.REVERSE,
          // number: 6
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.CHALLENGE,
          {
            is_challenge: true,
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(5 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      // chai.expect(desk.beforeCardPlay.number).to.equal(6);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.REVERSE);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(3); // cardOfPlayer(1) + penalty(2)
      await Promise.resolve();
    });

    it(`s02-F-TC014: Player 1 challenge Player 4 (before card Red Draw_2) - failed - Reason: Can not challenge`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_2,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          special: Special.DRAW_2,
          // number: 6
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
        ],
        cardAddOn: 2,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.CHALLENGE,
          {
            is_challenge: true,
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(5 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      // chai.expect(desk.beforeCardPlay.number).to.equal(6);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.DRAW_2);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(5); // cardOfPlayer(1) + penalty(2) + DRAW_2(2)
      await Promise.resolve();
    });

    it(`s02-F-TC015: Player 1 challenge Player 4 (before card Red Wild) - failed - Reason: Can not challenge`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_2,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          special: Special.WILD,
          // number: 6
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
        ],
        cardAddOn: 4,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.CHALLENGE,
          {
            is_challenge: true,
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(5 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      // chai.expect(desk.beforeCardPlay.number).to.equal(6);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.WILD);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(7); // cardOfPlayer(1) + penalty(2) + WILD(4)
      await Promise.resolve();
    });

    it(`s02-F-TC016: Player 1 challenge Player 4 (before card Red Wild_shuffle) - failed - Reason: Can not challenge`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_2,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          special: Special.WILD_SHUFFLE,
          // number: 6
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.CHALLENGE,
          {
            is_challenge: true,
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(5 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      // chai.expect(desk.beforeCardPlay.number).to.equal(6);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.WILD_SHUFFLE);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(3); // cardOfPlayer(1) + penalty(2)
      await Promise.resolve();
    });

    it(`s02-F-TC017: Player 1 can not challenge Player 3 (Next player is Player 4) - Reason: Next player invalid`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_3,
        nextPlayer: Consts.PLAYER_4,
        beforeCardPlay: {
          color: Color.RED,
          special: Special.WILD_DRAW_4,
          // number: 6
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
        ],
        cardAddOn: 4,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: true,
      });
      await CommonService.setCardOfPlayer(Consts.DEALER_2, Consts.PLAYER_1, [
        {
          color: Color.GREEN,
          number: 1,
        },
      ]);
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.CHALLENGE,
          {
            is_challenge: true,
          },
          () => {
            resolve();
          },
        );
      });
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_4);
      // chai.expect(desk.beforeCardPlay.number).to.equal(6);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.WILD_DRAW_4);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(4);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(3); // cardOfPlayer(1) + penalty(2)
      await Promise.resolve();
    });

    it(`s02-F-TC018: Player 1 challenge Player 4 (before card Red Wild_draw_4 Player 1 White_wild 2nd lap) - failed Reason: Can not challenge`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          special: Special.WILD_DRAW_4,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
        ],
        cardAddOn: 4,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: true,
        whiteWild: WhiteWild.BIND_2,
        activationWhiteWild: {
          [Consts.PLAYER_1]: 1,
        },
      });
      await CommonService.setCardOfPlayer(Consts.DEALER_2, Consts.PLAYER_1, [
        {
          color: Color.GREEN,
          number: 1,
        },
      ]);
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.CHALLENGE,
          {
            is_challenge: true,
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(5 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      // chai.expect(desk.beforeCardPlay.number).to.equal(6);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.WILD_DRAW_4);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(7); // cardOfPlayer(1) + penalty(2) + WILD_DRAW_4(4)
      await Promise.resolve();
    });

    it(`s02-F-TC019: Player 1 can not challenge Player 3 (Next player is Player 4) - Reason: Interrupts are restricted`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_3,
        nextPlayer: Consts.PLAYER_4,
        beforeCardPlay: {
          color: Color.RED,
          special: Special.WILD_DRAW_4,
          // number: 6
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
        ],
        cardAddOn: 4,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: true,
        restrictInterrupt: true,
      });
      await CommonService.setCardOfPlayer(Consts.DEALER_2, Consts.PLAYER_1, [
        {
          color: Color.GREEN,
          number: 1,
        },
      ]);
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.CHALLENGE,
          {
            is_challenge: true,
          },
          () => {
            resolve();
          },
        );
      });
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_4);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.WILD_DRAW_4);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(4);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(1); // cardOfPlayer(1) + penalty(0)
      await Promise.resolve();
    });
  });

  /* /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */

  describe(`Test Event ${Consts.SOCKET.EVENT.POINTED_NOT_SAY_UNO}`, () => {
    it(`s02-G-TC001: Player 1 pointed Player 4 not say UNO (Player 4 has been say UNO) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_3,
        nextPlayer: Consts.PLAYER_4,
        beforeCardPlay: {
          color: Color.RED,
          // special: Special.WILD_DRAW_4,
          number: 6,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
        ],
        cardAddOn: 0,
        yellUno: true,
        turnRight: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.POINTED_NOT_SAY_UNO,
          {
            target: Consts.PLAYER_4,
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(5 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.beforeCardPlay.number).to.equal(6);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_4].length).to.equal(1);
      await Promise.resolve();
    });

    it(`s02-G-TC002: Player 1 pointed Player 4 not say UNO (Player 4 not say UNO) - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: Consts.TOTAL_TURN,
        beforePlayer: Consts.PLAYER_3,
        nextPlayer: Consts.PLAYER_4,
        beforeCardPlay: {
          color: Color.RED,
          // special: Special.WILD_DRAW_4,
          number: 6,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.POINTED_NOT_SAY_UNO,
          {
            target: Consts.PLAYER_4,
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(2 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.beforeCardPlay.number).to.equal(6);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_4].length).to.equal(3);
      await Promise.resolve();
    });

    it(`s02-G-TC003: Player 1 pointed Player 4 not say UNO (Player 4 remain 3 cards on the hand) - failed - Reason: Can not pointed not say uno`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: Consts.TOTAL_TURN,
        beforePlayer: Consts.PLAYER_3,
        nextPlayer: Consts.PLAYER_4,
        beforeCardPlay: {
          color: Color.RED,
          // special: Special.WILD_DRAW_4,
          number: 6,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.BLUE,
            special: Special.REVERSE,
          },
          {
            color: Color.BLUE,
            number: 6,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
      });
      await CommonService.setCardOfPlayer(Consts.DEALER_2, Consts.PLAYER_1, [
        {
          color: Color.YELLOW,
          number: 9,
        },
        {
          color: Color.BLACK,
          special: Special.WILD_DRAW_4,
        },
      ]);
      await BlueBird.delay(5 * Consts.TIME_DELAY);
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.POINTED_NOT_SAY_UNO,
          {
            target: Consts.PLAYER_4,
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(5 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_4);
      chai.expect(desk.beforeCardPlay.number).to.equal(6);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_4].length).to.equal(3);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(4); // + penalty(2)
      await Promise.resolve();
    });
  });

  /* /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */

  describe(`Test Event ${Consts.SOCKET.EVENT.SPECIAL_LOGIC}`, () => {
    it(`s02-K-TC001: Player 1 Sepcial logic 1st times - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_3,
        nextPlayer: Consts.PLAYER_4,
        beforeCardPlay: {
          color: Color.RED,
          number: 6,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.SPECIAL_LOGIC,
          {
            title: 'xxxxxxxxxxxxxxxx',
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(5 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      if (desk.specialLogic) {
        chai.expect(desk.specialLogic[Consts.PLAYER_1]).to.equal(1);
      }
      await Promise.resolve();
    });

    it(`s02-K-TC002: Player 1 Sepcial logic 10th times - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_3,
        nextPlayer: Consts.PLAYER_4,
        beforeCardPlay: {
          color: Color.RED,
          number: 6,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        specialLogic: {
          [Consts.PLAYER_1]: 9,
        },
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.SPECIAL_LOGIC,
          {
            title: 'xxxxxxxxxxxxxxxx',
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(5 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      if (desk.specialLogic) {
        chai.expect(desk.specialLogic[Consts.PLAYER_1]).to.equal(10);
      }
      await Promise.resolve();
    });

    it(`s02-K-TC003: Player 1 Sepcial logic 11th times - successfully`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_3,
        nextPlayer: Consts.PLAYER_4,
        beforeCardPlay: {
          color: Color.RED,
          number: 6,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        specialLogic: {
          [Consts.PLAYER_1]: 10,
        },
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.SPECIAL_LOGIC,
          {
            title: 'xxxxxxxxxxxxxxxx',
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(5 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      if (desk.specialLogic) {
        chai.expect(desk.specialLogic[Consts.PLAYER_1]).to.equal(10);
      }
      await Promise.resolve();
    });

    it(`s02-K-TC004: Player 1 Sepcial logic 10th times - failed Reason: Param special logic invalid`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_3,
        nextPlayer: Consts.PLAYER_4,
        beforeCardPlay: {
          color: Color.RED,
          number: 6,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        specialLogic: {
          [Consts.PLAYER_1]: 9,
        },
      });
      await CommonService.setCardOfPlayer(Consts.DEALER_2, Consts.PLAYER_1, [
        {
          color: Color.YELLOW,
          number: 9,
        },
        {
          color: Color.BLACK,
          special: Special.WILD_DRAW_4,
        },
      ]);
      await BlueBird.delay(5 * Consts.TIME_DELAY);
      await new Promise<void>((resolve) => {
        client1.emit(Consts.SOCKET.EVENT.SPECIAL_LOGIC, {}, () => {
          resolve();
        });
      });
      await BlueBird.delay(5 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      if (desk.specialLogic) {
        chai.expect(desk.specialLogic[Consts.PLAYER_1]).to.equal(9);
      }
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_4);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.beforeCardPlay.number).to.equal(6);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(4); // + penalty(2)
      await Promise.resolve();
    });

    it(`s02-K-TC005: Player 1 Sepcial logic 1st times - failed Reason: Special logic name too long.`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_3,
        nextPlayer: Consts.PLAYER_4,
        beforeCardPlay: {
          color: Color.RED,
          number: 6,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        specialLogic: {
          [Consts.PLAYER_1]: 9,
        },
      });
      await CommonService.setCardOfPlayer(Consts.DEALER_2, Consts.PLAYER_1, [
        {
          color: Color.YELLOW,
          number: 9,
        },
        {
          color: Color.BLACK,
          special: Special.WILD_DRAW_4,
        },
      ]);
      await BlueBird.delay(5 * Consts.TIME_DELAY);
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.SPECIAL_LOGIC,
          {
            title: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(5 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      if (desk.specialLogic) {
        chai.expect(desk.specialLogic[Consts.PLAYER_1]).to.equal(9);
      }
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_4);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.beforeCardPlay.number).to.equal(6);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(4); // + penalty(2)
      await Promise.resolve();
    });
  });

  /* /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */

  describe(`Logic calculator score of Player`, () => {
    it(`s02-L-TC001: Player 1 accepts the penalty. (Player 1 has 23 cards)`, async () => {
      const cardOfPlayer = [...Consts.CARD_SET_25].slice(0, 23);

      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          number: 6,
        },
        cardOfPlayer,
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.PLAY_CARD,
          {
            card_play: {
              color: Color.BLUE,
              number: 9,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(2 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.number).to.equal(6);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(25);
      await Promise.resolve();
    });

    it(`s02-L-TC002: Player 1 accepts the penalty. (Player 1 has 24 cards)`, async () => {
      const cardOfPlayer = [...Consts.CARD_SET_25].slice(0, 24);

      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          number: 6,
        },
        cardOfPlayer,
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.PLAY_CARD,
          {
            card_play: {
              color: Color.BLUE,
              number: 9,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(2 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.number).to.equal(6);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(25);
      await Promise.resolve();
    });

    it(`s02-L-TC003: Player 1 accepts the penalty. (Player 1 has 25 cards)`, async () => {
      const cardOfPlayer = [...Consts.CARD_SET_25];

      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          number: 6,
        },
        cardOfPlayer,
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
      });
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.PLAY_CARD,
          {
            card_play: {
              color: Color.BLUE,
              number: 9,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(2 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.number).to.equal(6);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(25);
      await Promise.resolve();
    });
  });

  /* /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */

  describe(`Dealer Emit FIRST_PLAYER`, () => {
    it(`s02-M-TC001: Top card on desk is Red 6`, async () => {
      const cardOfPlayer = [...Consts.CARD_SET_25].slice(0, 7);
      const mapPlayerToSocket = new Map<string, string>();
      mapPlayerToSocket.set(Consts.PLAYER_1, client1.id);
      mapPlayerToSocket.set(Consts.PLAYER_2, client2.id);
      mapPlayerToSocket.set(Consts.PLAYER_3, client3.id);
      mapPlayerToSocket.set(Consts.PLAYER_4, client4.id);
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          number: 6,
        },
        cardOfPlayer,
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
      });
      await BlueBird.delay(2 * Consts.TIME_DELAY);
      const beforeDesk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      await CommonService.firstPlayerAction(
        beforeDesk,
        {
          color: Color.RED,
          number: 6,
        },
        Consts.PLAYER_1,
        mapPlayerToSocket,
      );
      await BlueBird.delay(2 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_1);
      chai.expect(desk.beforeCardPlay.number).to.equal(6);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(7);
      await Promise.resolve();
    });

    it(`s02-M-TC002: Top card on desk is Red Skip`, async () => {
      const cardOfPlayer = [...Consts.CARD_SET_25].slice(0, 7);
      const mapPlayerToSocket = new Map<string, string>();
      mapPlayerToSocket.set(Consts.PLAYER_1, client1.id);
      mapPlayerToSocket.set(Consts.PLAYER_2, client2.id);
      mapPlayerToSocket.set(Consts.PLAYER_3, client3.id);
      mapPlayerToSocket.set(Consts.PLAYER_4, client4.id);
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_1,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          special: Special.SKIP,
        },
        cardOfPlayer,
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        isSkip: true,
      });
      await BlueBird.delay(2 * Consts.TIME_DELAY);
      const beforeDesk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      await CommonService.firstPlayerAction(
        beforeDesk,
        {
          color: Color.RED,
          special: Special.SKIP,
        },
        Consts.PLAYER_1,
        mapPlayerToSocket,
      );
      await BlueBird.delay(2 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.SKIP);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(7);
      await Promise.resolve();
    });

    it(`s02-M-TC003: Top card on desk is Red Reverse`, async () => {
      const cardOfPlayer = [...Consts.CARD_SET_25].slice(0, 7);
      const mapPlayerToSocket = new Map<string, string>();
      mapPlayerToSocket.set(Consts.PLAYER_1, client1.id);
      mapPlayerToSocket.set(Consts.PLAYER_2, client2.id);
      mapPlayerToSocket.set(Consts.PLAYER_3, client3.id);
      mapPlayerToSocket.set(Consts.PLAYER_4, client4.id);
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_1,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          special: Special.REVERSE,
        },
        cardOfPlayer,
        cardAddOn: 0,
        yellUno: false,
        turnRight: false,
      });
      await BlueBird.delay(2 * Consts.TIME_DELAY);
      const beforeDesk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      await CommonService.firstPlayerAction(
        beforeDesk,
        {
          color: Color.RED,
          special: Special.REVERSE,
        },
        Consts.PLAYER_1,
        mapPlayerToSocket,
      );
      await BlueBird.delay(2 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_4);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.REVERSE);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(7);
      await Promise.resolve();
    });

    it(`s02-M-TC004: Top card on desk is Red Draw_2`, async () => {
      const cardOfPlayer = [...Consts.CARD_SET_25].slice(0, 7);
      const mapPlayerToSocket = new Map<string, string>();
      mapPlayerToSocket.set(Consts.PLAYER_1, client1.id);
      mapPlayerToSocket.set(Consts.PLAYER_2, client2.id);
      mapPlayerToSocket.set(Consts.PLAYER_3, client3.id);
      mapPlayerToSocket.set(Consts.PLAYER_4, client4.id);
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_1,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          special: Special.DRAW_2,
        },
        cardOfPlayer,
        cardAddOn: 2,
        yellUno: false,
        turnRight: true,
        mustCallDrawCard: true,
      });
      await BlueBird.delay(2 * Consts.TIME_DELAY);
      const beforeDesk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      await CommonService.firstPlayerAction(
        beforeDesk,
        {
          color: Color.RED,
          special: Special.REVERSE,
        },
        Consts.PLAYER_1,
        mapPlayerToSocket,
      );
      await BlueBird.delay(2 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_1);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.DRAW_2);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(2);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(7);
      await Promise.resolve();
    });

    it(`s02-M-TC005: Top card on desk is Red Wild`, async () => {
      const cardOfPlayer = [...Consts.CARD_SET_25].slice(0, 7);
      const mapPlayerToSocket = new Map<string, string>();
      mapPlayerToSocket.set(Consts.PLAYER_1, client1.id);
      mapPlayerToSocket.set(Consts.PLAYER_2, client2.id);
      mapPlayerToSocket.set(Consts.PLAYER_3, client3.id);
      mapPlayerToSocket.set(Consts.PLAYER_4, client4.id);
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_1,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.BLACK,
          special: Special.WILD,
        },
        cardOfPlayer,
        cardAddOn: 0,
        yellUno: false,
        turnRight: false,
      });
      await BlueBird.delay(2 * Consts.TIME_DELAY);
      const beforeDesk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      await CommonService.firstPlayerAction(
        beforeDesk,
        {
          color: Color.BLACK,
          special: Special.WILD,
        },
        Consts.PLAYER_1,
        mapPlayerToSocket,
      );
      await BlueBird.delay(2 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_1);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.WILD);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.BLACK);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(7);
      await Promise.resolve();
    });

    it(`s02-M-TC006: Top card on desk is Red Wild_draw_4`, async () => {
      const cards = await CommonService.desk();
      cards.unshift({
        color: Color.BLACK,
        special: Special.WILD_DRAW_4,
      });
      const { firstCard, newCards } = await CommonService.getFirstCard([...cards]);
      chai.expect(newCards.length).to.equal(cards.length - 1);
      if (firstCard && firstCard.special) {
        chai.expect(firstCard.special).to.not.equal(Special.WILD_DRAW_4);
      }
      await Promise.resolve();
    });

    it(`s02-M-TC007: Top card on desk Wild_shufule`, async () => {
      const cards = await CommonService.desk();
      cards.unshift({
        color: Color.BLACK,
        special: Special.WILD_SHUFFLE,
      });
      const { firstCard, newCards } = await CommonService.getFirstCard([...cards]);
      chai.expect(newCards.length).to.equal(cards.length - 1);
      if (firstCard && firstCard.special) {
        chai.expect(firstCard.special).to.not.equal(Special.WILD_SHUFFLE);
      }
      await Promise.resolve();
    });

    it(`s02-M-TC008: Top card on desk White_wild`, async () => {
      const cards = await CommonService.desk();
      cards.unshift({
        color: Color.BLACK,
        special: Special.WHITE_WILD,
      });
      const { firstCard, newCards } = await CommonService.getFirstCard([...cards]);
      chai.expect(newCards.length).to.equal(cards.length - 1);
      if (firstCard && firstCard.special) {
        chai.expect(firstCard.special).to.not.equal(Special.WHITE_WILD);
      }
      await Promise.resolve();
    });
  });

  /* /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */

  describe(`Time Out`, () => {
    it(`s02-N-TC001: Timeout of color of wild event.`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.BLACK,
          special: Special.WILD,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.BLUE,
            special: Special.REVERSE,
          },
          {
            color: Color.BLUE,
            number: 6,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        colorBeforeWild: Color.RED,
        timeout: {
          [Consts.PLAYER_1]: true,
        },
      });
      await CommonService.timeoutColorOfWild(Consts.DEALER_2, Consts.PLAYER_1);
      await BlueBird.delay(2 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.WILD);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(0);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(5);
      chai.expect(desk.timeout[Consts.PLAYER_1]).to.equal(false);
      await Promise.resolve();
    });

    it(`s02-N-TC001: Timeout of color of wild event.`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: 1,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.BLACK,
          special: Special.WILD_DRAW_4,
        },
        cardOfPlayer: [
          {
            color: Color.BLUE,
            special: Special.SKIP,
          },
          {
            color: Color.BLUE,
            special: Special.REVERSE,
          },
          {
            color: Color.BLUE,
            number: 6,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        colorBeforeWild: Color.RED,
        timeout: {
          [Consts.PLAYER_1]: true,
        },
      });
      await CommonService.timeoutColorOfWild(Consts.DEALER_2, Consts.PLAYER_1);
      await BlueBird.delay(2 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.nextPlayer).to.equal(Consts.PLAYER_2);
      chai.expect(desk.beforeCardPlay.special).to.equal(Special.WILD_DRAW_4);
      chai.expect(desk.beforeCardPlay.color).to.equal(Color.RED);
      chai.expect(desk.cardAddOn).to.equal(4);
      chai.expect(desk.mustCallDrawCard).to.equal(true);
      chai.expect(desk.cardOfPlayer[Consts.PLAYER_1].length).to.equal(5);
      chai.expect(desk.timeout[Consts.PLAYER_1]).to.equal(false);
      await Promise.resolve();
    });
  });

  /* /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */

  describe(`Logic calculator score of Player`, () => {
    beforeEach(async () => {
      await CommonService.resetDb();
      const newDealer = await dealerService.create({
        name: Consts.DEALER_2,
        players: [],
        status: StatusGame.NEW,
        totalTurn: 1000,
      } as any);
      StaticValues.DEALER_ID = newDealer._id;

      await playerService.create({
        _id: Consts.PLAYER_1,
        name: Consts.PLAYER_1_NAME,
        team: Consts.TEAM_A,
      } as any);
      await playerService.create({
        _id: Consts.PLAYER_2,
        name: Consts.PLAYER_2_NAME,
        team: Consts.TEAM_B,
      } as any);
      await playerService.create({
        _id: Consts.PLAYER_3,
        name: Consts.PLAYER_3_NAME,
        team: Consts.TEAM_C,
      } as any);
      await playerService.create({
        _id: Consts.PLAYER_4,
        name: Consts.PLAYER_4_NAME,
        team: Consts.TEAM_D,
      } as any);

      client1 = IOClient.connect(`http://${Consts.SOCKET.HOST}:${Consts.SOCKET.PORT}`, {
        transports: ['websocket'],
        forceNew: true,
      });
      const dataJoinRoom = {
        room_name: Consts.DEALER_2,
        player: Consts.PLAYER_1_NAME,
        team: Consts.TEAM_A,
      };
      await new Promise<void>((resolve) => {
        client1.emit(Consts.SOCKET.EVENT.JOIN_ROOM, dataJoinRoom, function () {
          resolve();
        });
      });

      client2 = IOClient.connect(`http://${Consts.SOCKET.HOST}:${Consts.SOCKET.PORT}`, {
        transports: ['websocket'],
        forceNew: true,
      });
      const dataJoinRoom2 = {
        room_name: Consts.DEALER_2,
        player: Consts.PLAYER_2_NAME,
        team: Consts.TEAM_B,
      };
      await new Promise<void>((resolve) => {
        client2.emit(Consts.SOCKET.EVENT.JOIN_ROOM, dataJoinRoom2, function () {
          resolve();
        });
      });

      client3 = IOClient.connect(`http://${Consts.SOCKET.HOST}:${Consts.SOCKET.PORT}`, {
        transports: ['websocket'],
        forceNew: true,
      });
      const dataJoinRoom3 = {
        room_name: Consts.DEALER_2,
        player: Consts.PLAYER_3_NAME,
        team: Consts.TEAM_C,
      };
      await new Promise<void>((resolve) => {
        client3.emit(Consts.SOCKET.EVENT.JOIN_ROOM, dataJoinRoom3, function () {
          resolve();
        });
      });

      client4 = IOClient.connect(`http://${Consts.SOCKET.HOST}:${Consts.SOCKET.PORT}`, {
        transports: ['websocket'],
        forceNew: true,
      });
      const dataJoinRoom4 = {
        room_name: Consts.DEALER_2,
        player: Consts.PLAYER_4_NAME,
        team: Consts.TEAM_D,
      };
      await new Promise<void>((resolve) => {
        client4.emit(Consts.SOCKET.EVENT.JOIN_ROOM, dataJoinRoom4, function () {
          resolve();
        });
      });

      await dealerService.startDealer(StaticValues.DEALER_ID);
    });

    it(`s02-H-TC001: Calculator score of Player (Player 1 win 300 turn Score 254 , Player 2 win 150 Score -59, Player 3 win 100 Score -90, Player 4 win 50 Score -105)`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: Consts.TOTAL_TURN,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          number: 6,
        },
        cardOfPlayer: [
          {
            color: Color.RED,
            number: 9,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        score: {
          [Consts.PLAYER_1]: 0,
          [Consts.PLAYER_2]: 0,
          [Consts.PLAYER_3]: 0,
          [Consts.PLAYER_4]: 0,
        },
      });
      //Player 2 YELLOW 9, WILD_DRAW_4 50
      await CommonService.setCardOfPlayer(Consts.DEALER_2, Consts.PLAYER_2, [
        {
          color: Color.YELLOW,
          number: 9,
        },
        {
          color: Color.BLACK,
          special: Special.WILD_DRAW_4,
        },
      ]);
      //Player 3 Red 0, Wild 50, Wild-shuffle 40
      await CommonService.setCardOfPlayer(Consts.DEALER_2, Consts.PLAYER_3, [
        {
          color: Color.RED,
          number: 0,
        },
        {
          color: Color.BLACK,
          special: Special.WILD,
        },
        {
          color: Color.BLACK,
          special: Special.WILD_SHUFFLE,
        },
      ]);
      //Player 4 BLUE 0, BLUE Skip, GREEN 4, GREEN REVERSE, GREEN DRAW_2, WHITE_WILD
      await CommonService.setCardOfPlayer(Consts.DEALER_2, Consts.PLAYER_4, [
        {
          color: Color.BLUE,
          number: 1,
        },
        {
          color: Color.BLUE,
          special: Special.SKIP,
        },
        {
          color: Color.GREEN,
          number: 4,
        },
        {
          color: Color.GREEN,
          special: Special.REVERSE,
        },
        {
          color: Color.GREEN,
          special: Special.DRAW_2,
        },
        {
          color: Color.BLACK,
          special: Special.WHITE_WILD,
        },
      ]);
      const orderOfDesk: { [key: string]: number } = {};
      orderOfDesk[Consts.PLAYER_1] = 299;
      orderOfDesk[Consts.PLAYER_2] = 150;
      orderOfDesk[Consts.PLAYER_3] = 100;
      orderOfDesk[Consts.PLAYER_4] = 50;
      await CommonService.setOrderOfDesk(Consts.DEALER_2, Consts.TOTAL_TURN, orderOfDesk);
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.PLAY_CARD,
          {
            card_play: {
              color: Color.RED,
              number: 9,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(5 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.order[Consts.PLAYER_1]).to.equal(300);
      chai.expect(desk.order[Consts.PLAYER_2]).to.equal(150);
      chai.expect(desk.order[Consts.PLAYER_3]).to.equal(100);
      chai.expect(desk.order[Consts.PLAYER_4]).to.equal(50);
      const player1 = await playerService.detailById(Consts.PLAYER_1);
      const player2 = await playerService.detailById(Consts.PLAYER_2);
      const player3 = await playerService.detailById(Consts.PLAYER_3);
      const player4 = await playerService.detailById(Consts.PLAYER_4);
      chai.expect(player1.total_score).to.equal(254);
      chai.expect(player2.total_score).to.equal(-59);
      chai.expect(player3.total_score).to.equal(-90);
      chai.expect(player4.total_score).to.equal(-105);
      await Promise.resolve();
    });

    it(`s02-H-TC002: Calculator score of Player (Player 1 win 250 turn Score 230, Player 2 win 150 Score -30, Player 3 win 150 Score -90, Player 4 win 50 Score -110)`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: Consts.TOTAL_TURN,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          number: 6,
        },
        cardOfPlayer: [
          {
            color: Color.RED,
            number: 9,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        score: {
          [Consts.PLAYER_1]: 0,
          [Consts.PLAYER_2]: 0,
          [Consts.PLAYER_3]: 0,
          [Consts.PLAYER_4]: 0,
        },
      });
      //Player 2 Score 30
      await CommonService.setCardOfPlayer(Consts.DEALER_2, Consts.PLAYER_2, [
        {
          color: Color.RED,
          special: Special.DRAW_2,
        },
        {
          color: Color.YELLOW,
          number: 5,
        },
        {
          color: Color.BLUE,
          number: 5,
        },
      ]);

      //Player 3 Score 90
      await CommonService.setCardOfPlayer(Consts.DEALER_2, Consts.PLAYER_3, [
        {
          color: Color.BLACK,
          special: Special.WILD,
        },
        {
          color: Color.GREEN,
          special: Special.DRAW_2,
        },
        {
          color: Color.GREEN,
          special: Special.SKIP,
        },
      ]);

      //Player 4 Score 110
      await CommonService.setCardOfPlayer(Consts.DEALER_2, Consts.PLAYER_4, [
        {
          color: Color.BLACK,
          special: Special.WILD_DRAW_4,
        },
        {
          color: Color.BLACK,
          special: Special.WILD_SHUFFLE,
        },
        {
          color: Color.RED,
          special: Special.DRAW_2,
        },
      ]);
      const orderOfDesk: { [key: string]: number } = {};
      orderOfDesk[Consts.PLAYER_1] = 249;
      orderOfDesk[Consts.PLAYER_2] = 150;
      orderOfDesk[Consts.PLAYER_3] = 150;
      orderOfDesk[Consts.PLAYER_4] = 50;
      await CommonService.setOrderOfDesk(Consts.DEALER_2, Consts.TOTAL_TURN, orderOfDesk);
      await new Promise<void>((resolve) => {
        client1.emit(
          Consts.SOCKET.EVENT.PLAY_CARD,
          {
            card_play: {
              color: Color.RED,
              number: 9,
            },
          },
          () => {
            resolve();
          },
        );
      });
      await BlueBird.delay(5 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      chai.expect(desk.order[Consts.PLAYER_1]).to.equal(250);
      chai.expect(desk.order[Consts.PLAYER_2]).to.equal(150);
      chai.expect(desk.order[Consts.PLAYER_3]).to.equal(150);
      chai.expect(desk.order[Consts.PLAYER_4]).to.equal(50);
      const player1 = await playerService.detailById(Consts.PLAYER_1);
      const player2 = await playerService.detailById(Consts.PLAYER_2);
      const player3 = await playerService.detailById(Consts.PLAYER_3);
      const player4 = await playerService.detailById(Consts.PLAYER_4);
      chai.expect(player1.total_score).to.equal(230);
      chai.expect(player2.total_score).to.equal(-30);
      chai.expect(player3.total_score).to.equal(-90);
      chai.expect(player4.total_score).to.equal(-110);
      await Promise.resolve();
    });

    it(`s02-H-TC003: The player who reaches that point first is the winner.`, async () => {
      await CommonService.setDesk({
        dealer: Consts.DEALER_2,
        players: [Consts.PLAYER_1, Consts.PLAYER_2, Consts.PLAYER_3, Consts.PLAYER_4],
        totalTurn: Consts.TOTAL_TURN,
        turn: Consts.TOTAL_TURN,
        beforePlayer: Consts.PLAYER_4,
        nextPlayer: Consts.PLAYER_1,
        beforeCardPlay: {
          color: Color.RED,
          number: 6,
        },
        cardOfPlayer: [
          {
            color: Color.RED,
            number: 9,
          },
        ],
        cardAddOn: 0,
        yellUno: false,
        turnRight: true,
        score: {
          [Consts.PLAYER_1]: 100,
          [Consts.PLAYER_2]: 100,
          [Consts.PLAYER_3]: 100,
          [Consts.PLAYER_4]: -300,
        },
      });
      const player1 = await playerService.detailById(Consts.PLAYER_1);
      const player2 = await playerService.detailById(Consts.PLAYER_2);
      const player3 = await playerService.detailById(Consts.PLAYER_3);
      const player4 = await playerService.detailById(Consts.PLAYER_4);
      const history1 = [50, -70, 56, 37, -52, -32, 26, 386, -24, -165];
      const history2 = [-25, 140, -3, -2, -22, 94, -14, -80, -12, 24];
      const history3 = [-10, -26, 256, -32, -346, -60, -3, -278, -23, 622];
      const history4 = [-15, -44, -197, -3, 420, -2, -9, -28, 59, -481];
      player1.score = {
        [Consts.DEALER_2]: history1,
      };
      player1.markModified(`score.${Consts.DEALER_2}`);
      player1.save();
      player2.score = {
        [Consts.DEALER_2]: history2,
      };
      player2.markModified(`score.${Consts.DEALER_2}`);
      player2.save();
      player3.score = {
        [Consts.DEALER_2]: history3,
      };
      player3.markModified(`score.${Consts.DEALER_2}`);
      player3.save();
      player4.score = {
        [Consts.DEALER_2]: history4,
      };
      player4.markModified(`score.${Consts.DEALER_2}`);
      player4.save();
      await BlueBird.delay(2 * Consts.TIME_DELAY);
      const desk: Desk = await CommonService.getDesk(Consts.DEALER_2);
      const winner = await CommonService.calculateWinnerOfGame(desk);
      chai.expect(winner).to.equal(Consts.PLAYER_2);
      await Promise.resolve();
    });
  });
});
