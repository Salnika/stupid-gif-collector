export const DAILY_PACK_COUNT = 10;
export const GIFS_PER_DAILY_PACK = 5;
export const PACK_GENERATION_INTERVAL_MS = 5 * 60 * 1000;
export const GOLD_PACK_CHANCE = 1 / 20;

export type DailyPackStatus = "sealed" | "opened";
export type DailyPackVariant = "standard" | "gold";

export type DailyPackRevealResult = {
  number: number;
  count: number;
  isNew: boolean;
};

export type DailyPack = {
  id: number;
  variant: DailyPackVariant;
  gifNumbers: number[];
  status: DailyPackStatus;
  openedAt: number | null;
  revealResults: DailyPackRevealResult[];
};

export const isGoldDailyPack = (pack: { variant: DailyPackVariant }): boolean =>
  pack.variant === "gold";

export type DailyPackSession = {
  lastGeneratedAt: number;
  nextPackId: number;
  selectedPackId: number;
  packs: DailyPack[];
};
