import { useEffect, useRef, useState } from "react";
import type { GifCatalogEntry } from "../../features/catalog/domain";
import { encodeAssetPath } from "../../lib/gifMeta";
import { clearBrowserTimeout, restartTimeout } from "../lib/browser";
import { copyGifShareUrl } from "../services/shareService";
import { rarityBorder } from "../styles/recipes.css";
import { RefractiveDiv } from "./RefractiveSurface";
import { RarityBadge } from "./RarityBadge";
import * as styles from "./GifPreviewDialog.css";

type FavoriteLabels = {
  add: string;
  remove: string;
};

type GifPreviewDialogProps = {
  entry: GifCatalogEntry;
  count?: number;
  isNew?: boolean;
  isFavorite?: boolean;
  favoriteLabels: FavoriteLabels;
  imageAlt?: string;
  dialogLabel?: string;
  onToggleFavorite: () => void;
  onClose: () => void;
};

const SHARE_FEEDBACK_MS = 1200;

const getDownloadFileName = (entry: GifCatalogEntry): string =>
  `${entry.number}-${entry.name.replace(/\s+/g, "-").toLowerCase()}.gif`;

const withClassName = (...classes: Array<string | false | null | undefined>): string =>
  classes.filter((value): value is string => Boolean(value)).join(" ");

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.icon}>
      <path
        fill="currentColor"
        d="M12 3a1 1 0 0 1 1 1v8.59l2.3-2.3a1 1 0 1 1 1.4 1.42l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 0 1 1.4-1.42L11 12.59V4a1 1 0 0 1 1-1Zm-7 14a1 1 0 0 1 1 1v1h12v-1a1 1 0 1 1 2 0v2a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1Z"
      />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.icon}>
      <path
        fill="currentColor"
        d="M14 3a1 1 0 0 1 .7 1.71L12.41 7H14a6 6 0 1 1 0 12h-2a1 1 0 1 1 0-2h2a4 4 0 0 0 0-8h-1.59l2.3 2.29a1 1 0 0 1-1.42 1.42l-4-4a1 1 0 0 1 0-1.42l4-4A1 1 0 0 1 14 3Zm-4 4a1 1 0 0 1 0 2H8a4 4 0 0 0 0 8h1.59l-2.3-2.29a1 1 0 0 1 1.42-1.42l4 4a1 1 0 0 1 0 1.42l-4 4a1 1 0 1 1-1.42-1.42L9.59 19H8a6 6 0 0 1 0-12h2Z"
      />
    </svg>
  );
}

function StarIcon({ filled }: { filled: boolean }) {
  return filled ? (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.icon}>
      <path
        fill="currentColor"
        d="m12 2.6 2.82 5.72 6.32.92-4.57 4.46 1.08 6.3L12 17.04 6.35 20l1.08-6.3L2.86 9.24l6.32-.92L12 2.6Z"
      />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.icon}>
      <path
        fill="currentColor"
        d="m12 4.85-2.2 4.46a1 1 0 0 1-.75.55l-4.92.71 3.56 3.47a1 1 0 0 1 .29.88l-.84 4.9 4.4-2.31a1 1 0 0 1 .93 0l4.4 2.31-.84-4.9a1 1 0 0 1 .29-.88l3.56-3.47-4.92-.71a1 1 0 0 1-.75-.55L12 4.85Zm0-2.25a1 1 0 0 1 .9.56l2.82 5.72 6.32.92a1 1 0 0 1 .55 1.7l-4.57 4.46 1.08 6.3a1 1 0 0 1-1.45 1.05L12 20.3l-5.65 2.97A1 1 0 0 1 4.9 22.2l1.08-6.3L1.41 11.44a1 1 0 0 1 .55-1.7l6.32-.92L11.1 3.16a1 1 0 0 1 .9-.56Z"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.icon}>
      <path
        fill="currentColor"
        d="M6.7 5.3a1 1 0 0 1 1.4 0L12 9.17l3.9-3.88a1 1 0 0 1 1.4 1.42L13.42 10.6l3.88 3.9a1 1 0 0 1-1.42 1.4L12 12.02l-3.9 3.88a1 1 0 1 1-1.4-1.42l3.88-3.9L6.7 6.7a1 1 0 0 1 0-1.4Z"
      />
    </svg>
  );
}

export function GifPreviewDialog({
  entry,
  count,
  isNew = false,
  isFavorite = false,
  favoriteLabels,
  imageAlt,
  dialogLabel,
  onToggleFavorite,
  onClose,
}: GifPreviewDialogProps) {
  const shareResetTimerRef = useRef<number | null>(null);
  const [isShareCopied, setIsShareCopied] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      shareResetTimerRef.current = clearBrowserTimeout(shareResetTimerRef.current);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  const handleCopyShare = async () => {
    const copied = await copyGifShareUrl(entry.path);
    if (!copied) {
      return;
    }

    setIsShareCopied(true);
    shareResetTimerRef.current = restartTimeout(
      shareResetTimerRef.current,
      () => {
        setIsShareCopied(false);
      },
      SHARE_FEEDBACK_MS,
    );
  };

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <RefractiveDiv
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-label={dialogLabel ?? `GIF #${entry.number}`}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className={styles.closeButton}
          aria-label="Close preview"
          onClick={onClose}
        >
          <CloseIcon />
        </button>

        <div
          className={withClassName(styles.card, rarityBorder[entry.rarity])}
          data-rarity={entry.rarity}
        >
          <img
            className={styles.image}
            src={encodeAssetPath(entry.path)}
            alt={imageAlt ?? `GIF #${entry.number}`}
          />
          <div className={styles.body}>
            <div className={styles.topRow}>
              <p className={styles.number}>#{entry.number}</p>
              {count && count >= 2 ? <span className={styles.count}>x{count}</span> : null}
            </div>
            <p className={styles.name}>{entry.name}</p>
            <p className={styles.collection}>{entry.collection}</p>
            <div className={styles.footer}>
              <RarityBadge rarity={entry.rarity} />
              {isNew ? <span className={styles.newBadge}>New</span> : null}
            </div>
          </div>
        </div>

        <div className={styles.actionRow}>
          <a
            className={styles.iconActionButton}
            href={encodeAssetPath(entry.path)}
            download={getDownloadFileName(entry)}
            aria-label={`Download GIF #${entry.number}`}
            title="Download"
          >
            <DownloadIcon />
          </a>

          <button
            type="button"
            className={withClassName(
              styles.iconActionButton,
              isShareCopied && styles.iconActionButtonActive,
            )}
            aria-label={
              isShareCopied
                ? `Share link copied for GIF #${entry.number}`
                : `Copy share link for GIF #${entry.number}`
            }
            title={isShareCopied ? "Copied" : "Share"}
            onClick={() => void handleCopyShare()}
          >
            <ShareIcon />
          </button>

          <button
            type="button"
            className={withClassName(
              styles.iconActionButton,
              isFavorite && styles.iconActionButtonFavorite,
            )}
            aria-label={isFavorite ? favoriteLabels.remove : favoriteLabels.add}
            title={isFavorite ? "Favorite" : "Add to favorites"}
            onClick={onToggleFavorite}
          >
            <StarIcon filled={isFavorite} />
          </button>
        </div>
      </RefractiveDiv>
    </div>
  );
}
