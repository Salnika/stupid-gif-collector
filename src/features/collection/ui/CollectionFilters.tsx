import { toGifRarityLabel, type GifRarity } from '../../../lib/rarity'
import { actionButton, rarityText } from '../../../shared/styles/recipes.css'
import * as styles from './collection.css'

type CollectionFiltersProps = {
  showFavoritesOnly: boolean
  collectionDropdownValue: string
  rarityDropdownValue: string
  availableCollections: string[]
  availableRarities: GifRarity[]
  collectionFilters: string[]
  rarityFilters: GifRarity[]
  onShowFavoritesOnlyChange: (value: boolean) => void
  onToggleCollectionFilter: (collection: string) => void
  onToggleRarityFilter: (rarity: GifRarity) => void
  onClearCollectionFilters: () => void
  onClearRarityFilters: () => void
}

export function CollectionFilters({
  showFavoritesOnly,
  collectionDropdownValue,
  rarityDropdownValue,
  availableCollections,
  availableRarities,
  collectionFilters,
  rarityFilters,
  onShowFavoritesOnlyChange,
  onToggleCollectionFilter,
  onToggleRarityFilter,
  onClearCollectionFilters,
  onClearRarityFilters,
}: CollectionFiltersProps) {
  return (
    <section className={styles.filtersWrap} aria-label="Collection filters">
      <label className={styles.filterToggle}>
        <input
          type="checkbox"
          checked={showFavoritesOnly}
          onChange={(event) => onShowFavoritesOnlyChange(event.target.checked)}
        />
        <span>Favorites</span>
      </label>

      <label className={styles.filterField}>
        <span className={styles.filterLabel}>Collection</span>
        <details className={styles.multiSelect}>
          <summary className={styles.multiSelectTrigger}>{collectionDropdownValue}</summary>
          <div className={styles.multiSelectMenu}>
            <button
              type="button"
              className={actionButton({ tone: 'secondary' })}
              disabled={collectionFilters.length === 0}
              onClick={onClearCollectionFilters}
            >
              All
            </button>
            {availableCollections.map((collection) => (
              <label key={collection} className={styles.multiSelectOption}>
                <input
                  type="checkbox"
                  checked={collectionFilters.includes(collection)}
                  onChange={() => onToggleCollectionFilter(collection)}
                />
                <span>{collection}</span>
              </label>
            ))}
          </div>
        </details>
      </label>

      <label className={styles.filterField}>
        <span className={styles.filterLabel}>Rarity</span>
        <details className={styles.multiSelect}>
          <summary className={styles.multiSelectTrigger}>{rarityDropdownValue}</summary>
          <div className={styles.multiSelectMenu}>
            <button
              type="button"
              className={actionButton({ tone: 'secondary' })}
              disabled={rarityFilters.length === 0}
              onClick={onClearRarityFilters}
            >
              All
            </button>
            {availableRarities.map((rarity) => (
              <label key={rarity} className={styles.multiSelectOption}>
                <input
                  type="checkbox"
                  checked={rarityFilters.includes(rarity)}
                  onChange={() => onToggleRarityFilter(rarity)}
                />
                <span className={rarityText[rarity]}>{toGifRarityLabel(rarity)}</span>
              </label>
            ))}
          </div>
        </details>
      </label>
    </section>
  )
}
