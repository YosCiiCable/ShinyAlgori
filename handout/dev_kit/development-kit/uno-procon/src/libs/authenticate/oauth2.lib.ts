/**
 * @description config oauth2 library
 * @since 2018-05-05
 */

import { Request, Response, NextFunction } from 'express';
import { ConfigLib } from '../config.lib';

import { Strategy } from '../commons/models';
import { CodeLib } from '../commons/consts';

export class Oauth2Lib {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() {}

  /**
   * @method verifyClient
   * @description handler oauth2 custom
   * * Note: If this function is used, all of the following handler functions will be ignored.
   * Except for the execute function behind the same
   * @param {{strategy: Strategy}} config
   * @return {(req: e.Request, res: e.Response, next: e.NextFunction) => (void | undefined)}
   */
  public static verifyClient(config: { strategy: Strategy }) {
    return function (req: Request, res: Response, next: NextFunction) {
      switch (config.strategy) {
        case Strategy.ClientId:
          return Oauth2Lib.handleClientId(req, res, next);
        case Strategy.ClientSecret:
          return Oauth2Lib.handleClientSecret(req, res, next);
        default:
          return;
      }
    };
  }

  /**
   * @method handleClientId
   * @description basic handler client id header
   * @param {e.Request} req
   * @param {e.Response} res
   * @param {e.NextFunction} next
   */
  public static handleClientId(req: Request, res: Response, next: NextFunction) {
    const clientId: string = <string>req.headers[Strategy.ClientId];
    if (!clientId || ConfigLib.SECURE.API_RESTRICT.CLIENT_IDS.indexOf(clientId) == -1) {
      return next({ status: 403, code: CodeLib.AUTHENTICATE_CLIENT_ID_INVALID });
    }
    return next();
  }

  /**
   * @method handleClientSecret
   * @description basic handler client secret header
   * @param {e.Request} req
   * @param {e.Response} res
   * @param {e.NextFunction} next
   */
  public static handleClientSecret(req: Request, res: Response, next: NextFunction) {
    const clientSecret: string = <string>req.headers[Strategy.ClientSecret];
    if (
      !clientSecret ||
      clientSecret.length < 71 ||
      ConfigLib.SECURE.API_RESTRICT.CLIENT_SECRET.indexOf(clientSecret) === -1
    ) {
      return next({ status: 403, code: CodeLib.AUTHENTICATE_CLIENT_ID_INVALID });
    }
    return next();
  }
}
