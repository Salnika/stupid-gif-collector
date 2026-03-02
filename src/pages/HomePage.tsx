import { InfiniteScrollStage } from '../features/scroll-game/ui/InfiniteScrollStage'
import * as styles from '../features/scroll-game/ui/scrollGame.css'

export function HomePage() {
  return (
    <main className={styles.page}>
      <InfiniteScrollStage />
    </main>
  )
}
