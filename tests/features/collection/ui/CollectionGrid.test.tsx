import { act, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";

vi.mock("../../../../src/shared/ui", () => ({
  GifCard: ({ entry }: { entry: { number: number } }) => <article>{`GIF ${entry.number}`}</article>,
}));

import { CollectionGrid } from "../../../../src/features/collection/ui/CollectionGrid";
import type { CollectionGifEntry } from "../../../../src/features/collection/domain";

type MockObserverEntry = {
  isIntersecting: boolean;
  intersectionRatio: number;
};

const observerInstances: MockIntersectionObserver[] = [];

class MockIntersectionObserver {
  callback: IntersectionObserverCallback;

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
    observerInstances.push(this);
  }

  disconnect() {}

  observe() {}

  unobserve() {}

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }

  trigger(entry: MockObserverEntry) {
    this.callback([entry as IntersectionObserverEntry], this as unknown as IntersectionObserver);
  }
}

const createGif = (number: number): CollectionGifEntry => ({
  number,
  path: `/collections/test/#${number}-gif-${number}.gif`,
  name: `GIF ${number}`,
  collection: "test",
  rarity: "common",
  count: 1,
  unlockedAt: number,
  isFavorite: false,
});

describe("CollectionGrid", () => {
  beforeEach(() => {
    observerInstances.length = 0;
    Object.defineProperty(globalThis, "IntersectionObserver", {
      configurable: true,
      writable: true,
      value: MockIntersectionObserver,
    });
  });

  it("renders the collection in batches and loads more when the sentinel is near", () => {
    const gifs = Array.from({ length: 120 }, (_, index) => createGif(index + 1));

    render(
      <CollectionGrid
        gifs={gifs}
        copiedEmbedFor={null}
        copiedShareFor={null}
        onSelectGif={() => undefined}
        onCardKeyDown={() => undefined}
        onToggleFavorite={() => undefined}
        onCopyEmbed={async () => undefined}
        onCopyShare={async () => undefined}
      />,
    );

    expect(screen.getAllByText(/GIF \d+/)).toHaveLength(48);

    act(() => {
      observerInstances[0]?.trigger({ isIntersecting: true, intersectionRatio: 1 });
    });

    expect(screen.getAllByText(/GIF \d+/)).toHaveLength(120);
  });

  it("resets the rendered batch when the filtered list changes", () => {
    const gifs = Array.from({ length: 120 }, (_, index) => createGif(index + 1));
    const { rerender } = render(
      <CollectionGrid
        gifs={gifs}
        copiedEmbedFor={null}
        copiedShareFor={null}
        onSelectGif={() => undefined}
        onCardKeyDown={() => undefined}
        onToggleFavorite={() => undefined}
        onCopyEmbed={async () => undefined}
        onCopyShare={async () => undefined}
      />,
    );

    act(() => {
      observerInstances[0]?.trigger({ isIntersecting: true, intersectionRatio: 1 });
    });

    expect(screen.getAllByText(/GIF \d+/)).toHaveLength(120);

    rerender(
      <CollectionGrid
        gifs={gifs.slice(0, 10)}
        copiedEmbedFor={null}
        copiedShareFor={null}
        onSelectGif={() => undefined}
        onCardKeyDown={() => undefined}
        onToggleFavorite={() => undefined}
        onCopyEmbed={async () => undefined}
        onCopyShare={async () => undefined}
      />,
    );

    expect(screen.getAllByText(/GIF \d+/)).toHaveLength(10);
  });
});
