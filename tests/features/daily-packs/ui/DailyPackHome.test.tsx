import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { resetCatalogRepositoryCache } from "../../../../src/features/catalog/data";
import type { GifCatalogEntry } from "../../../../src/features/catalog/domain";
import { useUnlockedGifsStore } from "../../../../src/features/collection/data/unlockedGifsStore";
import { useDailyPacksStore } from "../../../../src/features/daily-packs/data/dailyPacksStore";
import { DailyPackHome } from "../../../../src/features/daily-packs/ui/DailyPackHome";

vi.mock("../../../../src/hooks/useLenisInfiniteScroll", () => ({
  useLenisInfiniteScroll: () => undefined,
}));

vi.mock("../../../../src/hooks/useLoaderRotation", () => ({
  useLoaderRotation: () => ({
    handleLoaderUpdate: () => undefined,
  }),
}));

const createManifest = (size: number) => {
  const byNumber: Record<number, GifCatalogEntry> = {};

  for (let index = 0; index < size; index += 1) {
    byNumber[index + 1] = {
      number: index + 1,
      path: `/collections/test/#${index + 1}-gif-${index + 1}.gif`,
      name: `GIF ${index + 1}`,
      collection: "test",
      rarity:
        index < 10
          ? (["rare", "epic", "legendary"][index % 3] as GifCatalogEntry["rarity"])
          : "common",
    };
  }

  return {
    total: size,
    byNumber,
  };
};

const createResponse = (payload: unknown): Response =>
  ({
    ok: true,
    json: async () => payload,
  }) as Response;

describe("DailyPackHome", () => {
  beforeEach(async () => {
    vi.restoreAllMocks();
    resetCatalogRepositoryCache();
    localStorage.clear();
    useDailyPacksStore.getState().resetForTests();
    await Promise.resolve(useDailyPacksStore.persist.clearStorage());
    useUnlockedGifsStore.setState({
      unlockedByNumber: {},
      favoriteByNumber: {},
    });
    localStorage.removeItem("stupid-vite-collect-unlocked-gifs");
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("opens the active pack and adds five GIFs to the collection", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(createResponse(createManifest(60)));

    render(
      <MemoryRouter>
        <DailyPackHome />
      </MemoryRouter>,
    );

    expect(await screen.findByRole("button", { name: /open this pack/i })).toBeTruthy();

    vi.useFakeTimers();

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /open this pack/i }));
    });

    expect(screen.getByRole("heading", { name: /pack 1 ready to open/i })).toBeTruthy();
    expect(Object.keys(useUnlockedGifsStore.getState().unlockedByNumber)).toHaveLength(0);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /click pack 1 to open/i }));
    });

    expect(screen.getByRole("heading", { name: /opening pack 1/i })).toBeTruthy();

    await act(async () => {
      vi.advanceTimersByTime(2800);
    });

    expect(screen.getByRole("heading", { name: /pack 1 opened/i })).toBeTruthy();
    expect(screen.getAllByRole("img", { name: /reward gif #/i })).toHaveLength(5);
    expect(Object.keys(useUnlockedGifsStore.getState().unlockedByNumber)).toHaveLength(5);
    expect(screen.getByText(/9 packs left today/i)).toBeTruthy();

    const [firstRewardButton] = screen.getAllByRole("button", { name: /open reward gif #/i });
    const rewardLabel =
      firstRewardButton.getAttribute("aria-label")?.replace(/^Open /i, "") ?? "Reward GIF";

    await act(async () => {
      fireEvent.click(firstRewardButton);
    });

    const rewardDialog = screen.getByRole("dialog", { name: new RegExp(rewardLabel, "i") });
    expect(rewardDialog).toBeTruthy();

    await act(async () => {
      fireEvent.click(within(rewardDialog).getByRole("button", { name: /^close$/i }));
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /back to packs/i }));
    });

    // After closing the dialog, the opened pack is removed from the carousel
    // and the next sealed pack becomes active
    expect(screen.getByRole("button", { name: /open this pack/i })).toBeTruthy();
    expect(screen.getByText(/9 packs left today/i)).toBeTruthy();
  });

  it("scrolls the carousel when wheeling over the interactive controls", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(createResponse(createManifest(60)));

    render(
      <MemoryRouter>
        <DailyPackHome />
      </MemoryRouter>,
    );

    expect(await screen.findByRole("button", { name: /open this pack/i })).toBeTruthy();
    expect(screen.getByText(/pack 1 is still sealed/i)).toBeTruthy();

    await act(async () => {
      fireEvent.wheel(screen.getByRole("button", { name: /open this pack/i }), { deltaY: 400 });
    });

    expect(screen.getByText(/pack 2 is still sealed/i)).toBeTruthy();
  });

  it("labels pack 10 as the gold pack", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(createResponse(createManifest(60)));

    render(
      <MemoryRouter>
        <DailyPackHome />
      </MemoryRouter>,
    );

    expect(await screen.findByRole("button", { name: /open this pack/i })).toBeTruthy();

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /select sealed gold pack 10/i }));
    });

    expect(screen.getByText(/gold pack 10 is still sealed/i)).toBeTruthy();
    expect(screen.getByText(/gold drop/i)).toBeTruthy();
  });
});
