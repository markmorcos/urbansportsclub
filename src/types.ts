export type Environment = "development" | "production";

export interface Config {
  successInterval: number;
  failureInterval: number;
  headless: boolean;
}

export interface Klass {
  name: string;
  url: (date: string) => string;
  weekday: string;
  time: string;
}
