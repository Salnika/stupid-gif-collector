import {
  startTransition,
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type WheelEvent as ReactWheelEvent,
} from "react";
import { useNavigate } from "react-router-dom";
import goldPack from "../../../assets/gold-pack.png";
import pack1 from "../../../assets/pack1.png";
import pack2 from "../../../assets/pack2.png";
import pack3 from "../../../assets/pack3.png";
import pack4 from "../../../assets/pack4.png";
import pack5 from "../../../assets/pack5.png";
import { InfiniteLoader } from "../../../components/InfiniteLoader";
import { PortalGlyphColumns } from "../../../components/PortalGlyphColumns";
import { useCoverAnchorPosition } from "../../../hooks/useCoverAnchorPosition";
import { useLoaderRotation } from "../../../hooks/useLoaderRotation";
import {
  useLenisInfiniteScroll,
  type InfiniteScrollUpdate,
} from "../../../hooks/useLenisInfiniteScroll";
import { getNextPackGenerationTime } from "../application/dailyPackSession";
import { loadManifest } from "../../catalog/data";
import type { GifCatalogEntry } from "../../catalog/domain";
import { useUnlockedGifsStore } from "../../collection/data/unlockedGifsStore";
import { useDailyPacksStore } from "../data/dailyPacksStore";
import { DAILY_PACK_COUNT, isGoldDailyPack, type DailyPack } from "../domain";
import { DailyPackOpeningDialog } from "./DailyPackOpeningDialog";
import * as styles from "./dailyPacks.css";

const PIXELS_PER_PACK = 320;
const BACKGROUND_SIZE = { width: 1920, height: 1229 };
const LOADER_ANCHOR = { x: 1125, y: 425 };
const PACK_ARTWORKS = [pack1, pack2, pack3, pack4, pack5];
const ORBIT_RADIUS_X = 260;
const ORBIT_RADIUS_Y = 176;

const toSealedIndex = (turnIndex: number, sealedCount: number): number => {
  if (sealedCount === 0) return 0;
  const normalized = ((turnIndex % sealedCount) + sealedCount) % sealedCount;
  return normalized;
};

const getSealedPackOffset = (
  sealedIndex: number,
  virtualTurns: number,
  sealedCount: number,
): number => {
  if (sealedCount === 0) return 0;
  let delta = sealedIndex - virtualTurns;
  const half = sealedCount / 2;

  if (delta > half) {
    delta -= sealedCount;
  } else if (delta < -half) {
    delta += sealedCount;
  }

  return delta;
};

const getPackArtwork = (pack: DailyPack): string =>
  isGoldDailyPack(pack) ? goldPack : PACK_ARTWORKS[(pack.id - 1) % PACK_ARTWORKS.length];

const getPackDisplayName = (pack: DailyPack): string =>
  isGoldDailyPack(pack) ? `Gold Pack ${pack.id}` : `Pack ${pack.id}`;

