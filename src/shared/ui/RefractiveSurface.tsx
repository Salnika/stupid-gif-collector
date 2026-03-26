import { refractive } from "@hashintel/refractive";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { useUiPreferencesStore } from "../data/uiPreferencesStore";

type RefractionConfig = {
  radius: number;
  blur: number;
  bezelWidth: number;
  glassThickness: number;
  refractiveIndex: number;
  specularOpacity: number;
};

const cardRefraction: RefractionConfig = {
  radius: 14,
  blur: 4,
  bezelWidth: 18,
  glassThickness: 50,
  refractiveIndex: 10,
  specularOpacity: 1,
};

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

const supportsRefractiveSurface = (): boolean => {
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

type RefractiveArticleProps = ComponentPropsWithoutRef<"article"> & {
  children: ReactNode;
  refraction?: Partial<RefractionConfig>;
};

type RefractiveDivProps = ComponentPropsWithoutRef<"div"> & {
  children: ReactNode;
  refraction?: Partial<RefractionConfig>;
};

const resolveRefraction = (refraction?: Partial<RefractionConfig>): RefractionConfig => ({
  ...cardRefraction,
  ...refraction,
});

export function RefractiveArticle({ children, refraction, ...props }: RefractiveArticleProps) {
  const isLiquidGlassDisabled = useUiPreferencesStore((state) => state.isLiquidGlassDisabled);
  const resolvedRefraction = resolveRefraction(refraction);

  if (isLiquidGlassDisabled || !supportsRefractiveSurface()) {
    return (
      <article {...props} data-refractive="fallback">
        {children}
      </article>
    );
  }

  return (
    <refractive.article {...props} data-refractive="enabled" refraction={resolvedRefraction}>
      {children}
    </refractive.article>
  );
}

export function RefractiveDiv({ children, refraction, ...props }: RefractiveDivProps) {
  const isLiquidGlassDisabled = useUiPreferencesStore((state) => state.isLiquidGlassDisabled);
  const resolvedRefraction = resolveRefraction(refraction);

  if (isLiquidGlassDisabled || !supportsRefractiveSurface()) {
    return (
      <div {...props} data-refractive="fallback">
        {children}
      </div>
    );
  }

  return (
    <refractive.div {...props} data-refractive="enabled" refraction={resolvedRefraction}>
      {children}
    </refractive.div>
  );
}
