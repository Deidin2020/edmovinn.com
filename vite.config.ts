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
import { recoverRuntimeChunkUrl } from './src/lib/vite-dependency-url';

export default defineConfig({
  vite: {
    plugins: [{
      name: 'recover-content-addressed-runtime',
      apply: 'serve',
      configureServer(server) {
        server.middlewares.use((req, _res, next) => {
          if (req.method === 'GET' && req.url) {
            const recovered = recoverRuntimeChunkUrl(req.url);
            // Only serve the exact existing content-hashed file. Missing old
            // chunks and non-hashed dependency entries retain Vite's checks.
            if (recovered && existsSync(resolve(server.config.root, `.${new URL(recovered, 'http://localhost').pathname}`))) req.url = recovered;
          }
          next();
        });
      },
    }],
    optimizeDeps: {
      // Discover the homepage UI dependencies with React in the initial pass.
      // Late optimization otherwise leaves open tabs with mixed React module URLs.
      include: [
        "@radix-ui/react-slot",
        "@radix-ui/react-checkbox",
        "@radix-ui/react-popover",
        "react-day-picker",
        "date-fns",
        "date-fns/locale",
        "@tanstack/react-query",
        "@tanstack/react-router",
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
