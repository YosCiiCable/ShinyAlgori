/**
 * @module Logger library
 * @interface sub interface logger
 * config =>
 *  - emerg: 0, // <=> emergency
 *  - alert: 1,
 *  - crit: 2,  // <=> critical
 *  - error: 3,
 *  - warning: 4,
 *  - notice: 5,
 *  - info: 6,
 *  - debug: 7
 * */

export enum LogLevel {
  emergency = 0,
  alert = 1,
  critical = 2,
  error = 3,
  warning = 4,
  notice = 5,
  info = 6,
  debug = 7,
}

export interface LogFull {
  env: string;
  facility: string;
  host: string;
  shortMessage: string;
  level: number;
  path: string;
  status: number;
  rawData: {
    method: string;
    body: any;
    query: any;
  };
  rawHeaders: {
    ip: string;
    userAgent: string;
  };
  rawResponse: any;
}

export interface LogShort {
  shortMessage: string;
  level?: number;
  path: string;
  status?: number;
  rawData: {
    method?: string;
    body: any;
    query: any;
  };
  rawHeaders: {
    ip: string;
    userAgent: string;
  };
  rawResponse: any;
}
