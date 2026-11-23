// Rolldown runtime chunks are content-addressed; the filename already identifies
// their bytes. A stale optimizer-wide version must not invalidate identical bytes.
// Never apply this to React or other dependency entries, which are not hashed.
export function recoverRuntimeChunkUrl(raw: string): string | null {
  const url = new URL(raw, 'http://localhost');
  if (!/^\/node_modules\/\.vite\/deps\/rolldown-runtime-[A-Za-z0-9_-]+\.js$/.test(url.pathname) || !url.searchParams.has('v')) return null;
  url.searchParams.delete('v');
  return `${url.pathname}${url.search}`;
}