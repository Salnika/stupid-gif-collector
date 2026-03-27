import { GifPreviewDialog } from "../../../shared/ui";
import type { CollectionGifEntry } from "../domain";

type CollectionModalProps = {
  selectedGif: CollectionGifEntry | null;
  onClose: () => void;
  onToggleFavorite: (gifNumber: number) => void;
};

export function CollectionModal({ selectedGif, onClose, onToggleFavorite }: CollectionModalProps) {
  if (!selectedGif) {
    return null;
  }

  return (
    <GifPreviewDialog
      entry={selectedGif}
      count={selectedGif.count}
      isFavorite={selectedGif.isFavorite}
      favoriteLabels={{
        add: `Add GIF #${selectedGif.number} to favorites`,
        remove: `Remove GIF #${selectedGif.number} from favorites`,
      }}
      onToggleFavorite={() => onToggleFavorite(selectedGif.number)}
      onClose={onClose}
    />
  );
}
