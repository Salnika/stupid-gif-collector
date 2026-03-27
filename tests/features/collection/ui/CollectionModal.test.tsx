import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vite-plus/test";
import { CollectionModal } from "../../../../src/features/collection/ui/CollectionModal";

describe("CollectionModal", () => {
  const selectedGif = {
    number: 42,
    path: "/collections/test/%2342-gif-42.gif",
    name: "GIF 42",
    collection: "test",
    rarity: "rare" as const,
    count: 3,
    unlockedAt: 42,
    isFavorite: false,
  };

  it("renders the shared preview dialog with icon actions", () => {
    const onToggleFavorite = vi.fn();
    const onClose = vi.fn();

    render(
      <CollectionModal
        selectedGif={selectedGif}
        onClose={onClose}
        onToggleFavorite={onToggleFavorite}
      />,
    );

    expect(screen.getByRole("dialog", { name: /gif #42/i })).toBeTruthy();
    expect(screen.getByRole("link", { name: /download gif #42/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /copy share link for gif #42/i })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /add gif #42 to favorites/i }));

    expect(onToggleFavorite).toHaveBeenCalledWith(42);
  });
});
