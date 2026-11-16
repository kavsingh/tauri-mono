`apps/app`: Tauri, SolidJS + TailwindCSS

```
pnpm i
pnpm dev
```

## remote frontend

The app loads `http://localhost:5321` directly when available. It keeps a
production frontend embedded in the app as the first-launch fallback and keeps
the last verified release in the app data directory for later offline starts.
The local UI remains usable while a remote retry runs and only hands off after
the remote frontend signals readiness.

Release builds use a signed manifest. Set `FRONTEND_RELEASE_PUBLIC_KEY` to the
32-byte Ed25519 public key in hexadecimal when building the native app and
frontend, and provide `FRONTEND_RELEASE_PRIVATE_KEY_FILE` as a build secret
when publishing the frontend
(`docker compose --profile prod build app-frontend-prod`). Generate the key
with `openssl genpkey -algorithm Ed25519 -out frontend-release-private.pem`;
derive the public hex value with
`openssl pkey -in frontend-release-private.pem -pubout -outform DER | tail -c 32 | xxd -p -c 32`.
Never commit the private key. The frontend publisher must retain immutable files at
`/releases/<build-id>/` under the frontend origin, including `manifest.json`;
the root frontend build ID must match that release directory. Development
servers are not cached. The production Compose service persists immutable
release directories in its `frontend-releases` volume across container
replacements. The production container runs as UID 101; an existing volume
created by the previous root-running image must be writable by that UID,
including its existing release directories. Preserve those releases when
updating the volume permissions. The app trusts one release key at a time;
rotate it with a native app update, which rejects releases signed by the
previous key and falls back to the embedded frontend. Remote native-API
permissions currently allow only localhost; configure the exact production
origin in Tauri capabilities before deploying to another host. Frontend web storage is origin-specific and is not
transferred between the remote and local origins; native plugin data remains
available to both.

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
