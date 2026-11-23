import { describe, expect, it } from 'vitest';
import { recoverRuntimeChunkUrl } from '@/lib/vite-dependency-url';

describe('Content-addressed runtime recovery', () => {
  it('recovers the exact reported runtime chunk without its stale optimizer version', () => {
    expect(recoverRuntimeChunkUrl('/node_modules/.vite/deps/rolldown-runtime-DC62tzP2.js?v=3d17cc27')).toBe('/node_modules/.vite/deps/rolldown-runtime-DC62tzP2.js');
  });
  it('keeps version protection on React and dependency entries', () => {
    expect(recoverRuntimeChunkUrl('/node_modules/.vite/deps/react.js?v=3d17cc27')).toBeNull();
    expect(recoverRuntimeChunkUrl('/node_modules/.vite/deps/@tanstack_react-router.js?v=3d17cc27')).toBeNull();
  });
  it('does not alter unrelated paths or already unversioned chunks', () => {
    expect(recoverRuntimeChunkUrl('/src/rolldown-runtime-DC62tzP2.js?v=3d17cc27')).toBeNull();
    expect(recoverRuntimeChunkUrl('/node_modules/.vite/deps/rolldown-runtime-DC62tzP2.js')).toBeNull();
  });
});