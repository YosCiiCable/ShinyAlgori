#!/usr/bin/env python
# -*- coding: utf-8 -*-

import argparse
import math
import os
import random
import sys
import time

import socketio

from rich import print


class SocketConst:
    class EMIT:
        # メッセージの送受信
        NEW_MESSAGE = 'new-message'

        JOIN_ROOM = 'join-room'
        RECEIVER_CARD = 'receiver-card'
        FIRST_PLAYER = 'first-player'
        COLOR_OF_WILD = 'color-of-wild'
        SHUFFLE_WILD = 'shuffle-wild'
        NEXT_PLAYER = 'next-player'
        PLAY_CARD = 'play-card'
        DRAW_CARD = 'draw-card'
        PLAY_DRAW_CARD = 'play-draw-card'
        CHALLENGE = 'challenge'
        PUBLIC_CARD = 'public-card'
        SAY_UNO_AND_PLAY_CARD = 'say-uno-and-play-card'
        POINTED_NOT_SAY_UNO = 'pointed-not-say-uno'
        SPECIAL_LOGIC = 'special-logic'
        FINISH_TURN = 'finish-turn'
        FINISH_GAME = 'finish-game'


class Special:
    SKIP = 'skip'
    REVERSE = 'reverse'
    DRAW_2 = 'draw_2'
    WILD = 'wild'
    WILD_DRAW_4 = 'wild_draw_4'
    WILD_SHUFFLE = 'wild_shuffle'
    WHITE_WILD = 'white_wild'


class Color:
    RED = 'red'
    YELLOW = 'yellow'
    GREEN = 'green'
    BLUE = 'blue'
    BLACK = 'black'
    WHITE = 'white'


class DrawReason:
  DRAW_2 = 'draw_2'
  WILD_DRAW_4 = 'wild_draw_4'
  BIND_2 = 'bind_2'
  NOTING = 'nothing'

SPECIAL_LOGIC_TITLE = '○○○○○○○○○○○○○○○○○○○○○○○○○○○○'
ARR_COLOR = [Color.RED, Color.YELLOW, Color.GREEN, Color.BLUE]
TEST_TOOL_HOST_PORT = '3000'
TIME_DELAY = 10


print('Start demo player ...')

parser = argparse.ArgumentParser(description='A demo player written in Python')
parser.add_argument('host', action='store', type=str,
                    help='Host to connect')
parser.add_argument('room_name', action='store', type=str,
                    help='Name of the room to join')
parser.add_argument('player', action='store', type=str,
                    help='Player name you join the game as')
parser.add_argument('event_name', action='store', nargs='?', default=None, type=str,
                    help='Event name for test tool')

args = parser.parse_args(sys.argv[1:])
host = args.host
room_name = args.room_name
player = args.player
event_name = args.event_name
is_test_tool = TEST_TOOL_HOST_PORT in host

print('Start demo player ...')

print ({
    'host': host,
    'room_name': room_name,
    'player': player,
    'is_test_tool': is_test_tool,
    'event_name': event_name
})

TEST_TOOL_EVENT_DATA = {
    'join-room': {
        'player': player,
        'room_name': room_name,
    },
    'play-card': {
        'card_play': {
            'color': 'red',
            'number': 6
        },
    },
    'color-of-wild': {
        'color_of_wild': 'red',
    },
    'draw-card': {},
    'play-draw-card': {
        'is_play_card': True,
    },
    'say-uno-and-play-card': {
        'card_play': {
            'color': 'red',
            'number': 6
        },
    },
    'pointed-not-say-uno': {
        'target': 'Player 1',
    },
    'challenge': {
        'is_challenge': True,
    },
    'special-logic': {
        'title': SPECIAL_LOGIC_TITLE,
    },
}



once_connected = False

id = ''
cards_global = []
uno_declared = {}

if not host:
    print('Host missed')
    os._exit(0)

if not room_name or not player:
    print('Arguments invalid')
    # If test-tool, ignore exit

    if not is_test_tool:
        os._exit(0)

# SocketIO Client
# sio = socketio.Client(engineio_logger=True, logger=True)
sio = socketio.Client()

# 共通エラー処理
def handle_error(event, err):
    if not err:
        return

    print('{} event failed!'.format(event))
    print(err)