const formatCountdown = (timeRemainingMs: number): string => {
  const totalSeconds = Math.max(0, Math.ceil(timeRemainingMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${`${seconds}`.padStart(2, "0")}`;
};

type PackMaskStyle = CSSProperties & {
  "--pack-mask": string;
};

const getPackMaskStyle = (artwork: string): PackMaskStyle => ({
  "--pack-mask": `url("${artwork}")`,
});

const getPackOrbitState = (offset: number, totalCount: number) => {
  const count = Math.max(totalCount, 1);
  const angle = Math.PI / 2 + (offset / count) * Math.PI * 2;
  const x = Math.cos(angle) * ORBIT_RADIUS_X;
  const y = Math.sin(angle) * ORBIT_RADIUS_Y;
  const frontFactor = (Math.sin(angle) + 1) / 2;
  const scale = 0.5 + frontFactor * 0.62;
  const opacity = 0.28 + frontFactor * 0.72;
  const blur = (1 - frontFactor) * 3.6;
  const saturate = 0.62 + frontFactor * 0.58;
  const rotateZ = (x / ORBIT_RADIUS_X) * 11;
  const zIndex = 120 + Math.round(frontFactor * 120);

  return {
    transform: `translate(-50%, -50%) translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) scale(${scale.toFixed(3)}) rotateZ(${rotateZ.toFixed(2)}deg)`,
    opacity,
    filter: `blur(${blur.toFixed(2)}px) saturate(${saturate.toFixed(2)})`,
    zIndex,
  };
};

export function DailyPackHome() {
  const navigate = useNavigate();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const effectsRef = useRef<HTMLDivElement>(null);
  const turnsRef = useRef(0);
  const turnsOffsetRef = useRef(0);
  const alignedSessionKeyRef = useRef<string | null>(null);
  const selectedSealedIndexRef = useRef(0);
  const dialogOpenRef = useRef(false);
  const entryByNumberRef = useRef<Record<number, GifCatalogEntry>>({});

  const [catalogEntries, setCatalogEntries] = useState<GifCatalogEntry[]>([]);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const [virtualTurns, setVirtualTurns] = useState(0);
  const [dialogState, setDialogState] = useState<{
    packId: number;
    phase: "ready" | "opening";
  } | null>(null);

  const hasHydrated = useDailyPacksStore((state) => state.hasHydrated);
  const session = useDailyPacksStore((state) => state.session);
  const ensureTodaySession = useDailyPacksStore((state) => state.ensureTodaySession);
  const openPack = useDailyPacksStore((state) => state.openPack);
  const selectPack = useDailyPacksStore((state) => state.selectPack);
  const remainingPacks = useDailyPacksStore((state) => state.getRemainingPacks());

  const registerCaughtGif = useUnlockedGifsStore((state) => state.registerCaughtGif);

  const { handleLoaderUpdate } = useLoaderRotation(loaderRef, { effectsRef });

  const sealedPacks = useMemo(
    () => (session ? session.packs.filter((pack) => pack.status === "sealed") : []),
    [session],
  );

  const sealedCount = sealedPacks.length;
  const nextPackGenerationTime =
    session && remainingPacks < DAILY_PACK_COUNT ? getNextPackGenerationTime(session) : null;
  const nextPackCountdown =
    nextPackGenerationTime === null ? null : formatCountdown(nextPackGenerationTime - currentTime);

  useEffect(() => {
    let cancelled = false;

    const loadCatalog = async () => {
      try {
        const manifest = await loadManifest();
        if (cancelled) {
          return;
        }

        const nextEntries = Object.values(manifest.byNumber).sort(
          (left, right) => left.number - right.number,
        );
        const nextEntryByNumber: Record<number, GifCatalogEntry> = {};

        for (const entry of nextEntries) {
          nextEntryByNumber[entry.number] = entry;
        }

        startTransition(() => {
          entryByNumberRef.current = nextEntryByNumber;
          setCatalogEntries(nextEntries);
          setCatalogError(null);
        });
      } catch {
        if (!cancelled) {
          setCatalogError("Unable to load the GIF catalog right now.");
        }
      }
    };

    void loadCatalog();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hasHydrated || catalogEntries.length === 0) {
      return;
    }

    ensureTodaySession(catalogEntries);
  }, [catalogEntries, ensureTodaySession, hasHydrated]);

  useEffect(() => {
    if (!hasHydrated || catalogEntries.length === 0 || !session) {
      return;
    }

    const nextGenerationTime = getNextPackGenerationTime(session);
    if (nextGenerationTime === null) {
      return;
    }

    const timeoutId = window.setTimeout(
      () => {
        ensureTodaySession(catalogEntries, new Date());
      },
      Math.max(0, nextGenerationTime - Date.now()),
    );

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [catalogEntries, ensureTodaySession, hasHydrated, session]);

  useEffect(() => {
    if (nextPackGenerationTime === null) {
      return;
    }

    setCurrentTime(Date.now());

    const intervalId = window.setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [nextPackGenerationTime]);

  useEffect(() => {
    if (!session || sealedCount === 0) {
      return;
    }

    const sessionKey = `${session.lastGeneratedAt}:${session.nextPackId}:selected=${session.selectedPackId}`;
    const sealedKey = `${sessionKey}:sealed=${sealedCount}`;
    if (alignedSessionKeyRef.current === sealedKey) {
      return;
    }

    const initialSealedIndex = sealedPacks.findIndex((p) => p.id === session.selectedPackId);
    const sealedIdx = initialSealedIndex >= 0 ? initialSealedIndex : 0;
    turnsOffsetRef.current = sealedIdx - turnsRef.current;
    setVirtualTurns(sealedIdx);
    selectedSealedIndexRef.current = sealedIdx;
    if (sealedPacks[sealedIdx]) {
      selectPack(sealedPacks[sealedIdx].id);
    }
    alignedSessionKeyRef.current = sealedKey;
  }, [session, sealedPacks, sealedCount, selectPack]);

  useEffect(() => {
    dialogOpenRef.current = dialogState !== null;
  }, [dialogState]);

  function syncSelection(sealedIndex: number) {
    if (sealedIndex < 0 || sealedIndex >= sealedCount) return;
    turnsOffsetRef.current = sealedIndex - turnsRef.current;
    selectedSealedIndexRef.current = sealedIndex;
    setVirtualTurns(sealedIndex);
    selectPack(sealedPacks[sealedIndex].id);
  }

  const applyCarouselWheelDelta = useEffectEvent((deltaPixels: number) => {
    if (!Number.isFinite(deltaPixels) || deltaPixels === 0) {
      return;
    }

    if (dialogOpenRef.current || !session || sealedCount === 0) {
      return;
    }

    turnsOffsetRef.current += deltaPixels / PIXELS_PER_PACK;

    const nextVirtualTurns = turnsRef.current + turnsOffsetRef.current;
    const nextSealedIndex = toSealedIndex(Math.round(nextVirtualTurns), sealedCount);

    setVirtualTurns(nextVirtualTurns);
    handleLoaderUpdate({
      turns: nextVirtualTurns,
      direction: Math.sign(deltaPixels) as -1 | 0 | 1,
      velocity: deltaPixels,
      deltaPixels,
    });

    if (nextSealedIndex !== selectedSealedIndexRef.current) {
      selectedSealedIndexRef.current = nextSealedIndex;
      selectPack(sealedPacks[nextSealedIndex].id);
    }
  });

  function handleCarouselWheel(event: ReactWheelEvent<HTMLElement>) {
    event.preventDefault();
    event.stopPropagation();
    applyCarouselWheelDelta(event.deltaY);
  }

  const handleScrollUpdate = useEffectEvent((update: InfiniteScrollUpdate) => {
    if (dialogOpenRef.current || !session || sealedCount === 0) {
      return;
    }

    handleLoaderUpdate(update);
    turnsRef.current = update.turns;

    const nextVirtualTurns = update.turns + turnsOffsetRef.current;
    const nextSealedIndex = toSealedIndex(Math.round(nextVirtualTurns), sealedCount);

    setVirtualTurns(nextVirtualTurns);

    if (nextSealedIndex !== selectedSealedIndexRef.current) {
      selectedSealedIndexRef.current = nextSealedIndex;
      selectPack(sealedPacks[nextSealedIndex].id);
    }
  });

  useLenisInfiniteScroll({
    wrapperRef,
    contentRef,
    onUpdate: handleScrollUpdate,
    pixelsPerTurn: PIXELS_PER_PACK,
  });

  const loaderPosition = useCoverAnchorPosition({
    containerRef: wrapperRef,
    imageSize: BACKGROUND_SIZE,
    anchor: LOADER_ANCHOR,
  });

  function handleOpenPackDialog(pack: DailyPack) {
    dialogOpenRef.current = true;
    setDialogState({ packId: pack.id, phase: "ready" });
  }

  function handleConfirmOpenPack(packId: number) {
    const pack = session?.packs.find((candidate) => candidate.id === packId);
    if (!pack || pack.status === "opened") {
      return;
    }

    const revealResults = [];

    for (const number of pack.gifNumbers) {
      const entry = entryByNumberRef.current[number];
      if (!entry) {
        setCatalogError("A GIF from this pack is missing from the catalog metadata.");
        return;
      }

      const reward = registerCaughtGif({
        number: entry.number,
        name: entry.name,
        collection: entry.collection,
        rarity: entry.rarity,
        path: entry.path,
      });

      revealResults.push({
        number,
        count: reward.count,
        isNew: reward.isNew,
      });
    }

    openPack(pack.id, revealResults);
    dialogOpenRef.current = true;
    setDialogState({ packId: pack.id, phase: "opening" });
  }

  function handlePackActivate(packId: number) {
    if (!session || sealedCount === 0) {
      return;
    }

    const sealedIndex = sealedPacks.findIndex((p) => p.id === packId);
    if (sealedIndex < 0) return;

    if (sealedIndex !== selectedSealedIndexRef.current) {
      syncSelection(sealedIndex);
      return;
    }

    const pack = sealedPacks[sealedIndex];
    if (pack) {
      handleOpenPackDialog(pack);
    }
  }

  const activePack =
    session && sealedCount > 0
      ? (sealedPacks[selectedSealedIndexRef.current] ?? sealedPacks[0])
      : null;
  const dialogPack =
    dialogState && session
      ? (session.packs.find((candidate) => candidate.id === dialogState.packId) ?? null)
      : null;
  const queueLabel = "Rolling pack queue";

  return (
    <main className={styles.page}>
      <section className={styles.scrollStage} ref={wrapperRef}>
        <div className={styles.content} ref={contentRef} aria-hidden="true">
          <div className={styles.spacer} />
        </div>
      </section>

      <div className={styles.overlay} ref={effectsRef}>
        <div className={styles.stageGlow} />
        <PortalGlyphColumns />

        <div
          className={styles.loaderAnchor}
          style={{
            left: `${loaderPosition.x}px`,
            top: `${loaderPosition.y}px`,
          }}
        >
          <InfiniteLoader ref={loaderRef} />
        </div>

        {!hasHydrated || (catalogEntries.length === 0 && !catalogError) ? (
          <div className={styles.stateCard}>
            <h2 className={styles.stateTitle}>Loading pack queue</h2>
            <p className={styles.stateText}>
              The catalog is loading and your rolling pack queue is being restored.
            </p>
          </div>
        ) : null}

        {catalogError && !session ? (
          <div className={styles.stateCard}>
            <h2 className={styles.stateTitle}>Pack feed unavailable</h2>
            <p className={styles.stateText}>{catalogError}</p>
          </div>
        ) : null}

        {session && sealedCount > 0 ? (
          <>
            <div className={styles.carousel} onWheelCapture={handleCarouselWheel}>
              {sealedPacks.map((pack, sealedIndex) => {
                const offset = getSealedPackOffset(sealedIndex, virtualTurns, sealedCount);
                const isActive = activePack ? pack.id === activePack.id : false;
                const packArtwork = getPackArtwork(pack);
                const orbitState = getPackOrbitState(offset, sealedCount);

                return (
                  <button
                    key={pack.id}
                    type="button"
                    className={styles.packButton}
                    data-status={pack.status}
                    aria-current={isActive}
                    aria-label={`Select sealed ${getPackDisplayName(pack)}`}
                    onClick={() => handlePackActivate(pack.id)}
                    style={{
                      transform: orbitState.transform,
                      opacity: orbitState.opacity,
                      filter: orbitState.filter,
                      zIndex: `${orbitState.zIndex}`,
                    }}
                  >
                    <div className={styles.packFrame}>
                      <div className={styles.packVisual} style={getPackMaskStyle(packArtwork)}>
                        <img
                          className={styles.packArt}
                          src={packArtwork}
                          alt=""
                          aria-hidden="true"
                        />
                        <div className={styles.packTextureMetal} aria-hidden="true" />
                        <div className={styles.packTextureHolo} aria-hidden="true" />
                        <div className={styles.packTextureGloss} aria-hidden="true" />
                      </div>

                      <div className={styles.packFooter}>
                        <span className={styles.packBadge}>{getPackDisplayName(pack)}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        ) : session && sealedCount === 0 ? (
          <div className={styles.emptyCountdown}>
            <p className={styles.emptyCountdownLabel}>Next pack in</p>
            <p className={styles.emptyCountdownValue}>{nextPackCountdown ?? "0:00"}</p>
          </div>
        ) : null}
      </div>

      {dialogPack ? (
        <DailyPackOpeningDialog
          dayLabel={queueLabel}
          pack={dialogPack}
          packArtwork={getPackArtwork(dialogPack)}
          entriesByNumber={entryByNumberRef.current}
          animateOnOpen={dialogState?.phase === "opening"}
          remainingPacks={remainingPacks}
          onOpenPack={() => handleConfirmOpenPack(dialogPack.id)}
          onClose={() => {
            dialogOpenRef.current = false;
            setDialogState(null);
          }}
          onGoToCollection={() => navigate("/my-collection")}
        />
      ) : null}
    </main>
  );
}
