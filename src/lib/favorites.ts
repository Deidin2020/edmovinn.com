import { useSyncExternalStore } from 'react';
export type FavoriteItem = { kind: 'residence'; residenceSlug: string } | { kind: 'room'; residenceSlug: string; roomId: string };
let items: FavoriteItem[] = [];
const empty: FavoriteItem[] = [];
const listeners = new Set<() => void>();
export function favoriteKey(item: FavoriteItem) { return item.kind === 'room' ? `room:${item.residenceSlug}:${item.roomId}` : `residence:${item.residenceSlug}`; }
export function toggleFavorite(item: FavoriteItem) { const key = favoriteKey(item); items = items.some(old => favoriteKey(old) === key) ? items.filter(old => favoriteKey(old) !== key) : [...items, item]; listeners.forEach(listener => listener()); }
export function useFavorite(item: FavoriteItem) {
  const saved = useSyncExternalStore(listener => { listeners.add(listener); return () => { listeners.delete(listener); }; }, () => items, () => empty);
  return { saved: saved.some(old => favoriteKey(old) === favoriteKey(item)), toggle: () => toggleFavorite(item) };
}
