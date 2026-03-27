import { useEffect, useRef, useState, type CSSProperties } from "react";
import { encodeAssetPath } from "../../../lib/gifMeta";
import { isGifRarity, toGifRarityLabel } from "../../../lib/rarity";
import { clearBrowserTimeout } from "../../../shared/lib/browser";
import { actionButton, rarityBorder } from "../../../shared/styles/recipes.css";
import { GifPreviewDialog, RarityBadge } from "../../../shared/ui";
import { useUnlockedGifsStore } from "../../collection/data/unlockedGifsStore";
import { useTradeUpViewModel } from "../application/useTradeUpViewModel";
import { TradeUpSelectionGrid } from "./TradeUpSelectionGrid";
import * as styles from "./tradeUp.css";

const withClassName = (...classes: Array<string | false | null | undefined>): string =>
  classes.filter((value): value is string => Boolean(value)).join(" ");

const TRADE_REVEAL_SUSPENSE_MS = 1100;

type RewardRevealPhase = "closed" | "suspense" | "preview";

type ConfettiPieceStyle = CSSProperties & {
  "--confetti-x": string;
  "--confetti-y": string;
  "--confetti-rotate": string;
  "--confetti-delay": string;
  "--confetti-color": string;
};

const CONFETTI_STYLES: ConfettiPieceStyle[] = [
  {
    "--confetti-x": "-190px",
    "--confetti-y": "-180px",
    "--confetti-rotate": "-240deg",
    "--confetti-delay": "0ms",
    "--confetti-color": "#f6c56f",
  },
  {
    "--confetti-x": "-138px",
    "--confetti-y": "-132px",
    "--confetti-rotate": "180deg",
    "--confetti-delay": "40ms",
    "--confetti-color": "#5da8ff",
  },
  {
    "--confetti-x": "-224px",
    "--confetti-y": "-54px",
    "--confetti-rotate": "-120deg",
    "--confetti-delay": "70ms",
    "--confetti-color": "#55d091",
  },
  {
    "--confetti-x": "-172px",
    "--confetti-y": "34px",
    "--confetti-rotate": "220deg",
    "--confetti-delay": "110ms",
    "--confetti-color": "#f87171",
  },
  {
    "--confetti-x": "-104px",
    "--confetti-y": "126px",
    "--confetti-rotate": "-180deg",
    "--confetti-delay": "145ms",
    "--confetti-color": "#fde68a",
  },
  {
    "--confetti-x": "-18px",
    "--confetti-y": "-210px",
    "--confetti-rotate": "260deg",
    "--confetti-delay": "35ms",
    "--confetti-color": "#c789ff",
  },
  {
    "--confetti-x": "-34px",
    "--confetti-y": "148px",
    "--confetti-rotate": "-180deg",
    "--confetti-delay": "165ms",
    "--confetti-color": "#f59e0b",
  },
  {
    "--confetti-x": "52px",
    "--confetti-y": "-196px",
    "--confetti-rotate": "200deg",
    "--confetti-delay": "80ms",
    "--confetti-color": "#93c5fd",
  },
  {
    "--confetti-x": "120px",
    "--confetti-y": "-120px",
    "--confetti-rotate": "-230deg",
    "--confetti-delay": "120ms",
    "--confetti-color": "#34d399",
  },
  {
    "--confetti-x": "204px",
    "--confetti-y": "-66px",
    "--confetti-rotate": "180deg",
    "--confetti-delay": "55ms",
    "--confetti-color": "#fb7185",
  },
  {
    "--confetti-x": "178px",
    "--confetti-y": "28px",
    "--confetti-rotate": "-210deg",
    "--confetti-delay": "145ms",
    "--confetti-color": "#fbbf24",
  },
  {
    "--confetti-x": "126px",
    "--confetti-y": "118px",
    "--confetti-rotate": "240deg",
    "--confetti-delay": "180ms",
    "--confetti-color": "#60a5fa",
  },
  {
    "--confetti-x": "34px",
    "--confetti-y": "166px",
    "--confetti-rotate": "-170deg",
    "--confetti-delay": "95ms",
    "--confetti-color": "#4ade80",
  },
  {
    "--confetti-x": "-246px",
    "--confetti-y": "102px",
    "--confetti-rotate": "210deg",
    "--confetti-delay": "130ms",
    "--confetti-color": "#e879f9",
  },
];

const toStatusClassName = (tone: "info" | "success" | "error") => {
  if (tone === "success") {
    return styles.statusSuccess;
  }

  if (tone === "error") {
    return styles.statusError;
  }

  return styles.statusInfo;
};

