import {
  useEffect,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type RefObject,
} from "react";
import { GifCard } from "../../../shared/ui";
import type { CollectionGifEntry } from "../../collection/domain";
import * as styles from "./tradeUp.css";

type TradeUpSelectionGridProps = {
  gifs: CollectionGifEntry[];
  selectedCountsByNumber: Record<number, number>;
  visibilityRoot?: RefObject<HTMLElement | null>;
  onSelectGif: (gif: CollectionGifEntry) => void;
};

const INITIAL_VISIBLE_GIFS = 48;
const LOAD_MORE_BATCH_SIZE = 72;
const LOAD_MORE_ROOT_MARGIN = "600px 0px";

const withClassName = (...classes: Array<string | false | null | undefined>): string =>
  classes.filter((value): value is string => Boolean(value)).join(" ");

export function TradeUpSelectionGrid({
  gifs,
  selectedCountsByNumber,
  visibilityRoot,
  onSelectGif,
}: TradeUpSelectionGridProps) {
  const [renderedCount, setRenderedCount] = useState(() =>
    Math.min(gifs.length, INITIAL_VISIBLE_GIFS),
  );
  const [loadMoreNode, setLoadMoreNode] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    setRenderedCount(Math.min(gifs.length, INITIAL_VISIBLE_GIFS));
  }, [gifs]);

  useEffect(() => {
    if (renderedCount >= gifs.length) {
      return;
    }

    if (!loadMoreNode || typeof IntersectionObserver === "undefined") {
      setRenderedCount(gifs.length);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (!entry?.isIntersecting) {
          return;
        }

        setRenderedCount((current) => Math.min(gifs.length, current + LOAD_MORE_BATCH_SIZE));
      },
      {
        root: visibilityRoot?.current ?? null,
        rootMargin: LOAD_MORE_ROOT_MARGIN,
      },
    );

    observer.observe(loadMoreNode);
    return () => {
      observer.disconnect();
    };
  }, [gifs.length, loadMoreNode, renderedCount, visibilityRoot]);

  const visibleGifs = gifs.slice(0, renderedCount);

  const handleCardKeyDown = (
    event: ReactKeyboardEvent<HTMLElement>,
    gif: CollectionGifEntry,
    canSelect: boolean,
  ) => {
    if (!canSelect || event.target !== event.currentTarget) {
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelectGif(gif);
    }
  };

  return (
    <>
      <div className={styles.grid}>
        {visibleGifs.map((gif) => {
          const selectedCount = selectedCountsByNumber[gif.number] ?? 0;
          const remainingCount = Math.max(0, gif.count - selectedCount);
          const canSelect = remainingCount > 0;

          return (
            <GifCard
              key={gif.number}
              entry={gif}
              className={withClassName(
                styles.gridCard,
                selectedCount > 0 && styles.gridCardSelected,
                !canSelect && styles.gridCardDisabled,
              )}
              count={gif.count}
              interactive
              interactiveLabel={`Add GIF #${gif.number} to trade-up slots`}
              isDisabled={!canSelect}
              activationMode="visible-only"
              visibilityRoot={visibilityRoot}
              onSelect={() => onSelectGif(gif)}
              onSelectKeyDown={(event) => handleCardKeyDown(event, gif, canSelect)}
              actions={
                <div className={styles.gridCardFooter}>
                  <span>{selectedCount > 0 ? `Selected ${selectedCount}` : "Ready"}</span>
                  <span>{remainingCount} left</span>
                </div>
              }
            />
          );
        })}
      </div>

      {renderedCount < gifs.length ? (
        <div className={styles.gridSentinel} ref={setLoadMoreNode} aria-hidden="true" />
      ) : null}
    </>
  );
}