# イベント送信
def send_join_room(data, callback):
    sio.emit(
        SocketConst.EMIT.JOIN_ROOM,
        data,
        callback=callback
    )


def send_color_of_wild(data):
    print('{} data_req:'.format(SocketConst.EMIT.COLOR_OF_WILD), data)
    sio.emit(
        SocketConst.EMIT.COLOR_OF_WILD,
        data,
        callback=lambda err, undefined: handle_error(
            SocketConst.EMIT.COLOR_OF_WILD, err)
    )


def send_play_card(data):
    print('{} data_req:'.format(SocketConst.EMIT.PLAY_CARD), data)
    sio.emit(
        SocketConst.EMIT.PLAY_CARD,
        data,
        callback=lambda err, undefined: handle_error(
            SocketConst.EMIT.PLAY_CARD, err)
    )


def send_draw_card(data):
    print('{} data_req:'.format(SocketConst.EMIT.DRAW_CARD), data)
    sio.emit(
        SocketConst.EMIT.DRAW_CARD,
        data,
        callback=lambda err, undefined: handle_error(
            SocketConst.EMIT.DRAW_CARD, err)
    )


def send_draw_play_card(data):
    print('{} data_req:'.format(SocketConst.EMIT.PLAY_DRAW_CARD), data)
    sio.emit(
        SocketConst.EMIT.PLAY_DRAW_CARD,
        data,
        callback=lambda err, undefined: handle_error(
            SocketConst.EMIT.PLAY_DRAW_CARD, err)
    )


def send_say_uno_and_draw_card(data):
    print('{} data_req:'.format(SocketConst.EMIT.SAY_UNO_AND_PLAY_CARD), data)
    sio.emit(
        SocketConst.EMIT.SAY_UNO_AND_PLAY_CARD,
        data,
        callback=lambda err, undefined: handle_error(
            SocketConst.EMIT.SAY_UNO_AND_PLAY_CARD, err)
    )


def send_pointed_not_say_uno(data):
    print('{} data_req:'.format(SocketConst.EMIT.POINTED_NOT_SAY_UNO), data)
    sio.emit(
        SocketConst.EMIT.POINTED_NOT_SAY_UNO,
        data,
        callback=lambda err, undefined: handle_error(
            SocketConst.EMIT.POINTED_NOT_SAY_UNO, err)
    )


def send_challenge(data):
    print('{} data_req:'.format(SocketConst.EMIT.CHALLENGE), data)
    sio.emit(
        SocketConst.EMIT.CHALLENGE,
        data,
        callback=lambda err, undefined: handle_error(
            SocketConst.EMIT.CHALLENGE, err)
    )


def send_special_logic(data):
    print('{} data_req:'.format(SocketConst.EMIT.SPECIAL_LOGIC), data)
    sio.emit(
        SocketConst.EMIT.SPECIAL_LOGIC,
        data,
        callback=lambda err, undefined: handle_error(
            SocketConst.EMIT.SPECIAL_LOGIC, err)
    )


def random_by_number(num):
    """
    乱数取得

    Args:
        num (int): 

    Returns:
        int: 
    """
    return math.floor(random.random() * num)


def get_card_play_valid(card_play_before, cards, must_call_draw_card):
    """
    card_play_beforeに基づき、プレイヤーの手札にある全てのカードを取得する関数です。
    cards_valid は Skip、Draw_2、Reverse で構成されています。
    cards_wild は Wild と Wild_shuffle と White_wild で構成されています。
    cards_wild4 は Wild_draw_4 のみで構成されています。
    card_play_before is card before play of before Player.
    must_call_draw_card have value is true or false. If must_call_draw_card = true, Player only call event draw-card to draw more cards from Desk.
    """
    cards_valid = []
    cards_wild = []
    cards_wild4 = []

    if str(must_call_draw_card) == 'True':
        return {
            'cardsValid': cards_valid,
            'cardsWild': cards_wild,
            'cardsWild4': cards_wild4,
        }

    for card in cards:
        card_special = card.get('special')
        card_number = card.get('number')
        if str(card_special) == Special.WILD_DRAW_4:
            cards_wild4.append(card)
        elif (
            str(card_special) == Special.WILD or
            str(card_special) == Special.WILD_SHUFFLE or
            str(card_special) == Special.WHITE_WILD
        ):
            cards_wild.append(card)
        elif str(card.get('color')) == str(card_play_before.get('color')):
            cards_valid.append(card)
        elif (
            (card_special and str(card_special) == str(card_play_before.get('special'))) or
            ((card_number is not None or (card_number is not None and int(card_number) == 0)) and
             (card_play_before.get('number') and int(card_number) == int(card_play_before.get('number'))))
        ):
            cards_valid.append(card)

    return cards_valid, cards_wild, cards_wild4


