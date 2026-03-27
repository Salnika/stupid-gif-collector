import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";

const { loadCatalogEntriesMock } = vi.hoisted(() => ({
  loadCatalogEntriesMock: vi.fn(),
}));

vi.mock("../../src/features/catalog/data", () => ({
  loadCatalogEntries: loadCatalogEntriesMock,
  loadCatalogStats: vi.fn(),
  getEntryByNumber: vi.fn(),
  loadCatalogRuntime: vi.fn(),
  resetCatalogRepositoryCache: vi.fn(),
}));

import { AppRoutes } from "../../src/app/AppRoutes";
import { AppNavigation } from "../../src/components/AppNavigation";

describe("AppRoutes", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    loadCatalogEntriesMock.mockReset();
    loadCatalogEntriesMock.mockResolvedValue([]);
  });

  it("reaches the trade-up page from the dedicated route and keeps the main nav links", async () => {
    render(
      <MemoryRouter initialEntries={["/trade-up"]}>
        <AppNavigation />
        <AppRoutes />
      </MemoryRouter>,
    );

    expect(await screen.findByRole("heading", { name: /trade up/i })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Home" }).getAttribute("href")).toBe("/");
    expect(screen.getByRole("link", { name: "My collection" }).getAttribute("href")).toBe(
      "/my-collection",
    );
    expect(screen.getByRole("link", { name: "Trade up" }).getAttribute("href")).toBe("/trade-up");
  });
});
