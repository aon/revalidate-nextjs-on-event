import { ethers } from "ethers";
import logger from "./logger";
import { getRequiredEnv } from "./utils/env";
import fs from "fs/promises";
import { parseApiPath } from "./utils/api";
import { getEventHash, getProvider } from "./utils/ethers";
import axios from "axios";
import { Config } from "./interfaces/config";
import { Abi } from "./interfaces/abi";

const main = async () => {
  logger.info("Initializing");

  logger.info("Reading revalidate token");
  const REVALIDATE_TOKEN = getRequiredEnv("REVALIDATE_TOKEN");

  logger.info("Reading config file");
  const rawConfig = await fs.readFile(
    `${process.cwd()}/config/config.json`,
    "utf-8"
  );
  const config = JSON.parse(rawConfig) as Config;

  logger.info("Loading provider");
  const provider = getProvider(config.provider);

  for (const event of config.events) {
    logger.info(
      {
        signature: event.signature,
        contract: event.contract.name,
        address: event.contract.address,
      },
      "Listening to event"
    );

    const rawAbiFile = await fs.readFile(
      `${process.cwd()}/abi/${event.contract.name}.json`,
      "utf-8"
    );
    const abiFile = JSON.parse(rawAbiFile) as Abi;
    const contract = new ethers.Contract(
      event.contract.address,
      abiFile.abi,
      provider
    );

    contract.on(
      { topics: [getEventHash(event.signature)] },
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      async (...args) => {
        const eventArgs = args.slice(0, -1);
        const apiPath = parseApiPath(event.api.path, eventArgs);

        logger.info(
          {
            signature: event.signature,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            args: eventArgs.map((arg) => arg.toString()),
            contract: event.contract.name,
            address: event.contract.address,
            apiPath,
          },
          "Event triggered"
        );

        try {
          await axios.post(event.api.url, {
            secret: REVALIDATE_TOKEN,
            path: apiPath,
          });
        } catch (error) {
          logger.error(
            { error, url: event.api.url, path: apiPath },
            "Unable to post revalidate request to api"
          );
        }
      }
    );
  }
};

main()
  .then()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
