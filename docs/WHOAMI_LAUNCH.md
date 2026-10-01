# WhoAmI public launch

The public WhoAmI host is intentionally smaller than the inherited Links application.

## Production mode

A production deployment branded **WhoAmI by The Agency** enters public-launch mode automatically.

The public allowlist is:

- `/`
- `/discover`
- `/creator/*`
- `/privacy`
- static build assets
- `/api/health`
- `/api/config`
- `/api/whoami/*`

Inherited Links admin, auth, identity editing, billing, payments, HireMe, renderer, public-handle, giveaway, QR-studio, and preview APIs are not mounted.

Do not set `WHOAMI_LEGACY_SURFACES=1` on the public host.

## Required production environment

```bash
NODE_ENV=production
LINKS_BRAND_NAME="WhoAmI by The Agency"
PUBLIC_ORIGIN=https://whoami.com.co
NEDB_DB=whoami
NEDB_PATH=/var/lib/whoami/nedb
WHOAMI_PUBLIC_LAUNCH=1
```

`NEDB_PATH` must be an absolute path on persistent storage. Server startup fails if the public host does not have both `PUBLIC_ORIGIN` and a durable `NEDB_PATH`.

## Waitlist data

Waitlist records live in the `whoami_waitlist` collection in the embedded NEDB database.

Export the current waitlist without mutating it:

```bash
corepack pnpm run waitlist:export > whoami-waitlist-$(date +%F).json
```

Back up the entire NEDB path as part of the host's normal snapshot/backup policy. The export is useful for operations; the persistent database remains the source of truth.

## Reverse proxy

Terminate TLS at the reverse proxy and proxy only to the local WhoAmI server port. The app trusts forwarded client IP information only from loopback proxies.

The public launch does not emit permissive CORS headers. Browser requests are expected to be same-origin.

## Launch verification

After deploy:

```bash
curl -fsS https://whoami.com.co/api/health
curl -I https://whoami.com.co/
curl -I https://whoami.com.co/discover
curl -I 'https://whoami.com.co/creator/preview?identity=tylerp'
curl -I https://whoami.com.co/privacy
```

These inherited surfaces must return 404 on the public host:

```bash
curl -i https://whoami.com.co/api/identities
curl -i https://whoami.com.co/api/admin/overview
curl -i https://whoami.com.co/api/hireme
curl -i https://whoami.com.co/demo
curl -i https://whoami.com.co/identities
```
