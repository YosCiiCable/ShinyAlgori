import { Document } from 'mongoose';
import { ParamCommonList } from '../../libs/commons';

export type DealerModel = Document & {
  name: string;
  players: string[];
  status: string;
  order?: {
    [key: string]: number;
  };
  score?: {
    [key: string]: number;
  };
  winner?: string;
  turn?: number;
  totalTurn: number;
  whiteWild: string;
};

export type ParamDealerList = ParamCommonList;
