import { CorsOptions } from 'cors';
import * as express from 'express';
import * as session from 'express-session-multiple';

import { ConfigLib } from '../../config.lib';

export class SessionConfig {
  /**
   * @method corsConfig
   * @description config cross resources original
   * @summary accept cross domain cookie, origin whitelist not config (Reason: apply config whitelist in infrastructure [KONG GATEWAY])
   * @return {e.CorsOptions}
   */
  public static corsConfig(): CorsOptions {
    return {
      origin: true,
      credentials: true,
    };
  }

  /**
   * @method commonConfig
   * @description config middleware session store
   * @return {express.RequestHandler}
   */
  public static commonConfig(): express.RequestHandler {
    return session({
      secret: ConfigLib.SECURE.SESSION.SECRET,
      configSecures: ConfigLib.SECURE.SESSION.CONFIG_SECURES.map((configSecure) => {
        return {
          name: configSecure.NAME,
          domain: configSecure.DOMAIN,
        };
      }),
      store: ConfigLib.SECURE.SESSION.STORE_CONFIG,
      cookie: {
        maxAge: ConfigLib.SECURE.SESSION.COOKIE.MAX_AGE,
        signed: ConfigLib.SECURE.SESSION.COOKIE.SIGNED,
        httpOnly: ConfigLib.SECURE.SESSION.COOKIE.HTTP_ONLY,
        domain: ConfigLib.SECURE.SESSION.COOKIE.DOMAIN,
        secure: ConfigLib.SECURE.SESSION.COOKIE.SECURE,
      },
      rolling: ConfigLib.SECURE.SESSION.ROLLING,
      saveUninitialized: ConfigLib.SECURE.SESSION.SAVE_UNINITIALIZED,
      resave: ConfigLib.SECURE.SESSION.RE_SAVE,
    });
  }
}
