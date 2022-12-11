/**
 * @module app
 * @description config all application
 * @since 2020-10-05
 */

import { Server } from 'http';
import * as http from 'http';
import * as express from 'express';
import * as signale from 'signale';

import APP_CONFIG from './configs/app.config';
import { initConfigLib } from './configs/lib.config';

import databaseConfig from './configs/database';
import configExpress from './configs/express.config';
import configServer from './configs/server.config';
import socketConfig from './configs/socket.config';
import registerRoutes from './configs/router.config';
import bootstrapConfig from './configs/bootstrap.config';
import { CommonService } from './api/commons/common.service';

const app = express();

initConfigLib(); // setup config-lib
databaseConfig(); // config connect db (mongodb & redis)
configExpress(app); // config express app
registerRoutes(app); // config register router
bootstrapConfig(); // load bootstrapping config

// init common service
CommonService.init();

const server: Server = http.createServer(app);
configServer(server, APP_CONFIG.ENV.APP.PORT);
socketConfig(server);
server.listen(APP_CONFIG.ENV.APP.PORT, () => {
  const serverAddress: any = server.address();
  signale.success(`Server's running at: ${serverAddress.address}/${serverAddress.port}`);
});

export default app;
