import { DealerController } from './dealer.controller';

import { router } from '../../libs/standard';
// import { Environment } from '../../libs/commons';
// import { GrantPermission } from '../../libs/authenticate';

const dealerCtrl = new DealerController();

router.get('/admin/dealer', dealerCtrl.list, {
  allowAnonymous: true,
});
router.get('/admin/dealer/:id', dealerCtrl.detailById, {
  allowAnonymous: true,
});
router.delete('/admin/dealer/:id', dealerCtrl.deleteById, {
  // roles: [GrantPermission.ROLES.ADMIN],
  // env: [Environment.local],
  allowAnonymous: true,
});
router.post('/admin/dealer', dealerCtrl.create, {
  allowAnonymous: true,
});

router.post('/admin/dealer/:id/start-dealer', dealerCtrl.startDealer, {
  allowAnonymous: true,
});

export default 'dealer';
