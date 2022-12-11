// import Consts from '../helpers/consts';
// import * as commonService from '../../src/api/commons/common/common.service';
// import StaticValues from '../helpers/static-values';

import { CommonService } from '../../src/api/commons/common.service';

before(async () => {
  try {
    await CommonService.resetDb();
  } catch (exception) {
    console.log(`[LogDebug] before exception: `, exception);
  }
});

after(async () => {
  try {
    await CommonService.resetDb();
  } catch (exception) {
    console.log(`[LogDebug] after exception: `, exception);
  }
});
