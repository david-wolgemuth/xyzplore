
export function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}


export function randomSort<T>(arr: T[]): T[] {
  return arr.slice().sort(() => Math.random() - 0.5);
}
