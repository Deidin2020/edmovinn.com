// Optimizer chunks are content-addressed; the filename already identifies
// their bytes. A stale optimizer-wide version must not invalidate identical bytes.
// Never apply this to React or other dependency entries, which are not hashed.
export function recoverRuntimeChunkUrl(raw: string): string | null {
  const url = new URL(raw, 'http://localhost');
  if (!/^\/node_modules\/\.vite\/deps\/[^/]+-[A-Za-z0-9_-]{8,}\.js$/.test(url.pathname) || !url.searchParams.has('v')) return null;
  url.searchParams.delete('v');
  return `${url.pathname}${url.search}`;
}

export function needsDependencyReload(raw: string, currentVersion: string | undefined): boolean {
  const url = new URL(raw, 'http://localhost');
  const requestedVersion = url.searchParams.get('v');
  return /^\/node_modules\/\.vite\/deps\/[^/]+\.js$/.test(url.pathname)
    && Boolean(requestedVersion && currentVersion && requestedVersion !== currentVersion);
}