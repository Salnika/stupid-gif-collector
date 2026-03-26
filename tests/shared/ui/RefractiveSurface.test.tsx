import { act, render, screen } from "@testing-library/react";
import type { ComponentPropsWithoutRef } from "react";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { useUiPreferencesStore } from "../../../src/shared/data/uiPreferencesStore";
import { RefractiveArticle } from "../../../src/shared/ui/RefractiveSurface";
import { resetRefractiveSurfaceSupportCache } from "../../../src/shared/ui/refractiveSupport";

vi.mock("@hashintel/refractive", () => ({
  refractive: {
    article: ({ children, ...props }: ComponentPropsWithoutRef<"article">) => (
      <article {...props}>{children}</article>
    ),
    div: ({ children, ...props }: ComponentPropsWithoutRef<"div">) => (
      <div {...props}>{children}</div>
    ),
  },
}));

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

class MockResizeObserver {
  disconnect() {}

  observe() {}

  unobserve() {}
}

class MockImageData {}

describe("RefractiveSurface", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    useUiPreferencesStore.setState({ isLiquidGlassDisabled: false });
    resetRefractiveSurfaceSupportCache();
    observerInstances.length = 0;

    Object.defineProperty(globalThis, "IntersectionObserver", {
      configurable: true,
      writable: true,
      value: MockIntersectionObserver,
    });
    Object.defineProperty(globalThis, "ResizeObserver", {
      configurable: true,
      writable: true,
      value: MockResizeObserver,
    });
    Object.defineProperty(globalThis, "ImageData", {
      configurable: true,
      writable: true,
      value: MockImageData,
    });
    Object.defineProperty(globalThis, "CSS", {
      configurable: true,
      writable: true,
      value: {
        supports: () => true,
      },
    });
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      writable: true,
      value: vi.fn().mockReturnValue({
        matches: false,
        media: "",
        onchange: null,
        addEventListener() {},
        removeEventListener() {},
        addListener() {},
        removeListener() {},
        dispatchEvent: () => false,
      }),
    });
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
      {} as CanvasRenderingContext2D,
    );
  });

  it("uses the fallback outside the viewport and enables refraction when visible", () => {
    render(
      <RefractiveArticle activationMode="visible-only">
        <span>Card body</span>
      </RefractiveArticle>,
    );

    expect(screen.getByText("Card body").closest("article")?.getAttribute("data-refractive")).toBe(
      "fallback",
    );

    act(() => {
      observerInstances[0]?.trigger({ isIntersecting: true, intersectionRatio: 1 });
    });

    expect(screen.getByText("Card body").closest("article")?.getAttribute("data-refractive")).toBe(
      "enabled",
    );

    act(() => {
      observerInstances[0]?.trigger({ isIntersecting: false, intersectionRatio: 0 });
    });

    expect(screen.getByText("Card body").closest("article")?.getAttribute("data-refractive")).toBe(
      "fallback",
    );
  });
});
