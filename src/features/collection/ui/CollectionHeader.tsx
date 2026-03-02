import type { ChangeEventHandler, RefObject } from 'react'
import { actionButton } from '../../../shared/styles/recipes.css'
import type { TransferStatus } from '../domain'
import * as styles from './collection.css'

type CollectionHeaderProps = {
  unlockedSummary: string
  canExport: boolean
  isTransferPending: boolean
  transferStatus: TransferStatus | null
  importInputRef: RefObject<HTMLInputElement | null>
  onExport: () => void
  onImportButtonClick: () => void
  onImportFileChange: ChangeEventHandler<HTMLInputElement>
}

const statusClassByTone = {
  info: styles.statusInfo,
  success: styles.statusSuccess,
  error: styles.statusError,
} as const

export function CollectionHeader({
  unlockedSummary,
  canExport,
  isTransferPending,
  transferStatus,
  importInputRef,
  onExport,
  onImportButtonClick,
  onImportFileChange,
}: CollectionHeaderProps) {
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>My collection</h1>
      <p className={styles.subtitle}>{unlockedSummary}</p>

      <div className={styles.transferRow}>
        <button
          type="button"
          className={actionButton({ tone: 'primary' })}
          disabled={isTransferPending || !canExport}
          onClick={onExport}
        >
          Export collection
        </button>
        <button
          type="button"
          className={actionButton({ tone: 'secondary' })}
          disabled={isTransferPending}
          onClick={onImportButtonClick}
        >
          Import collection
        </button>
        <input
          ref={importInputRef}
          type="file"
          accept=".gif,image/gif"
          hidden
          onChange={onImportFileChange}
        />
      </div>

      {transferStatus ? (
        <p className={`${styles.statusMessage} ${statusClassByTone[transferStatus.tone]}`}>
          {transferStatus.message}
        </p>
      ) : null}
    </header>
  )
}
