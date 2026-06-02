# Deployment on Ubuntu

This app is a **TanStack Start** site with a **Nitro `node-server`** backend. Registration, email, and capacity checks run in **server functions** on the Node process—not in the browser. That matches a typical Ubuntu setup: **nginx** (or Caddy) → **systemd** → Node on `127.0.0.1:3000`.

Supabase (database) stays in the cloud; the Ubuntu server only needs API keys and runs the app.

## Architecture

```
Internet → nginx (443) → systemd (k2-preview) → Node :3000
                              ↓
                    createServerFn (registration)
                              ↓
              Supabase (hosted) + Resend + Turnstile APIs
```

## Two kinds of environment variables

| When | Where on Ubuntu | Examples |
|------|-----------------|----------|
| **Build time** | `$APP_DIR/.env` (read during `npm run build`) | `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_TURNSTILE_SITE_KEY` |
| **Runtime** | systemd `EnvironmentFile` (read when Node starts) | `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `TURNSTILE_SECRET_KEY` |

`VITE_*` values are baked into the client bundle at build. **Never** put secrets in `VITE_` variables.

Server-only variables are read inside `createServerFn` handlers and `.server.ts` modules. If they are missing at runtime, registration submit will fail even though the static site loads.

## One-time server setup

### 1. Node.js

Use Node **22.12+** (see `package.json` `engines`). Example with NodeSource:

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2. App directory

Default from [`scripts/deploy-preview.sh`](../scripts/deploy-preview.sh):

```bash
sudo mkdir -p /var/www/k2-preview
sudo chown "$USER:$USER" /var/www/k2-preview
git clone <your-repo> /var/www/k2-preview
```

### 3. Build-time env

```bash
cp .env.example /var/www/k2-preview/.env
# Edit: VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY, VITE_TURNSTILE_SITE_KEY
```

### 4. Runtime env (secrets)

```bash
sudo mkdir -p /etc/k2-preview
sudo cp scripts/env.production.example /etc/k2-preview/env
sudo chmod 600 /etc/k2-preview/env
sudo nano /etc/k2-preview/env
```

### 5. systemd unit

```bash
sudo cp scripts/k2-preview.service.example /etc/systemd/system/k2-preview.service
sudo systemctl daemon-reload
sudo systemctl enable k2-preview
```

Adjust `User`, `WorkingDirectory`, and `EnvironmentFile` in the unit if your paths differ.

### 6. nginx (example)

Proxy to the Node app; do not expose port 3000 publicly unless intentional.

```nginx
server {
    listen 80;
    server_name your-domain.com;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Use Certbot for TLS. After changing **runtime** env, restart the service—not only rebuild.

### 7. Supabase migration (not on Ubuntu)

Apply SQL in [`supabase/migrations/`](../supabase/migrations/) via Supabase Dashboard → SQL, or:

```bash
supabase db push
```

Required for registration v2: `camp_settings`, `submit_registration()`, revoked anon `INSERT`.

## Deploy updates

From your machine or on the server:

```bash
./scripts/deploy-preview.sh
```

Or manually:

```bash
cd /var/www/k2-preview
git pull
npm install
npm run build
sudo systemctl restart k2-preview
```

**Order matters:** if you add new `VITE_*` vars, rebuild. If you only change server secrets in `/etc/k2-preview/env`, restart systemd without rebuild.

## Registration checklist (production)

- [ ] Migrations through `20260602160000_registration_optional_immunization.sql` applied on Supabase
- [ ] `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` in `/etc/k2-preview/env`
- [ ] `VITE_SUPABASE_*` in app `.env` and **rebuilt** after changes
- [ ] Resend domain verified; `RESEND_API_KEY` in runtime env
- [ ] Turnstile keys: site key in `VITE_`, secret in runtime env
- [ ] Waiver page reviewed by counsel (placeholder is not sufficient for launch)
- [ ] `camp_settings` row in Supabase — set `registrations_open = false` when you want to close the form
- [ ] Test submit on live URL; confirm row in Supabase + parent confirmation + admin email with PDF to `info@k2soccercamp.com`

## Optional: dev without Turnstile / email

If `TURNSTILE_SECRET_KEY` is unset, server skips Turnstile verification (local dev only—set keys in production).

If `RESEND_API_KEY` is unset, registrations still save; emails are skipped and logged.

## Troubleshooting

| Symptom | Likely cause |
|---------|----------------|
| Form loads but submit fails | Missing `SUPABASE_SERVICE_ROLE_KEY` or migration not applied |
| “Bot verification failed” | Turnstile secret missing/wrong, or domain not allowed in Cloudflare |
| No confirmation email | `RESEND_API_KEY` unset or domain not verified |
| Old client still inserts to Supabase | Browser cache; ensure latest build deployed and anon INSERT revoked |
| 502 from nginx | `systemctl status k2-preview`; check Node crashed on start (env/permissions) |

Logs:

```bash
journalctl -u k2-preview -f
```
