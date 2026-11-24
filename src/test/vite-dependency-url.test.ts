import { describe, expect, it } from 'vitest';
import { needsDependencyReload, recoverRuntimeChunkUrl } from '@/lib/vite-dependency-url';

describe('Content-addressed runtime recovery', () => {
  it('recovers the exact reported runtime chunk without its stale optimizer version', () => {
    expect(recoverRuntimeChunkUrl('/node_modules/.vite/deps/rolldown-runtime-DC62tzP2.js?v=3d17cc27')).toBe('/node_modules/.vite/deps/rolldown-runtime-DC62tzP2.js');
  });
  it('recovers the reported content-hashed tslib chunk', () => {
    expect(recoverRuntimeChunkUrl('/node_modules/.vite/deps/tslib.es6-B1NP4NDs.js?v=ff680c1d')).toBe('/node_modules/.vite/deps/tslib.es6-B1NP4NDs.js');
  });
  it('keeps version protection on React and dependency entries', () => {
    expect(recoverRuntimeChunkUrl('/node_modules/.vite/deps/react.js?v=3d17cc27')).toBeNull();
    expect(recoverRuntimeChunkUrl('/node_modules/.vite/deps/@tanstack_react-router.js?v=3d17cc27')).toBeNull();
    expect(recoverRuntimeChunkUrl('/node_modules/.vite/deps/zod.js?v=fe5f7f14')).toBeNull();
    expect(recoverRuntimeChunkUrl('/node_modules/.vite/deps/libphonenumber-js.js?v=4ba8e301')).toBeNull();
  });
  it('requests a full document reload for stale entries instead of mixing module versions', () => {
    expect(needsDependencyReload('/node_modules/.vite/deps/zod.js?v=fe5f7f14', 'current')).toBe(true);
    expect(needsDependencyReload('/node_modules/.vite/deps/libphonenumber-js.js?v=4ba8e301', 'current')).toBe(true);
    expect(needsDependencyReload('/node_modules/.vite/deps/react.js?v=current', 'current')).toBe(false);
    expect(needsDependencyReload('/node_modules/.vite/deps/zod.js', 'current')).toBe(false);
    expect(needsDependencyReload('/src/example.js?v=old', 'current')).toBe(false);
    expect(needsDependencyReload('/node_modules/.vite/deps/zod.js?v=old', undefined)).toBe(false);
  });
  it('does not alter unrelated paths or already unversioned chunks', () => {
    expect(recoverRuntimeChunkUrl('/src/rolldown-runtime-DC62tzP2.js?v=3d17cc27')).toBeNull();
    expect(recoverRuntimeChunkUrl('/node_modules/.vite/deps/rolldown-runtime-DC62tzP2.js')).toBeNull();
  });
});