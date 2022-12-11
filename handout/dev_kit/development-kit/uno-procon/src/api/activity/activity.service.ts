import { ActivityRepository } from './activity.repository';
import { ActivityModel, ParamActivityList } from './activity.model';
import { getLogger } from '../../libs/commons';

const activityRepository = new ActivityRepository();

export class ActivityService {
  public async create(params: ActivityModel, log4Movie = true) {
    if (log4Movie) {
      getLogger('movie', params.dealer).info({ ...params, dateCreated: Date.now() });
    }
    return activityRepository.create(params);
  }

  public async detailById(id: string) {
    return activityRepository.detailById(id);
  }

  public async detailByCondition(conditions: any) {
    return activityRepository.detailByCondition(conditions);
  }

  public async list(params: ParamActivityList) {
    return activityRepository.list(params);
  }

  public async deleteById(id: string) {
    return activityRepository.deleteOne({ _id: id });
  }
}
