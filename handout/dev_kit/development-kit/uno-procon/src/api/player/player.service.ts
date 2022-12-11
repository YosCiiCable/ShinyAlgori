import { PlayerRepository } from './player.repository';
import { PlayerModel, ParamPlayerList } from './player.model';

const playerRepository = new PlayerRepository();

export class PlayerService {
  public async create(params: PlayerModel) {
    return playerRepository.create(params);
  }

  public async detailById(id: string) {
    return playerRepository.detailById(id);
  }

  public async detailByCondition(conditions: any) {
    return playerRepository.detailByCondition(conditions);
  }

  public async list(params: ParamPlayerList) {
    return playerRepository.list(params);
  }

  public async deleteById(id: string) {
    return playerRepository.deleteOne({ _id: id });
  }
}
