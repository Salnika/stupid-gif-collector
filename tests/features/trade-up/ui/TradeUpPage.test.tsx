import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";

const { loadCatalogEntriesMock } = vi.hoisted(() => ({
  loadCatalogEntriesMock: vi.fn(),
}));

vi.mock("../../../../src/features/catalog/data", () => ({
  loadCatalogEntries: loadCatalogEntriesMock,
}));

import { TradeUpPageView } from "../../../../src/features/trade-up/ui/TradeUpPage";
import {
  useUnlockedGifsStore,
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

describe("TradeUpPageView", () => {
  beforeEach(async () => {
    vi.restoreAllMocks();
    localStorage.clear();
    loadCatalogEntriesMock.mockReset();
    useUnlockedGifsStore.setState({
      unlockedByNumber: {},
      favoriteByNumber: {},
    });
    await Promise.resolve(useUnlockedGifsStore.persist.clearStorage());
  });

  it("shows tradeable rarity options with total counts and disables impossible tiers", async () => {
    useUnlockedGifsStore.setState({
      unlockedByNumber: {
        1: createUnlockedGif(1, "common", 3),
        2: createUnlockedGif(2, "common", 2),
        3: createUnlockedGif(3, "uncommon", 4),
        4: createUnlockedGif(4, "rare", 5),
        5: createUnlockedGif(5, "epic", 6),
      },
      favoriteByNumber: {},
    });

    loadCatalogEntriesMock.mockResolvedValue([
      createUnlockedGif(100, "uncommon", 1),
      createUnlockedGif(200, "rare", 1),
      createUnlockedGif(300, "epic", 1),
    ]);

    render(<TradeUpPageView />);

    expect(await screen.findByRole("combobox")).toBeTruthy();
    expect((screen.getByRole("option", { name: "Common (5)" }) as HTMLOptionElement).disabled).toBe(
      false,
    );
    expect(
      (screen.getByRole("option", { name: "Uncommon (4)" }) as HTMLOptionElement).disabled,
    ).toBe(true);
    expect((screen.getByRole("option", { name: "Rare (5)" }) as HTMLOptionElement).disabled).toBe(
      false,
    );
    expect((screen.getByRole("option", { name: "Epic (6)" }) as HTMLOptionElement).disabled).toBe(
      true,
    );

    expect(screen.getByRole("heading", { name: /common collection/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /add gif #1 to trade-up slots/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /add gif #2 to trade-up slots/i })).toBeTruthy();
    expect(screen.queryByRole("button", { name: /add gif #3 to trade-up slots/i })).toBeNull();
  });

  it("fills slots, removes selections, respects counts, and confirms a trade-up", async () => {
    vi.spyOn(Math, "random").mockReturnValue(0);

    useUnlockedGifsStore.setState({
      unlockedByNumber: {
        1: createUnlockedGif(1, "common", 3),
        2: createUnlockedGif(2, "common", 2),
      },
      favoriteByNumber: {},
    });

    loadCatalogEntriesMock.mockResolvedValue([createUnlockedGif(100, "uncommon", 1)]);

    render(<TradeUpPageView />);

    const gifOneButton = await screen.findByRole("button", {
      name: /add gif #1 to trade-up slots/i,
    });
    const gifTwoButton = screen.getByRole("button", { name: /add gif #2 to trade-up slots/i });

    fireEvent.click(gifOneButton);
    fireEvent.click(screen.getByRole("button", { name: /remove gif #1 from trade-up slot 1/i }));

    await waitFor(() => {
      expect(
        screen.queryByRole("button", { name: /remove gif #1 from trade-up slot 1/i }),
      ).toBeNull();
    });

    fireEvent.click(gifOneButton);
    fireEvent.click(gifOneButton);
    fireEvent.click(gifOneButton);
    fireEvent.click(gifOneButton);
    fireEvent.click(gifTwoButton);
    fireEvent.click(gifTwoButton);

    await waitFor(() => {
      expect(screen.getAllByAltText(/selected gif #1 in trade-up slot/i)).toHaveLength(3);
      expect(screen.getAllByAltText(/selected gif #2 in trade-up slot/i)).toHaveLength(2);
    });

    fireEvent.click(screen.getByRole("button", { name: /confirm exchange/i }));

    await waitFor(() => {
      expect(screen.getByText(/trade complete/i)).toBeTruthy();
    });
    expect(screen.getByRole("dialog", { name: /preparing trade-up reward/i })).toBeTruthy();
    expect(
      await screen.findByRole("dialog", { name: /trade-up reward gif #100/i }, { timeout: 2500 }),
    ).toBeTruthy();
    expect(screen.getByAltText(/trade-up reward gif #100/i)).toBeTruthy();
    expect(useUnlockedGifsStore.getState().unlockedByNumber[100]?.count).toBe(1);
    expect(useUnlockedGifsStore.getState().unlockedByNumber[1]).toBeUndefined();
    expect(useUnlockedGifsStore.getState().unlockedByNumber[2]).toBeUndefined();
    expect(screen.getByText(/you do not own any common gifs yet/i)).toBeTruthy();
  });
});
