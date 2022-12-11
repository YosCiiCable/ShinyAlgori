/* eslint-disable @typescript-eslint/no-var-requires */
/**
 * @module util
 * @description object util
 */

import * as dot from 'dot-object';
import * as sobjectMapper from 'object-mapper';
import { Request, Response, NextFunction } from 'express';

const camelcaseKeys = require('camelcase-keys');
const snakecaseKeys = require('snakecase-keys');

export class ObjectUtil {
  /**
   * Merges an object with another objects
   * @param object The destination object
   * @param sources The source objects
   */
  public static merge(object: any, ...sources: any[]): any {
    sources.forEach((src) => {
      for (const key in src) {
        if (src[key] !== undefined) {
          if (this.isPureObject(src[key])) {
            ObjectUtil.merge(object[key], src[key]);
          } else {
            object[key] = src[key];
          }
        }
      }
    });
    return object;
  }

  public static camelCase(obj: any, deep = true) {
    return camelcaseKeys(obj, { deep: deep });
  }

  public static snakeCase(obj: any) {
    return snakecaseKeys(obj);
  }

  public static isPureObject(obj: any) {
    if (!obj) return false;
    return 'object' === typeof obj && !Array.isArray(obj) && !(obj instanceof Date);
  }

  /**
   * Check if the object is null or undefined or empty(only fields, excludes prototype)
   * @param obj - Object
   */
  public static isNullOrEmpty(obj: any): boolean {
    return !obj || !Object.keys(obj).length;
  }

  public static map(source: Object, map: any, notRemoveNull = false): any {
    if (source === null) return source;
    const des = sobjectMapper(source, map);
    if (!notRemoveNull) {
      for (const key in des) {
        if ('object' === typeof des[key] && this.isNullOrEmpty(des[key])) {
          Reflect.deleteProperty(des, key);
        }
      }
    }
    return des;
  }

  public static mapReverse(source: Object, map: any, notRemoveNull = false): any {
    const reverseMap: any = {};
    for (const key in map) {
      reverseMap[map[key]] = key;
    }
    return map(source, map, notRemoveNull);
  }

  public static normalizeFormData(req: Request, res: Response, next: NextFunction) {
    req.body = dot.object(req.body);
    next();
  }

  /**
   * @method enumValues
   * @param enumObj
   * @param typeValue type value is string, number, bool ..
   */
  public static enumValues(enumObj: any, typeValue: string) {
    const keys = Object.keys(enumObj).filter((k) => typeof enumObj[k as any] === typeValue); // ["A", "B"]
    return keys.map((k) => enumObj[k as any]);
  }

  public static compareData(dataOld: any, dataNew: any) {
    const arrayMerges = [],
      tmpOld: any = {},
      tmpNew: any = {};
    const oldKeys = Object.keys(dataOld);
    const newKeys = Object.keys(dataNew);
    for (const loopNew of newKeys) {
      for (const loopOld of oldKeys) {
        if (loopOld === loopNew) {
          arrayMerges.push(loopNew);
        }
      }
    }
    arrayMerges.map((item) => {
      if (typeof dataOld[item] == 'object' && typeof dataNew[item] == 'object') {
        const dataCompare: any = ObjectUtil.compareData(dataOld[item], dataNew[item]);
        if (
          !ObjectUtil.isNullOrEmpty(dataCompare.old) &&
          !ObjectUtil.isNullOrEmpty(dataCompare.new)
        ) {
          tmpOld[item] = dataCompare.old;
          tmpNew[item] = dataCompare.new;
        }
      } else if (dataOld[item] !== dataNew[item]) {
        tmpOld[item] = dataOld[item];
        tmpNew[item] = dataNew[item];
      }
    });
    return {
      old: tmpOld,
      new: tmpNew,
    };
  }

  public static flat(oldData: any, newData: any) {
    const keys: string[] = Object.keys(oldData);
    let keysFlat: string[] = [];
    let oldValuesFlat: string[] = [];
    let newValuesFlat: string[] = [];
    if (keys.length == 0) {
      return {
        keysFlat: keysFlat,
        oldValuesFlat: oldValuesFlat,
        newValuesFlat: newValuesFlat,
      };
    }
    for (const key of keys) {
      if (typeof oldData[key] == 'object') {
        const dataFlat = ObjectUtil.flat(oldData[key], newData[key]);
        keysFlat = keysFlat.concat(dataFlat.keysFlat);
        oldValuesFlat = oldValuesFlat.concat(dataFlat.oldValuesFlat);
        newValuesFlat = newValuesFlat.concat(dataFlat.newValuesFlat);
      } else {
        keysFlat.push(key);
        oldValuesFlat.push(oldData[key]);
        newValuesFlat.push(newData[key]);
      }
    }

    return {
      keysFlat: keysFlat,
      oldValuesFlat: oldValuesFlat,
      newValuesFlat: newValuesFlat,
    };
  }
}
