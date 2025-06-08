import dotenv from "dotenv";
dotenv.config();

import { Environment, Config } from "./types";

const config: Record<Environment, Config> = {
  development: {
    successInterval: 5000,
    failureInterval: 5000,
    headless: false,
  },
  production: {
    successInterval: 86400000,
    failureInterval: 5000,
    headless: true,
  },
};

export const getConfig = (): Config => {
  if (!process.env.NODE_ENV) {
    throw new Error("NODE_ENV must be set");
  }

  return config[process.env.NODE_ENV as Environment];
};
