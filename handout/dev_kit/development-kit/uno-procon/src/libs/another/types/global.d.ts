/**
 * @type global
 * @description define global type definition
 */
declare namespace NodeJS {
  export interface Global {
    configLibs: any;
    __REDIS: any;
  }
}

declare let configLibs: any;
