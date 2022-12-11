import { WebController } from './web.controller';

import { router } from '../../libs/standard';

const webCtrl = new WebController();

router.get('/admin/web', webCtrl.list, {
  allowAnonymous: true,
});

router.get('/admin/web/player/:id', webCtrl.player, {
  allowAnonymous: true,
});

export default 'web';