def remove_card_of_player(card_play, cards_of_player):
    """
    プレイヤーのカードを削除する機能。
    例：プレイヤー1が赤9と黄8の2枚のカードを持っている。プレイヤー1が赤9をプレイ→プレイヤー1は黄8を残す。
    """
    is_remove = False
    new_cards_of_player = []
    for card_validate in cards_of_player:
        if is_remove:
            new_cards_of_player.append(card_validate)
            continue
        elif card_play.get('special'):
            if card_play.get('color') == card_validate.get('color') and card_play.get('special') == card_validate.get('special'):
                is_remove = True
                continue
            else:
                new_cards_of_player.append(card_validate)
                continue
        else:
            if (
                card_play.get('color') == card_validate.get('color') and
                card_play.get('number') is not None and card_validate.get('number') is not None and
                int(card_play.get('number')) == int(
                    card_validate.get('number'))
            ):
                is_remove = True
                continue
            else:
                new_cards_of_player.append(card_validate)
                continue
    return new_cards_of_player


def execute_play(total, play_cards):
    """
    カードを出す

    Args:
        total (int): 手札の総数
        play_cards (list): 場に出す候補のカードリスト
    """
    card_play = play_cards[random_by_number(len(play_cards))]
    data = {
        'card_play': card_play,
    }
    if total == 2:
        # call event say-uno-and-play-card
        send_say_uno_and_draw_card(data)
    else:
        # call event play-card
        send_play_card(data)


def determine_if_execute_pointed_not_say_uno(number_card_of_player):
  global uno_declared

  target = None
  for k, v in number_card_of_player.items():
    if v == 1:
      target = k
      break
    elif k in uno_declared:
      del uno_declared[k]
  
  if (
    target is not None and
    target != id and
    target not in uno_declared.keys()
  ):
    send_pointed_not_say_uno({
        'target': target,
    })
    time.sleep(TIME_DELAY / 1000)


@sio.on('connect')
def on_connect():
    print('Client connect successfully!')

    def join_room_callback(*args):
        global once_connected, id
        if args[0]:
            print('Client join room failed!')
            print(args[0])
            sio.disconnect()
        else:
            print('Client join room successfully!')
            print(args[1])
            once_connected = True
            id = args[1].get('your_id')

    if not once_connected:
        if is_test_tool:
            if not event_name:
                print('Not found event name')

            event_data = TEST_TOOL_EVENT_DATA.get(event_name, None)
            if event_name and not event_data:
                print('Undefined event name')

            if event_name == SocketConst.EMIT.JOIN_ROOM:
                send_join_room(event_data, join_room_callback)
                return
            if event_name == SocketConst.EMIT.COLOR_OF_WILD:
                send_color_of_wild(event_data)
                return
            if event_name == SocketConst.EMIT.PLAY_CARD:
                send_play_card(event_data)
                return
            if event_name == SocketConst.EMIT.DRAW_CARD:
                send_draw_card(event_data)
                return
            if event_name == SocketConst.EMIT.PLAY_DRAW_CARD:
                send_draw_play_card(event_data)
                return
            if event_name == SocketConst.EMIT.CHALLENGE:
                send_challenge(event_data)
                return
            if event_name == SocketConst.EMIT.SAY_UNO_AND_PLAY_CARD:
                send_say_uno_and_draw_card(event_data)
                return
            if event_name == SocketConst.EMIT.POINTED_NOT_SAY_UNO:
                send_pointed_not_say_uno(event_data)
                return
            if event_name == SocketConst.EMIT.SPECIAL_LOGIC:
                send_special_logic(event_data)
                return
        else:
            data_join_room = {
                'room_name': room_name,
                'player': player
            }
            send_join_room(data_join_room, join_room_callback)
            return


