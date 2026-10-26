// Swap an item with its neighbour and return the new list
export function moveItem(items, index, step) {
  const next = [...items]
  const target = index + step
  ;[next[index], next[target]] = [next[target], next[index]]
  return next
}

// Share of texts translated, 0–100
export const percent = ({ done, total }) => (total ? Math.round((done / total) * 100) : 0)
