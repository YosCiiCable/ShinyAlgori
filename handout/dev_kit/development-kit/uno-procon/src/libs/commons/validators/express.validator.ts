/* eslint-disable @typescript-eslint/no-var-requires */
import { uniq } from 'lodash';
import * as moment from 'moment';

import { Utils } from '../utils';
import { DataType } from '../models';

const IdValid = require('mongoose').Types.ObjectId.isValid;

export class ExpressValidator {
  public static customExpressValidation() {
    return {
      isArray: (value: any) => {
        return Array.isArray(value);
      },
      /**
       * @method isArrayType
       * @param type {DataType}
       * @param values
       */
      isArrayType: (type: DataType, values?: any) => {
        return (
          Array.isArray(values) &&
          values.filter((value) => typeof value === type).length === values.length
        );
      },
      // only support type: string|number|boolean
      isArrayUnique: (values?: any) => {
        return Array.isArray(values) && uniq(values).length === values.length;
      },
      isArrayMinimum: (value: any, num?: number) => {
        return Array.isArray(value) && value.length >= num;
      },
      isArrayObjectId: (value?: any) => {
        return Array.isArray(value) && value.filter((item) => !IdValid(item)).length === 0;
      },
      isUniqueArrayObjectId: (value?: any) => {
        return (
          Array.isArray(value) &&
          value.filter((item) => !IdValid(item)).length === 0 &&
          new Set(value.map((item) => item)).size === value.length
        );
      },
      isString: (value: any) => {
        return 'string' === typeof value;
      },
      gte: (param: number, num: number) => {
        return param >= num;
      },
      isDob: (value: string) => {
        return moment(value, 'YYYY/MM/DD').isValid();
      },
      isSSN: (value: string) => {
        return Utils.strings.validationSSN(value);
      },
    };
  }
}
