const {createLogger, format, transports} = require("winston");

const logFileName = 'log/latest_run.log';
const logger = createLogger({
  transports: [
    new transports.Console({
      format: format.combine(
        format.errors({ stack: true }),
        format.colorize(),
        format.align(),
        format.timestamp(),
        format.printf((info) => `${info.level}: ${info.message}`)
      ),
      level: 'info'
    }),
    new transports.File({
      filename: logFileName,
      maxsize: 10000000, // 10 MB
      maxFiles: 1,
      level: "debug",
      format: format.combine(
        format.errors({ stack: true }),
        format.align(),
        format.timestamp(),
        format.printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`)
      )
    })
  ],
  exceptionHandlers: [
    new transports.File({ filename: logFileName }),
  ],
  rejectionHandlers: [
    new transports.File({ filename: logFileName }),
  ],
});

module.exports = logger;
