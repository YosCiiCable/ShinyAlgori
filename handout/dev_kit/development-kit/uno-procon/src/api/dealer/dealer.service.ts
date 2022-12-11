import { AppConst } from '../../commons/consts/app.const';
import { Desk, StatusGame } from '../../commons/consts/app.enum';
import { DealerRepository } from './dealer.repository';
import { DealerModel, ParamDealerList } from './dealer.model';
import { CommonService } from '../commons/common.service';
import { ParamCommonUpdateOne } from '../../libs/commons';
import { BaseError } from '../../libs/standard';
import redisClient from '../../configs/database/redis.config';

const dealerRepository = new DealerRepository();

export class DealerService {
  public async create(params: DealerModel) {
    const dealerExists = await this.detailByCondition({
      name: params.name,
    });
    if (dealerExists) {
      throw new BaseError({ message: AppConst.DEALER_EXISTS_WITH_SAME_NAME });
    }

    return dealerRepository.create(params);
  }

  public async updateByCondition(params: ParamCommonUpdateOne) {
    return dealerRepository.updateOne(params);
  }

  public async detailById(id: string) {
    const dealer = await dealerRepository.detailById(id);
    if (!dealer) {
      throw new BaseError({ message: AppConst.DEALER_NOT_FOUND });
    }

    return dealer;
  }

  public async detailByCondition(conditions: any) {
    return dealerRepository.detailByCondition(conditions);
  }

  public async list(params: ParamDealerList) {
    return dealerRepository.list(params);
  }

  public async deleteById(id: string) {
    await this.detailById(id);
    return dealerRepository.deleteOne({ _id: id });
  }

  public async startDealer(id: string) {
    const dealer = await this.detailById(id);
    if ((dealer.status as StatusGame) === StatusGame.FINISH) {
      throw new BaseError({ message: AppConst.STATUS_DEALER_INVALID_CAN_NOT_START_DEALER });
    }

    const deskInfo: Desk = JSON.parse(await redisClient.get(dealer.name));
    let isFirstStart = true;
    if (deskInfo) {
      if (deskInfo.turn > 1) {
        isFirstStart = false;
      }
    }

    return await CommonService.startDealer(dealer.name, dealer, isFirstStart);
  }
}
