export function intersect<T>(setA: Set<T>, setB: Set<T>): Set<T> {
  return new Set([...setA].filter((a) => setB.has(a)));
}

export function difference<T>(setA: Set<T>, setB: Set<T>): Set<T> {
  return new Set([...setA].filter((a) => !setB.has(a)));
}

export function hasDifference<T>(setA: Set<T>, setB: Set<T>): boolean {
  return [...setA].some((a) => !setB.has(a));
}

export function union<T>(setA: Set<T>, setB: Set<T>): Set<T> {
  return new Set([...setA, ...setB]);
}
