import { Request, Response } from 'express';
import * as mongoose from 'mongoose';

import { AppConst } from '../../commons/consts/app.const';

import { DealerService } from '../dealer/dealer.service';
import { PlayerService } from '../player/player.service';

import { Players } from '../player/player.collection';

const dealerService = new DealerService();
const playerService = new PlayerService();
const baseTemplateData = { title: 'Admin tool' };

export class WebController {
  public list(req: Request, res: Response) {
    const lang = req.query.lang;
    const params: any = {
      paginate: { page: req.query.page },
      order: req.query.order || 'desc',
      lang: lang,
    };

    dealerService
      .list(params)
      .then(async (data) => {
        const playerIds = [...new Set(data.data.map((dealer) => dealer.players).flat(1))];
        Players.find({
          _id: { $in: playerIds.map((playerId) => mongoose.Types.ObjectId(playerId)) },
        }).then((players) => {
          players = players.reduce((obj, item) => ((obj[item._id] = item), obj), {});
          return res.render('admin/dealer', {
            ...baseTemplateData,
            ...data,
            players,
            pageName: 'list',
            pageTitle: 'ディーラー一覧',
            MIN_PLAYER: AppConst.MIN_PLAYER,
          });
        });
      })
      .catch((error) => {
        return res.bad(error);
      });
  }

  public player(req: Request, res: Response) {
    playerService
      .detailById(req.params.id)
      .then((data) => {
        return res.render('admin/player', {
          ...baseTemplateData,
          ...data,
          pageName: 'player',
          pageTitle: 'プレイヤー成績',
        });
      })
      .catch((error) => {
        return res.bad(error);
      });
  }
}
