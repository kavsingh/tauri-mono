`apps/app`: Tauri, SolidJS + TailwindCSS

```
pnpm i
pnpm dev
```

## remote frontend

The main window loads `http://localhost:5321` directly. A bundled connection
screen remains visible until the remote frontend renders; if it is unavailable
or does not become ready in time, use **Try again** after starting the frontend.
The Tauri dev and build commands build the isolation assets; the connection
screen is bundled as static assets and does not need a separate build.

The remote webview needs explicit permissions for application commands. Add new
commands to the app manifest in `apps/app/src-tauri/build.rs` and grant their
generated permissions in `apps/app/src-tauri/capabilities/main-remote.json`.

### development with hot refresh:

```bash
docker compose up app-frontend-dev
```

### build and host:

```bash
docker compose up app-frontend
```
