import { CollectionFilters } from './CollectionFilters'
import { CollectionGrid } from './CollectionGrid'
import { CollectionHeader } from './CollectionHeader'
import { CollectionModal } from './CollectionModal'
import { useCollectionViewModel } from '../application/useCollectionViewModel'
import * as styles from './collection.css'

export function MyCollectionPageView() {
  const viewModel = useCollectionViewModel()

  return (
    <main className={styles.page}>
      <section className={styles.container}>
        <CollectionHeader
          unlockedSummary={viewModel.unlockedSummary}
          canExport={viewModel.sortedUnlockedGifs.length > 0}
          isTransferPending={viewModel.isTransferPending}
          transferStatus={viewModel.transferStatus}
          importInputRef={viewModel.importInputRef}
          onExport={() => void viewModel.handleExportCollection()}
          onImportButtonClick={viewModel.triggerImportDialog}
          onImportFileChange={(event) => void viewModel.handleImportStegoGif(event)}
        />

        {viewModel.sortedUnlockedGifs.length > 0 ? (
          <CollectionFilters
            showFavoritesOnly={viewModel.showFavoritesOnly}
            collectionDropdownValue={viewModel.collectionDropdownValue}
            rarityDropdownValue={viewModel.rarityDropdownValue}
            availableCollections={viewModel.availableCollections}
            availableRarities={viewModel.availableRarities}
            collectionFilters={viewModel.collectionFilters}
            rarityFilters={viewModel.rarityFilters}
            onShowFavoritesOnlyChange={viewModel.setShowFavoritesOnly}
            onToggleCollectionFilter={viewModel.toggleCollectionFilter}
            onToggleRarityFilter={viewModel.toggleRarityFilter}
            onClearCollectionFilters={() => viewModel.setCollectionFilters([])}
            onClearRarityFilters={() => viewModel.setRarityFilters([])}
          />
        ) : null}

        {viewModel.sortedUnlockedGifs.length === 0 ? (
          <p className={styles.emptyState}>No unlocked GIFs yet. Scroll on the Home page to add some.</p>
        ) : viewModel.filteredUnlockedGifs.length === 0 ? (
          <p className={styles.emptyState}>No GIF matches the selected filters.</p>
        ) : (
          <CollectionGrid
            gifs={viewModel.filteredUnlockedGifs}
            copiedEmbedFor={viewModel.copiedEmbedFor}
            copiedShareFor={viewModel.copiedShareFor}
            onSelectGif={viewModel.openSelectedGif}
            onCardKeyDown={viewModel.handleCardKeyDown}
            onToggleFavorite={viewModel.toggleFavorite}
            onCopyEmbed={viewModel.handleCopyEmbed}
            onCopyShare={viewModel.handleCopyShareLink}
          />
        )}

        <CollectionModal selectedGif={viewModel.selectedGif} onClose={viewModel.closeSelectedGif} />
      </section>
    </main>
  )
}
