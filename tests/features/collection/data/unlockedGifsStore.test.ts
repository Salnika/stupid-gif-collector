import { beforeEach, describe, expect, it } from "vite-plus/test";
import {
  useUnlockedGifsStore,
  type RegisterCaughtGifInput,
  type UnlockedGif,
} from "../../../../src/features/collection/data/unlockedGifsStore";

const createUnlockedGif = (
  number: number,
  rarity: UnlockedGif["rarity"],
  count: number,
): UnlockedGif => ({
  number,
  name: `GIF ${number}`,
  collection: `collection ${number}`,
  rarity,
  path: `/collections/test/%23${number}-gif-${number}.gif`,
  unlockedAt: number,
  count,
});

const createRewardGif = (
  number: number,
  rarity: RegisterCaughtGifInput["rarity"],
): RegisterCaughtGifInput => ({
  number,
  name: `Reward ${number}`,
  collection: `reward ${number}`,
  rarity,
  path: `/collections/rewards/%23${number}-reward-${number}.gif`,
});

describe("useUnlockedGifsStore tradeUpGifs", () => {
  beforeEach(async () => {
    localStorage.clear();
    useUnlockedGifsStore.setState({
      unlockedByNumber: {},
      favoriteByNumber: {},
    });
    await Promise.resolve(useUnlockedGifsStore.persist.clearStorage());
  });

  it("consumes duplicate source copies, removes emptied favorites, and increments an existing reward", () => {
    useUnlockedGifsStore.setState({
      unlockedByNumber: {
        1: createUnlockedGif(1, "common", 3),
        2: createUnlockedGif(2, "common", 2),
        20: createUnlockedGif(20, "uncommon", 1),
      },
      favoriteByNumber: {
        1: true,
      },
    });

    const result = useUnlockedGifsStore.getState().tradeUpGifs({
      consumedGifNumbers: [1, 1, 1, 2, 2],
      rewardGif: createRewardGif(20, "uncommon"),
    });

    expect(result).toMatchObject({
      rewardCount: 2,
      isNewReward: false,
      sourceRarity: "common",
      targetRarity: "uncommon",
    });
    expect(useUnlockedGifsStore.getState().unlockedByNumber[20]?.count).toBe(2);
    expect(useUnlockedGifsStore.getState().unlockedByNumber[1]).toBeUndefined();
    expect(useUnlockedGifsStore.getState().unlockedByNumber[2]).toBeUndefined();
    expect(useUnlockedGifsStore.getState().favoriteByNumber[1]).toBeUndefined();
  });

  it("adds a brand new reward entry when the target GIF was not owned yet", () => {
    useUnlockedGifsStore.setState({
      unlockedByNumber: {
        3: createUnlockedGif(3, "rare", 5),
      },
      favoriteByNumber: {},
    });

    const result = useUnlockedGifsStore.getState().tradeUpGifs({
      consumedGifNumbers: [3, 3, 3, 3, 3],
      rewardGif: createRewardGif(30, "epic"),
    });

    expect(result.isNewReward).toBe(true);
    expect(useUnlockedGifsStore.getState().unlockedByNumber[3]).toBeUndefined();
    expect(useUnlockedGifsStore.getState().unlockedByNumber[30]).toMatchObject({
      rarity: "epic",
      count: 1,
    });
  });

  it("rejects trade-ups that mix source rarities", () => {
    useUnlockedGifsStore.setState({
      unlockedByNumber: {
        1: createUnlockedGif(1, "common", 4),
        2: createUnlockedGif(2, "uncommon", 1),
      },
      favoriteByNumber: {},
    });

    expect(() =>
      useUnlockedGifsStore.getState().tradeUpGifs({
        consumedGifNumbers: [1, 1, 1, 1, 2],
        rewardGif: createRewardGif(99, "uncommon"),
      }),
    ).toThrow(/same rarity/i);
  });

  it("rejects trade-ups when the player does not have enough copies", () => {
    useUnlockedGifsStore.setState({
      unlockedByNumber: {
        7: createUnlockedGif(7, "common", 4),
      },
      favoriteByNumber: {},
    });

    expect(() =>
      useUnlockedGifsStore.getState().tradeUpGifs({
        consumedGifNumbers: [7, 7, 7, 7, 7],
        rewardGif: createRewardGif(70, "uncommon"),
      }),
    ).toThrow(/enough copies/i);
    expect(useUnlockedGifsStore.getState().unlockedByNumber[7]?.count).toBe(4);
  });

  it("rejects legendary source trades", () => {
    useUnlockedGifsStore.setState({
      unlockedByNumber: {
        8: createUnlockedGif(8, "legendary", 5),
      },
      favoriteByNumber: {},
    });

    expect(() =>
      useUnlockedGifsStore.getState().tradeUpGifs({
        consumedGifNumbers: [8, 8, 8, 8, 8],
        rewardGif: createRewardGif(80, "legendary"),
      }),
    ).toThrow(/legendary/i);
  });
});
