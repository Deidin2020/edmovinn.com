// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// Never set ssr.external or resolve.external: the Worker has no runtime module resolution, so
// the build fails. Never add compression (compressPublicAssets, vite-plugin-compression):
// hosting already compresses at the edge.
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { needsDependencyReload, recoverRuntimeChunkUrl } from './src/lib/vite-dependency-url';

export default defineConfig({
  vite: {
    plugins: [{
      name: 'recover-content-addressed-runtime',
      apply: 'serve',
      configureServer(server) {
        let reloadScheduled = false;
        server.middlewares.use((req, _res, next) => {
          if (req.method === 'GET' && req.url) {
            const pathname = new URL(req.url, 'http://localhost').pathname;
            const file = resolve(server.config.root, `.${pathname}`);
            const client = server.environments['client'];
            const metadata = client?.depsOptimizer?.metadata;
            const recovered = recoverRuntimeChunkUrl(req.url);
            // Only metadata-registered, exact existing chunks may bypass a stale
            // optimizer-wide version. Never redirect dependency entries to new bytes.
            const chunk = metadata && Object.values(metadata.chunks).find(info => info.file === file);
            if (recovered && chunk && existsSync(file)) req.url = recovered;
            else {
              const info = metadata?.depInfoList.find(dep => dep.file === file);
              // Vite rejects stale entries with 504 but does not notify a tab
              // that missed the optimizer's earlier reload. Recover that tab via
              // a full document reload, preserving React's version protection.
              if (needsDependencyReload(req.url, info?.browserHash ?? metadata?.browserHash) && !reloadScheduled) {
                reloadScheduled = true;
                setTimeout(() => {
                  client?.hot.send({ type: 'full-reload', path: '*' });
                  reloadScheduled = false;
                }, 150);
              }
            }
          }
          next();
        });
      },
    }],
    optimizeDeps: {
      // Discover all current page dependencies with React in the initial pass.
      // Late optimization otherwise leaves open tabs with mixed React module URLs.
      include: [
        "@radix-ui/react-slot",
        "@radix-ui/react-checkbox",
        "@radix-ui/react-popover",
        "@radix-ui/react-slider",
        "@supabase/supabase-js",
        "libphonenumber-js",
        "zod",
        "react-day-picker",
        "date-fns",
        "date-fns/locale",
        "@tanstack/react-query",
        "@tanstack/react-router",
        "@tanstack/history",
        "@tanstack/router-core",
        "@tanstack/router-core/isServer",
        "@tanstack/router-core/ssr/client",
        "@tanstack/router-core/ssr/server",
        "h3-v2",
        "seroval",
        "class-variance-authority",
        "clsx",
        "lucide-react",
        "tailwind-merge",
      ],
      // Reject old dependency URLs so Vite reloads instead of mixing generations.
      ignoreOutdatedRequests: false,
    },
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
