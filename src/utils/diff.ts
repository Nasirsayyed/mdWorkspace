export type DiffOp = { type: 'equal' | 'add' | 'remove'; line: string }

export function diffLines(oldText: string, newText: string): DiffOp[] {
  const a = oldText.split('\n')
  const b = newText.split('\n')
  const n = a.length
  const m = b.length

  // Guard against pathological sizes for the O(n*m) LCS table.
  if (n * m > 4_000_000) {
    return [
      ...a.map((line): DiffOp => ({ type: 'remove', line })),
      ...b.map((line): DiffOp => ({ type: 'add', line })),
    ]
  }

  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0))
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1])
    }
  }

  const ops: DiffOp[] = []
  let i = 0
  let j = 0
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      ops.push({ type: 'equal', line: a[i] })
      i++
      j++
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      ops.push({ type: 'remove', line: a[i] })
      i++
    } else {
      ops.push({ type: 'add', line: b[j] })
      j++
    }
  }
  while (i < n) ops.push({ type: 'remove', line: a[i++] })
  while (j < m) ops.push({ type: 'add', line: b[j++] })

  return ops
}
