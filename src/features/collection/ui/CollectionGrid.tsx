import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type RefObject,
} from "react";
import { encodeAssetPath } from "../../../lib/gifMeta";
import { actionButton } from "../../../shared/styles/recipes.css";
import { GifCard } from "../../../shared/ui";
import type { CollectionGifEntry } from "../domain";
import * as styles from "./collection.css";

type CollectionGridProps = {
  gifs: CollectionGifEntry[];
  visibilityRoot?: RefObject<HTMLElement | null>;
  copiedEmbedFor: number | null;
  copiedShareFor: number | null;
  onSelectGif: (gif: CollectionGifEntry) => void;
  onCardKeyDown: (event: ReactKeyboardEvent<HTMLElement>, gif: CollectionGifEntry) => void;
  onToggleFavorite: (gifNumber: number) => void;
  onCopyEmbed: (gif: CollectionGifEntry) => Promise<void>;
  onCopyShare: (gif: CollectionGifEntry) => Promise<void>;
};

const INITIAL_VISIBLE_GIFS = 48;
const LOAD_MORE_BATCH_SIZE = 72;
const LOAD_MORE_ROOT_MARGIN = "600px 0px";

const getDownloadFileName = (gif: CollectionGifEntry): string =>
  `${gif.number}-${gif.name.replace(/\s+/g, "-").toLowerCase()}.gif`;

export function CollectionGrid({
  gifs,
  visibilityRoot,
  copiedEmbedFor,
  copiedShareFor,
  onSelectGif,
  onCardKeyDown,
  onToggleFavorite,
  onCopyEmbed,
  onCopyShare,
}: CollectionGridProps) {
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const [renderedCount, setRenderedCount] = useState(() =>
    Math.min(gifs.length, INITIAL_VISIBLE_GIFS),
  );

  useEffect(() => {
    setRenderedCount(Math.min(gifs.length, INITIAL_VISIBLE_GIFS));
  }, [gifs]);

  useEffect(() => {
    if (renderedCount >= gifs.length) {
      return;
    }

    const loadMoreNode = loadMoreRef.current;
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
  }, [gifs.length, renderedCount, visibilityRoot]);

  const visibleGifs = gifs.slice(0, renderedCount);

  return (
    <>
      <div className={styles.grid}>
        {visibleGifs.map((gif) => (
          <GifCard
            key={gif.number}
            entry={gif}
            className={styles.uniformGifCard}
            count={gif.count}
            interactive
            activationMode="visible-only"
            visibilityRoot={visibilityRoot}
            isFavorite={gif.isFavorite}
            favoriteLabels={{
              add: `Add GIF #${gif.number} to favorites`,
              remove: `Remove GIF #${gif.number} from favorites`,
            }}
            onToggleFavorite={() => onToggleFavorite(gif.number)}
            onSelect={() => onSelectGif(gif)}
            onSelectKeyDown={(event) => onCardKeyDown(event, gif)}
            actions={
              <div
                className={styles.cardActions}
                onClick={(event) => event.stopPropagation()}
                onKeyDown={(event) => event.stopPropagation()}
              >
                <a
                  className={actionButton({ tone: "primary" })}
                  href={encodeAssetPath(gif.path)}
                  download={getDownloadFileName(gif)}
                >
                  Download
                </a>
                <button
                  type="button"
                  className={actionButton({ tone: "secondary" })}
                  onClick={() => void onCopyEmbed(gif)}
                >
                  {copiedEmbedFor === gif.number ? "Copied!" : "Copy embed"}
                </button>
                <button
                  type="button"
                  className={`${actionButton({ tone: "secondary" })} ${styles.shareButton}`}
                  onClick={() => void onCopyShare(gif)}
                >
                  {copiedShareFor === gif.number ? "Copied!" : "Share"}
                </button>
              </div>
            }
          />
        ))}
      </div>

      {renderedCount < gifs.length ? (
        <div className={styles.gridSentinel} ref={loadMoreRef} aria-hidden="true" />
      ) : null}
    </>
  );
}
