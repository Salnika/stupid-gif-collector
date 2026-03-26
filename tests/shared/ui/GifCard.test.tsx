import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vite-plus/test";
import { GifCard } from "../../../src/shared/ui/GifCard";

describe("GifCard", () => {
  const entry = {
    number: 12,
    path: "/collections/test/#12-card.gif",
    name: "Card",
    collection: "test",
    rarity: "legendary" as const,
  };

  it("renders metadata and rarity", () => {
    render(<GifCard entry={entry} count={2} />);

    expect(screen.getByText("#12")).toBeTruthy();
    expect(screen.getByText("Card")).toBeTruthy();
    expect(screen.getByText("Collection: test")).toBeTruthy();
    expect(screen.getByText("Legendary")).toBeTruthy();
    expect(screen.getByText("x2")).toBeTruthy();
    expect(screen.getByAltText("GIF #12").getAttribute("loading")).toBe("lazy");
    expect(screen.getByAltText("GIF #12").getAttribute("decoding")).toBe("async");
  });

  it("falls back to a plain article when refraction support is unavailable", () => {
    render(<GifCard entry={entry} />);

    expect(screen.getByAltText("GIF #12").closest("article")?.getAttribute("data-refractive")).toBe(
      "fallback",
    );
  });

  it("triggers favorite callback", () => {
    const onToggleFavorite = vi.fn();

    render(
      <GifCard
        entry={entry}
        isFavorite={false}
        favoriteLabels={{ add: "add", remove: "remove" }}
        onToggleFavorite={onToggleFavorite}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "add" }));

    expect(onToggleFavorite).toHaveBeenCalledTimes(1);
  });
});
