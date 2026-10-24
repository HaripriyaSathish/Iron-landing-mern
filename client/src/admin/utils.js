// Swap an item with its neighbour and return the new list
export function moveItem(items, index, step) {
  const next = [...items]
  const target = index + step
  ;[next[index], next[target]] = [next[target], next[index]]
  return next
}
