export function randomItem<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)];
}