@sio.on('disconnect')
def on_disconnect():
    print('Client disconnect:')
    os._exit(0)


@sio.on(SocketConst.EMIT.JOIN_ROOM)
def on_join_room(data_res):
    print('join room: data_res:', data_res)


@sio.on(SocketConst.EMIT.RECEIVER_CARD)
def on_receiver_card(data_res):
    global cards_global
    print('{} receive cards: '.format(id))
    print(data_res)
    if data_res.get('player') == id:
        cards_global = cards_global + data_res.get('cards_receive', [])
        print('{} cards_global: '.format(
            SocketConst.EMIT.RECEIVER_CARD), cards_global)


@sio.on(SocketConst.EMIT.FIRST_PLAYER)
def on_first_player(data_res):
    print('{} is first player.'.format(data_res.get('first_player')))
    print(data_res)


@sio.on(SocketConst.EMIT.COLOR_OF_WILD)
def on_color_of_wild(data_res):
    color_of_wild = ARR_COLOR[random_by_number(len(ARR_COLOR))]
    data = {
        'color_of_wild': color_of_wild,
    }
    send_color_of_wild(data)


@sio.on(SocketConst.EMIT.SHUFFLE_WILD)
def on_suffle_wild(data_res):
    global cards_global
    print('{} receive cards from shuffle wild.'.format(id))
    print(data_res)
    cards_global = data_res.get('cards_receive')
    print('{} cards_global:'.format(
        SocketConst.EMIT.SHUFFLE_WILD), cards_global)


@sio.on(SocketConst.EMIT.PLAY_CARD)
def on_play_card(data_res):
    global cards_global
    card_play = data_res.get('card_play')
    print(
        '{} play card {} {}.'.format(
            data_res.get('player'), card_play.get('color'), card_play.get('special') or card_play.get('number'))
    )
    print('{} data_res:'.format(SocketConst.EMIT.PLAY_CARD), data_res)
    if data_res.get('player') == id and card_play:
        cards_global = remove_card_of_player(card_play, cards_global)
        print('cards_global after:', cards_global)


@sio.on(SocketConst.EMIT.DRAW_CARD)
def on_draw_card(data_res):
    print('{} data_res:'.format(SocketConst.EMIT.DRAW_CARD), data_res)
    if data_res.get('player') == id:
        if data_res.get('can_play_draw_card'):
            print('{} data_req:'.format(SocketConst.EMIT.PLAY_DRAW_CARD), {
                'is_play_card': True
            })
            data = {
                'is_play_card': True
            }
            send_draw_play_card(data)
        else:
            print('{} can not play draw card.'.format(data_res.get('player')))


@sio.on(SocketConst.EMIT.PLAY_DRAW_CARD)
def on_play_draw_card(data_res):
    global cards_global
    print('{} data_res:'.format(SocketConst.EMIT.PLAY_DRAW_CARD), data_res)
    print('{} play draw card.'.format(data_res.get('player')))
    if data_res.get('player') == id and data_res.get('is_play_card') == True:
        cards_global = remove_card_of_player(
            data_res.get('card_play'), cards_global)


@sio.on(SocketConst.EMIT.CHALLENGE)
def on_challenge(data_res):
    if data_res.get('is_challenge'):
        if data_res.get('is_challenge_success'):
            print('{} challenge successfully!'.format(
                data_res.get('challenger')))
        else:
            print('{} challenge failed!'.format(data_res.get('challenger')))
    else:
        print('{} no challenge.'.format(data_res.get('challenger')))


@sio.on(SocketConst.EMIT.PUBLIC_CARD)
def on_public_card(data_res):
    print('Public card of player {}.'.format(data_res.get('card_of_player')))
    print(data_res.get('cards'))


@sio.on(SocketConst.EMIT.SAY_UNO_AND_PLAY_CARD)
def on_say_uno_and_play_card(data_res):
    global cards_global
    card_play = data_res.get('card_play', {})
    print(
        '{} play card {} {} and say UNO.'.format(
            data_res.get('player'), card_play.get('color'), card_play.get('special') or card_play.get('number'))
    )

    uno_declared[data_res.get('player')] = True

    if data_res.get('player') == id and card_play:
        cards_global = remove_card_of_player(card_play, cards_global)
        print('cards_global after: ', cards_global)


