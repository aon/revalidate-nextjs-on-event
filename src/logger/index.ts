import pino from "pino";

const logger = pino(
  {
    formatters: {
      level: (label) => ({ level: label }),
    },
  },
  pino.multistream([
    { stream: process.stdout },
    { stream: pino.destination(`${process.cwd()}/combined.log`) },
  ])
);

export default logger;
