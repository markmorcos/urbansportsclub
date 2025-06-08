import dotenv from "dotenv";
dotenv.config();

import { CREDENTIALS } from "./constants";
import { getConfig } from "./config";
import { runAll } from "./runner";

async function worker() {
  console.log("Starting worker...");
  const { successInterval, failureInterval } = getConfig();

  if (!CREDENTIALS.EMAIL || !CREDENTIALS.PASSWORD) {
    throw new Error("EMAIL and PASSWORD must be set");
  }

  while (true) {
    try {
      console.log("Worker iteration starting...");

      await runAll();

      await new Promise((resolve) => setTimeout(resolve, successInterval));
    } catch (error) {
      console.error("Error in worker iteration:", error);
      await new Promise((resolve) => setTimeout(resolve, failureInterval));
    }
  }
}

worker().catch(console.error);
