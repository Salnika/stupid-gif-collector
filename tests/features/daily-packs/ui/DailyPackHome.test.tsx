import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { resetCatalogRepositoryCache } from "../../../../src/features/catalog/data";
import type { GifCatalogEntry } from "../../../../src/features/catalog/domain";
import { useUnlockedGifsStore } from "../../../../src/features/collection/data/unlockedGifsStore";
import { useDailyPacksStore } from "../../../../src/features/daily-packs/data/dailyPacksStore";
import { DailyPackHome } from "../../../../src/features/daily-packs/ui/DailyPackHome";
import { PACK_GENERATION_INTERVAL_MS } from "../../../../src/features/daily-packs/domain";

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
    vi.spyOn(Math, "random").mockReturnValue(0.5);
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

  it("opens the active pack and lets the user favorite a revealed reward", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(createResponse(createManifest(60)));

    render(
      <MemoryRouter>
        <DailyPackHome />
      </MemoryRouter>,
    );

    expect(await screen.findByRole("button", { name: /select sealed pack 1/i })).toBeTruthy();
    expect(screen.queryByText(/next pack in \d+:\d{2}/i)).toBeNull();
    vi.useFakeTimers();

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /select sealed pack 1/i }));
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

    const [firstRewardButton] = screen.getAllByRole("button", { name: /open reward gif #/i });
    const rewardLabel =
      firstRewardButton.getAttribute("aria-label")?.replace(/^Open /i, "") ?? "Reward GIF";
    const rewardMatch = rewardLabel.match(/#(\d+)/i);
    const rewardNumber = rewardMatch ? Number.parseInt(rewardMatch[1], 10) : NaN;

    await act(async () => {
      fireEvent.click(firstRewardButton);
    });

    const rewardDialog = screen.getByRole("dialog", { name: new RegExp(rewardLabel, "i") });
    expect(rewardDialog).toBeTruthy();

    await act(async () => {
      fireEvent.click(within(rewardDialog).getByRole("button", { name: /add to favorites/i }));
    });

    expect(useUnlockedGifsStore.getState().favoriteByNumber[rewardNumber]).toBe(true);

    await act(async () => {
      fireEvent.click(within(rewardDialog).getByRole("button", { name: /^close$/i }));
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /back to packs/i }));
    });

    expect(screen.getByText(/next pack in/i)).toBeTruthy();
    expect(screen.getByText(/\d+:\d{2}/i)).toBeTruthy();
  });

  it("adds a new pack to the queue after five minutes", async () => {
    const manifest = createManifest(60);
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(createResponse(manifest));

    render(
      <MemoryRouter>
        <DailyPackHome />
      </MemoryRouter>,
    );

    expect(await screen.findByRole("button", { name: /select sealed pack 1/i })).toBeTruthy();
    expect(screen.queryByText(/next pack in/i)).toBeNull();

    await act(async () => {
      const session = useDailyPacksStore.getState().session;
      useDailyPacksStore
        .getState()
        .ensureTodaySession(
          Object.values(manifest.byNumber),
          new Date((session?.lastGeneratedAt ?? Date.now()) + PACK_GENERATION_INTERVAL_MS),
        );
    });

    expect(screen.getByRole("button", { name: /select sealed pack 2/i })).toBeTruthy();
  });

  it("scrolls the carousel when wheeling over the interactive controls", async () => {
    const manifest = createManifest(60);
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(createResponse(manifest));

    render(
      <MemoryRouter>
        <DailyPackHome />
      </MemoryRouter>,
    );

    expect(await screen.findByRole("button", { name: /select sealed pack 1/i })).toBeTruthy();

    await act(async () => {
      const session = useDailyPacksStore.getState().session;
      useDailyPacksStore
        .getState()
        .ensureTodaySession(
          Object.values(manifest.byNumber),
          new Date((session?.lastGeneratedAt ?? Date.now()) + PACK_GENERATION_INTERVAL_MS),
        );
    });

    const packOneButton = screen.getByRole("button", { name: /select sealed pack 1/i });
    const packTwoButton = screen.getByRole("button", { name: /select sealed pack 2/i });

    expect(packOneButton.getAttribute("aria-current")).toBe("true");

    await act(async () => {
      fireEvent.wheel(packOneButton, { deltaY: 400 });
    });

    expect(packTwoButton.getAttribute("aria-current")).toBe("true");
  });
});
