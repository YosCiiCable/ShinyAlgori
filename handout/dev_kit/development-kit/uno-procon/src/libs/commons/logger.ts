import sanitize = require('sanitize-filename');
import * as winston from 'winston';

const { format, transports } = winston;

const loggers = {};

export const getLogger = (group: string, name = '') => {
  const loggerName = sanitize(`${group}_${name}`, { replacement: '_' }).replace(/\s/g, '_');
  const fileName = sanitize(name, { replacement: '_' }).replace(/\s/g, '_');
  if (loggers[loggerName]) {
    return loggers[loggerName];
  }
  switch (group) {
    case 'movie':
      loggers[loggerName] = winston.createLogger({
        level: 'info',
        transports: [
          new transports.Console({
            format: format.combine(
              format.timestamp({
                format: 'YYYY-MM-DD HH:mm:ss',
              }),
              format.prettyPrint(),
              format.printf(({ timestamp, message }) => {
                try {
                  message = JSON.stringify(message, null, 2);
                } catch {
                  // do nothing
                }
                return `[LogMovie] ${timestamp} ${message}`;
              }),
            )
          }),
          new transports.File({
            filename: `logs/${fileName}.log`,
            format: format.printf(({ message }) => {
              try {
                message = JSON.stringify(message);
              } catch {
                // do nothing
              }
              return `${message}`;
            })
          }),
        ],
      });
      break;
    default:
      loggers[loggerName] = winston.createLogger({
        level: 'debug',
        transports: [
          new transports.Console({
            format: format.prettyPrint()
          }),
        ],
      });
      break;
  }

  return loggers[loggerName];
};