export function TradeUpPageView() {
  const scrollRootRef = useRef<HTMLElement | null>(null);
  const revealTimerRef = useRef<number | null>(null);
  const viewModel = useTradeUpViewModel();
  const favoriteByNumber = useUnlockedGifsStore((state) => state.favoriteByNumber);
  const toggleFavorite = useUnlockedGifsStore((state) => state.toggleFavorite);
  const [rewardRevealPhase, setRewardRevealPhase] = useState<RewardRevealPhase>("closed");
  const selectedRarityOption =
    viewModel.rarityOptions.find((option) => option.rarity === viewModel.selectedSourceRarity) ??
    null;
  const targetRarityLabel = viewModel.targetRarity
    ? toGifRarityLabel(viewModel.targetRarity)
    : "Unavailable";
  const lastReward = viewModel.lastTradeResult?.reward ?? null;

  useEffect(() => {
    revealTimerRef.current = clearBrowserTimeout(revealTimerRef.current);

    if (!viewModel.lastTradeResult) {
      setRewardRevealPhase("closed");
      return;
    }

    setRewardRevealPhase("suspense");
    revealTimerRef.current = window.setTimeout(() => {
      setRewardRevealPhase("preview");
    }, TRADE_REVEAL_SUSPENSE_MS);

    return () => {
      revealTimerRef.current = clearBrowserTimeout(revealTimerRef.current);
    };
  }, [viewModel.lastTradeResult]);

  useEffect(
    () => () => {
      revealTimerRef.current = clearBrowserTimeout(revealTimerRef.current);
    },
    [],
  );

  return (
    <main className={styles.page} ref={scrollRootRef}>
      <section className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Trade Up</h1>
          <p className={styles.subtitle}>
            Exchange five copies of the same rarity for one random GIF from the next rarity tier.
            Pick your source rarity, fill the five slots below, then confirm the trade.
          </p>
        </header>

        <section className={styles.panel} aria-label="Trade-up board">
          <div className={styles.controls}>
            <label className={styles.field}>
              <span className={styles.label}>Source rarity</span>
              <select
                className={styles.select}
                value={viewModel.selectedSourceRarity}
                onChange={(event) => {
                  if (isGifRarity(event.target.value)) {
                    viewModel.changeSourceRarity(event.target.value);
                  }
                }}
              >
                {viewModel.rarityOptions.map((option) => (
                  <option
                    key={option.rarity}
                    value={option.rarity}
                    disabled={option.isDisabled && option.rarity !== viewModel.selectedSourceRarity}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <div className={styles.summaryPill}>
              {viewModel.selectedGifNumbers.length}/5 selected
            </div>
            <div className={styles.summaryPill}>{targetRarityLabel} target</div>
          </div>

          <p className={styles.helperText}>
            {selectedRarityOption?.disableReason ??
              `You currently own ${viewModel.selectedTotalCount} ${viewModel.selectedSourceLabel.toLowerCase()} copies.`}
          </p>

          {viewModel.catalogError ? (
            <p className={withClassName(styles.statusMessage, styles.statusError)}>
              {viewModel.catalogError}
            </p>
          ) : null}

          {viewModel.status ? (
            <p
              className={withClassName(
                styles.statusMessage,
                toStatusClassName(viewModel.status.tone),
              )}
            >
              {viewModel.status.message}
            </p>
          ) : null}

          <div className={styles.tradeBoard}>
            <div className={styles.sourceColumn}>
              <p className={styles.boardLabel}>Source slots</p>
              <div className={styles.slotGrid}>
                {viewModel.selectedSlots.map((entry, index) =>
                  entry ? (
                    <button
                      key={`${entry.number}-${index}`}
                      type="button"
                      className={styles.slotButton}
                      aria-label={`Remove GIF #${entry.number} from trade-up slot ${index + 1}`}
                      onClick={() => viewModel.removeSelectedGifAt(index)}
                    >
                      <span className={styles.slotIndex}>Slot {index + 1}</span>
                      <img
                        className={styles.slotImage}
                        src={encodeAssetPath(entry.path)}
                        alt={`Selected GIF #${entry.number} in trade-up slot ${index + 1}`}
                      />
                      <div className={styles.slotMeta}>
                        <p className={styles.slotName}>
                          #{entry.number} {entry.name}
                        </p>
                        <p className={styles.slotDetails}>
                          {entry.collection} • <RarityBadge rarity={entry.rarity} />
                        </p>
                        <p className={styles.slotHint}>Click to remove this copy.</p>
                      </div>
                    </button>
                  ) : (
                    <div
                      key={`empty-${index}`}
                      className={withClassName(styles.slot, styles.slotEmpty)}
                    >
                      <span className={styles.slotIndex}>Slot {index + 1}</span>
                      <p className={styles.slotHint}>Choose a card below to fill this slot.</p>
                    </div>
                  ),
                )}
              </div>
            </div>

            <div className={styles.targetColumn}>
              <p className={styles.boardLabel}>Target reward</p>
              <div
                className={withClassName(
                  styles.targetSlot,
                  viewModel.targetRarity && rarityBorder[viewModel.targetRarity],
                )}
                data-rarity={viewModel.targetRarity ?? undefined}
              >
                <div className={styles.targetHeader}>
                  <span className={styles.slotIndex}>Random reward</span>
                  {viewModel.targetRarity ? <RarityBadge rarity={viewModel.targetRarity} /> : null}
                </div>

                {lastReward ? (
                  <>
                    <img
                      className={styles.targetImage}
                      src={encodeAssetPath(lastReward.path)}
                      alt=""
                      aria-hidden="true"
                    />
                    <p className={styles.targetName}>
                      #{lastReward.number} {lastReward.name}
                    </p>
                    <p className={styles.targetDetails}>
                      {lastReward.collection} • owned x{lastReward.count}
                    </p>
                  </>
                ) : (
                  <div className={styles.targetPlaceholder}>
                    <p className={styles.slotHint}>
                      Confirm the trade to reveal one random {targetRarityLabel.toLowerCase()} GIF.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className={styles.actionRow}>
            <button
              type="button"
              className={actionButton({ tone: "primary" })}
              disabled={!viewModel.canConfirmExchange}
              onClick={viewModel.confirmTradeUp}
            >
              Confirm exchange
            </button>
            <p className={styles.helperText}>
              Click a filled slot to remove it. Changing the source rarity resets the board.
            </p>
          </div>
        </section>

        <section className={styles.collectionSection} aria-label="Filtered collection">
          <div className={styles.collectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>{viewModel.selectedSourceLabel} collection</h2>
              <p className={styles.sectionText}>
                Showing only {viewModel.selectedSourceLabel.toLowerCase()} GIFs. Click a card to add
                one copy to the next open slot.
              </p>
            </div>
            <p className={styles.sectionText}>
              {viewModel.filteredUnlockedGifs.length} unique GIFs
            </p>
          </div>

          {viewModel.filteredUnlockedGifs.length === 0 ? (
            <p className={styles.emptyState}>
              You do not own any {viewModel.selectedSourceLabel.toLowerCase()} GIFs yet.
            </p>
          ) : (
            <TradeUpSelectionGrid
              gifs={viewModel.filteredUnlockedGifs}
              selectedCountsByNumber={viewModel.selectedCountsByNumber}
              visibilityRoot={scrollRootRef}
              onSelectGif={viewModel.addSelectedGif}
            />
          )}
        </section>
      </section>

      {rewardRevealPhase === "suspense" ? (
        <div
          className={styles.suspenseBackdrop}
          role="dialog"
          aria-modal="true"
          aria-label="Preparing trade-up reward"
        >
          <div className={styles.suspensePanel}>
            <div className={styles.suspenseLoaderShell} aria-hidden="true">
              <div className={styles.suspenseLoaderPulse} />
              <div className={styles.suspenseLoader} />
            </div>
            <h2 className={styles.suspenseTitle}>Reward incoming</h2>
            <p className={styles.suspenseText}>
              Recombining the five sacrificed GIF signals into a higher rarity pull.
            </p>
          </div>
        </div>
      ) : null}

      {viewModel.lastTradeResult && rewardRevealPhase === "preview" ? (
        <>
          <div className={styles.confettiOverlay} aria-hidden="true">
            {CONFETTI_STYLES.map((pieceStyle, index) => (
              <span key={index} className={styles.confettiPiece} style={pieceStyle} />
            ))}
          </div>

          <GifPreviewDialog
            entry={viewModel.lastTradeResult.reward}
            count={viewModel.lastTradeResult.rewardCount}
            isNew={viewModel.lastTradeResult.isNewReward}
            isFavorite={Boolean(favoriteByNumber[viewModel.lastTradeResult.reward.number])}
            favoriteLabels={{
              add: `Add GIF #${viewModel.lastTradeResult.reward.number} to favorites`,
              remove: `Remove GIF #${viewModel.lastTradeResult.reward.number} from favorites`,
            }}
            imageAlt={`Trade-up reward GIF #${viewModel.lastTradeResult.reward.number}`}
            dialogLabel={`Trade-up reward GIF #${viewModel.lastTradeResult.reward.number}`}
            onToggleFavorite={() => toggleFavorite(viewModel.lastTradeResult?.reward.number ?? 0)}
            onClose={() => setRewardRevealPhase("closed")}
          />
        </>
      ) : null}
    </main>
  );
}
