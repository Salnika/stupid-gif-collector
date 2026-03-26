import { refractive } from "@hashintel/refractive";
import {
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type ReactNode,
  type RefObject,
} from "react";
import { useUiPreferencesStore } from "../data/uiPreferencesStore";
import { supportsRefractiveSurface } from "./refractiveSupport";

type RefractionConfig = {
  radius: number;
  blur: number;
  bezelWidth: number;
  glassThickness: number;
  refractiveIndex: number;
  specularOpacity: number;
};

export type RefractiveActivationMode = "always" | "visible-only";

type SurfaceVisibilityProps = {
  activationMode?: RefractiveActivationMode;
  visibilityRoot?: RefObject<HTMLElement | null>;
};

const cardRefraction: RefractionConfig = {
  radius: 14,
  blur: 4,
  bezelWidth: 18,
  glassThickness: 50,
  refractiveIndex: 10,
  specularOpacity: 1,
};

const VISIBLE_ROOT_MARGIN = "400px 0px";

const observedSurfaceWrapperStyle = {
  display: "block",
  width: "100%",
} as const;

type RefractiveArticleProps = ComponentPropsWithoutRef<"article"> &
  SurfaceVisibilityProps & {
    children: ReactNode;
    refraction?: Partial<RefractionConfig>;
  };

type RefractiveDivProps = ComponentPropsWithoutRef<"div"> &
  SurfaceVisibilityProps & {
    children: ReactNode;
    refraction?: Partial<RefractionConfig>;
  };

const resolveRefraction = (refraction?: Partial<RefractionConfig>): RefractionConfig => ({
  ...cardRefraction,
  ...refraction,
});

const useVisibleActivation = (
  activationMode: RefractiveActivationMode,
  visibilityRoot: RefObject<HTMLElement | null> | undefined,
  canUseRefractive: boolean,
) => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [isNearViewport, setIsNearViewport] = useState(activationMode !== "visible-only");

  useEffect(() => {
    if (activationMode !== "visible-only" || !canUseRefractive) {
      setIsNearViewport(true);
      return;
    }

    const wrapper = wrapperRef.current;
    if (!wrapper || typeof IntersectionObserver === "undefined") {
      setIsNearViewport(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        setIsNearViewport(Boolean(entry?.isIntersecting || (entry?.intersectionRatio ?? 0) > 0));
      },
      {
        root: visibilityRoot?.current ?? null,
        rootMargin: VISIBLE_ROOT_MARGIN,
      },
    );

    observer.observe(wrapper);

    return () => {
      observer.disconnect();
    };
  }, [activationMode, canUseRefractive, visibilityRoot]);

  return {
    wrapperRef,
    isNearViewport,
  };
};

export function RefractiveArticle({
  children,
  refraction,
  activationMode = "always",
  visibilityRoot,
  ...props
}: RefractiveArticleProps) {
  const isLiquidGlassDisabled = useUiPreferencesStore((state) => state.isLiquidGlassDisabled);
  const resolvedRefraction = resolveRefraction(refraction);
  const canUseRefractive = !isLiquidGlassDisabled && supportsRefractiveSurface();
  const { wrapperRef, isNearViewport } = useVisibleActivation(
    activationMode,
    visibilityRoot,
    canUseRefractive,
  );

  const content =
    canUseRefractive && (activationMode === "always" || isNearViewport) ? (
      <refractive.article {...props} data-refractive="enabled" refraction={resolvedRefraction}>
        {children}
      </refractive.article>
    ) : (
      <article {...props} data-refractive="fallback">
        {children}
      </article>
    );

  if (activationMode !== "visible-only" || !canUseRefractive) {
    return content;
  }

  return (
    <div ref={wrapperRef} style={observedSurfaceWrapperStyle}>
      {content}
    </div>
  );
}

export function RefractiveDiv({
  children,
  refraction,
  activationMode = "always",
  visibilityRoot,
  ...props
}: RefractiveDivProps) {
  const isLiquidGlassDisabled = useUiPreferencesStore((state) => state.isLiquidGlassDisabled);
  const resolvedRefraction = resolveRefraction(refraction);
  const canUseRefractive = !isLiquidGlassDisabled && supportsRefractiveSurface();
  const { wrapperRef, isNearViewport } = useVisibleActivation(
    activationMode,
    visibilityRoot,
    canUseRefractive,
  );

  const content =
    canUseRefractive && (activationMode === "always" || isNearViewport) ? (
      <refractive.div {...props} data-refractive="enabled" refraction={resolvedRefraction}>
        {children}
      </refractive.div>
    ) : (
      <div {...props} data-refractive="fallback">
        {children}
      </div>
    );

  if (activationMode !== "visible-only" || !canUseRefractive) {
    return content;
  }

  return (
    <div ref={wrapperRef} style={observedSurfaceWrapperStyle}>
      {content}
    </div>
  );
}
