export type Environment = "development" | "production";

export interface Config {
  successInterval: number;
  failureInterval: number;
  headless: boolean;
}

export interface Klass {
  url: (date: string) => string;
  weekday: string;
  time: string;
}
