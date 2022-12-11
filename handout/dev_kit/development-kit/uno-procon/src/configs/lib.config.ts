import APP_CONFIG from './app.config';
import { AppConst } from '../commons/consts/app.const';

import { ConfigLibModel } from '../libs/commons';
import { initConfig } from '../libs/config.lib';

export function initConfigLib() {
  const configDataLib: ConfigLibModel = {
    ENVIRONMENT: APP_CONFIG.ENV.NAME,

    SECURE: {
      JWT: {
        TOKEN_EXPIRE: APP_CONFIG.ENV.SECURE.JWT.TOKEN_EXPIRE,
        JWT_SECRET: APP_CONFIG.ENV.SECURE.JWT.JWT_SECRET,
        FIELD: ['_id', 'role', 'email', 'display_name'],
        ALGORITHMS: ['123'],
      },
    },

    // config common ===================================================================================
    PAGE_SIZE: AppConst.PAGE_SIZE,
  };

  initConfig(configDataLib);
}
