import dotenv from "dotenv";
dotenv.config();

import { Klass } from "./types";

export const CREDENTIALS = {
  EMAIL: process.env.EMAIL,
  PASSWORD: process.env.PASSWORD,
};

export const OFFSET_DAYS = 13;

export const CLASSES: Record<string, Klass> = {
  PILATES: {
    name: "Pilates",
    url: (date: string) =>
      `https://urbansportsclub.com/de/venues/yoga4all-mitte?date=${date}`,
    weekday: "Monday",
    time: "18:00—18:45",
  },
  FLAMENCO: {
    name: "Flamenco",
    url: (date: string) =>
      `https://urbansportsclub.com/de/venues/gloria-madas-prenzlauer-berg?date=${date}`,
    weekday: "Wednesday",
    time: "18:30—19:30",
  },
  POLE: {
    name: "Pole",
    url: (date: string) =>
      `https://urbansportsclub.com/de/venues/redlightdance-wedding-1?date=${date}`,
    weekday: "Thursday",
    time: "18:10—19:10",
  },
};
