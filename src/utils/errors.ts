export function isQuotaError(err: unknown): boolean {
  if (err instanceof DOMException) {
    return err.name === 'QuotaExceededError' || err.code === 22
  }
  if (err instanceof Error) {
    return /quota/i.test(err.message)
  }
  return false
}

export function describeStorageError(err: unknown): string {
  return isQuotaError(err)
    ? 'Storage limit reached. Free up space or export your workspace before continuing.'
    : 'Something went wrong saving to local storage. Please try again.'
}
