import * as styles from './scrollGame.css'

type ScrollHudProps = {
  attemptLabel: string
  hintText: string
  showCounter: boolean
  collectionIndex: number
}

export function ScrollHud({ attemptLabel, hintText, showCounter, collectionIndex }: ScrollHudProps) {
  return (
    <>
      <p className={styles.attempt}>{attemptLabel}</p>
      {showCounter ? <p className={styles.counter}>#{collectionIndex}</p> : null}
      <p className={styles.hint}>{hintText}</p>
    </>
  )
}
