import { Document } from 'mongoose';
import { ParamCommonList } from '../../libs/commons';

export type PlayerModel = Document & {
  name: string;
  team: string;
  score?: {
    [key: string]: number[];
  };
  total_score?: number;
};

export type ParamPlayerList = ParamCommonList;
