let refractiveSupport: boolean | null = null;

const supportsBackdropFilter = (): boolean => {
  if (typeof CSS === "undefined" || typeof CSS.supports !== "function") {
    return true;
  }

  return (
    CSS.supports("backdrop-filter", "blur(0)") || CSS.supports("-webkit-backdrop-filter", "blur(0)")
  );
};

const prefersReducedTransparency = (): boolean => {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }

  return window.matchMedia("(prefers-reduced-transparency: reduce)").matches;
};

export const supportsRefractiveSurface = (): boolean => {
  if (refractiveSupport !== null) {
    return refractiveSupport;
  }

  if (
    typeof window === "undefined" ||
    typeof document === "undefined" ||
    typeof ResizeObserver === "undefined" ||
    typeof ImageData === "undefined" ||
    prefersReducedTransparency() ||
    !supportsBackdropFilter()
  ) {
    refractiveSupport = false;
    return refractiveSupport;
  }

  try {
    const context = document.createElement("canvas").getContext("2d");
    refractiveSupport = context !== null;
  } catch {
    refractiveSupport = false;
  }

  return refractiveSupport;
};

export const resetRefractiveSurfaceSupportCache = () => {
  refractiveSupport = null;
};
