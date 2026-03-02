import { Link, useParams } from 'react-router-dom'
import { actionButton } from '../../../shared/styles/recipes.css'
import { useSharedGifEntry } from '../application/useSharedGifEntry'
import { SharedGifCard } from './SharedGifCard'
import * as styles from './share.css'

export function SharedGifPageView() {
  const { gifNumber } = useParams()
  const { isLoading, entry } = useSharedGifEntry(gifNumber)

  return (
    <main className={styles.page}>
      <section className={styles.container}>
        {isLoading ? <p className={styles.state}>Loading GIF...</p> : null}

        {!isLoading && entry ? <SharedGifCard entry={entry} /> : null}

        {!isLoading && !entry ? (
          <div className={styles.stateBlock}>
            <p className={styles.state}>No GIF found for this link.</p>
            <Link className={actionButton({ tone: 'secondary' })} to="/">
              Go Home
            </Link>
          </div>
        ) : null}
      </section>
    </main>
  )
}
