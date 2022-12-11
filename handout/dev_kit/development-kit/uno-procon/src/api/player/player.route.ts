import { PlayerController } from './player.controller';

import { router } from '../../libs/standard';

const playerCtrl = new PlayerController();

router.get('/admin/player', playerCtrl.list, {
  allowAnonymous: true,
});

export default 'player';
