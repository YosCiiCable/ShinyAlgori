import { Request, Response } from 'express';
import { PlayerService } from './player.service';

const playerService = new PlayerService();

export class PlayerController {
  public list(req: Request, res: Response) {
    const lang = req.query.lang;
    const params: any = {
      paginate: req.query,
      lang: lang,
    };
    playerService
      .list(params)
      .then((data) => {
        return res.ok(data);
      })
      .catch((error) => {
        return res.bad(error);
      });
  }
}
