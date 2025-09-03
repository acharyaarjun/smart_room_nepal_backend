import winston, { format as _format, transports as _transports } from "winston";
import env from "@/utils/validateEnv";
import { rootDir } from "@/utils/fileStorageUtil";

// Log levels
const levels: { [key: string]: number } = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const level = (): string => {
  return env.isDev ? "debug" : "warn";
};

const timeStampFormat = _format.timestamp({
  format: "DD MMM, YYYY - HH:mm:ss:ms",
});

// Define the custom format for the log messages
const customFormat = ({ isFile = false }: { isFile?: boolean }) => {
  return _format.printf((info) => {
    const baseMessage =
      typeof info.message === "object"
        ? JSON.stringify(info.message)
        : info.message;
    const stackTrace = info.stack ? `\nStack: ${info.stack}` : "";
    return `${info.timestamp} [${info.level}]: ${baseMessage} ${
      env.isDev ? stackTrace : isFile ? stackTrace : ""
    }`;
  });
};

// Chose the aspect of your log customizing the log format.
const fileFormat = _format.combine(
  // Add the message timestamp with the preferred format
  timeStampFormat,
  // Define the format of the message showing the timestamp, the level and the message
  customFormat({ isFile: true })
);

// Console log format (with colors)
const consoleFormat = _format.combine(
  winston.format.colorize({ all: true }),
  // Add the message timestamp with the preferred format
  timeStampFormat,
  // Define the format of the message showing the timestamp, the level and the message
  customFormat({ isFile: false })
);

// Define which transports the logger must use to print out messages.
// In this example, we are using three different transports
const transports = [
  new _transports.File({
    filename: `${rootDir}/logs/error.log`,
    level: "error",
    format: fileFormat,
  }),

  new _transports.File({
    filename: `${rootDir}/logs/combined.log`,
    format: fileFormat,
  }),

  // Allow the use the console to print the messages
  new _transports.Console({
    format: consoleFormat,
  }),
];

const logger = winston.createLogger({
  level: level(),
  levels,
  format: _format.combine(
    _format.errors({ stack: true }), // Enable stack trace for errors
    _format.splat(), // Enable string interpolation
    _format.json() // Log in JSON format
  ),
  transports,
  exitOnError: false,
});

export default logger;