@sio.on(SocketConst.EMIT.POINTED_NOT_SAY_UNO)
def on_pointed_not_say_uno(data_res):
    if str(data_res.get('have_say_uno')) == 'True':
        print('{} have say UNO.'.format(data_res.get('player')))
    elif str(data_res.get('have_say_uno')) == 'False':
        print('{} no say UNO.'.format(data_res.get('player')))


@sio.on(SocketConst.EMIT.FINISH_TURN)
def on_finish_turn(data_res):
    global cards_global
    if data_res.get('winner'):
        print('Winner turn {} is {}.'.format(
            data_res.get('turn_no'), data_res.get('winner')))
    else:
        print('Finish turn. No winner is this turn.')
    cards_global = []


@sio.on(SocketConst.EMIT.FINISH_GAME,)
def on_finish_game(data_res):
    print(data_res)
    print('Winner of game {}, turn win is {}.'.format(
        data_res.get('winner'), data_res.get('turn_win')))


@sio.on(SocketConst.EMIT.NEXT_PLAYER)
def on_next_player(data_res):
    global cards_global
    print('{} data_res: '.format(SocketConst.EMIT.NEXT_PLAYER), data_res)
    time.sleep(TIME_DELAY / 1000)
    print('{} is next player. turn: {}'.format(
        data_res.get('next_player'),
        data_res.get('number_turn_play')
    ))

    determine_if_execute_pointed_not_say_uno(data_res.get('number_card_of_player'))

    print('Run NEXT_PLAYER ...')
    # refresh cards_global
    cards_global = data_res.get('card_of_player')
    print(cards_global)
    cards = cards_global
    card_play_before = data_res.get('card_before', {})
    draw_reason = data_res.get('draw_reason')

    # play_wild_draw4_turnの直後のターンの場合 プレイの前にChallengeができます。
    # ただし、ホワイトワイルド（bind_2）の効果が発動している間はチャレンジができません。
    if (draw_reason == DrawReason.WILD_DRAW_4):
        # random challenge or not
        num_random = random_by_number(2)
        print('${SocketConst.EMIT.CHALLENGE} data_req:', {
            'is_challenge': True if num_random else False,
        })
        sio.emit(
            SocketConst.EMIT.CHALLENGE,
            {
                'is_challenge': True if num_random else False,
            },
            callback=lambda err, undefined: handle_error(
                SocketConst.EMIT.CHALLENGE, err)
        )

        # num_random = 1の場合、プレイの前にChallengeすることを意味します。そして、ディーラーからのChallengeの結果を待ちます。
        if num_random:
            return

    cards_valid, cards_wild, cards_wild4 = get_card_play_valid(
        card_play_before,
        cards,
        data_res.get('must_call_draw_card'),
    )

    special_logic_num_random = random_by_number(10)
    if special_logic_num_random == 0:
        data = {
            'title': SPECIAL_LOGIC_TITLE,
        }
        send_special_logic(data)

    if str(data_res.get('must_call_draw_card')) == 'True':
        # If must_call_draw_card = True, Player must be call event draw_card
        print('{} data_req:'.format(SocketConst.EMIT.DRAW_CARD), {
            'player': id,
        })
        send_draw_card({})
        return
    elif len(cards_valid) > 0:
        # If len(cards_valid) > 0, Player can play card from cards_valid list
        execute_play(len(cards), cards_valid)
        return
    elif len(cards_wild) > 0:
        # If len(cards_wild) > 0, Player can play card from cards_valid list
        execute_play(len(cards), cards_wild)
        return
    elif len(cards_wild4) > 0:
        # If len(cards_wild4) > 0, Player can play card from cards_wild4 list
        execute_play(len(cards), cards_wild4)
        return
    else:
        """
        有効なカードがない場合、プレイヤーはイベントDRAW_CARDを呼び出す必要があります。
        詳細はプレイヤー仕様書を参照してください。
        """
        send_draw_card({})
        return


@sio.on('*')
def catch_all(event, data):
    print('!! unhandled event: {} '.format(event), data)


def main():
    sio.connect(
        args.host,
        transports=['websocket'],
    )
    sio.wait()


if __name__ == '__main__':
    main()
