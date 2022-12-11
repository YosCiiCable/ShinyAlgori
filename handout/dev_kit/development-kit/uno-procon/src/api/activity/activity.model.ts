import { Document } from 'mongoose';
import { ParamCommonList } from '../../libs/commons';

export type ActivityModel = Document & {
  dealer: string;
  player: string;
  event: string;
  turn?: number;
  contents: any;
};

export type ParamActivityList = ParamCommonList;
