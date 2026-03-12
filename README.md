# Ory Hydra Admin UI

A self-hosted Next.js 16 + React 19 admin interface for [Ory Hydra](https://github.com/ory/hydra).

It lets you:

- **Manage OAuth 2.0 clients** – list, create, and delete clients registered in Hydra.
- **Issue M2M tokens** – obtain access tokens via the `client_credentials` grant directly from the UI.
- **Verify / introspect tokens** – inspect the claims of any access token using Hydra's introspect endpoint.

---

## Architecture

```
Browser  →  Next.js (Admin UI, port 3000)
                ├── /api/clients          →  Hydra Admin API :4445
                ├── /api/token/issue      →  Hydra Public API :4444
                └── /api/token/introspect →  Hydra Admin API :4445
```

All requests to Hydra are proxied through Next.js API routes so that sensitive credentials (client secrets, admin tokens) are never exposed to the browser.

---

## Quick Start with Docker Compose

The easiest way to run everything locally:

```bash
# 1. Clone the repository
git clone https://github.com/jaredhan418/iam-ory.git
cd iam-ory

# 2. Start Hydra + Admin UI
docker compose up --build
```

Services that will be started:

| Service       | URL                     | Description                  |
|---------------|-------------------------|------------------------------|
| Admin UI      | http://localhost:3000   | This application             |
| Hydra Public  | http://localhost:4444   | Token / authorize endpoints  |
| Hydra Admin   | http://localhost:4445   | Admin API                    |
| PostgreSQL    | localhost:5432          | Hydra persistence            |

---

## Local Development (without Docker)

### Prerequisites

- Node.js ≥ 20
- A running [Ory Hydra](https://www.ory.sh/docs/hydra/install) instance

### Setup

```bash
# Install dependencies
npm install

# Copy and edit environment variables
cp .env.example .env.local
# Edit .env.local to point to your Hydra instance

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

| Variable                       | Description                                               | Default                    |
|--------------------------------|-----------------------------------------------------------|----------------------------|
| `HYDRA_ADMIN_URL`              | Hydra Admin API base URL (server-side)                    | `http://localhost:4445`    |
| `HYDRA_PUBLIC_URL`             | Hydra Public API base URL (server-side, token issuance)   | `http://localhost:4444`    |
| `NEXT_PUBLIC_HYDRA_ADMIN_URL`  | Displayed in the sidebar (browser-safe)                   | `http://localhost:4445`    |

---

## Usage

### 1. Create a Machine-to-Machine Client

1. Navigate to **OAuth Clients** → **+ New Client**.
2. Enter a name, scope (e.g. `read write`), and optional audience.
3. Click **Create Client** and **save the displayed client secret** – it will not be shown again.

### 2. Issue an M2M Token

1. Navigate to **Issue M2M Token**.
2. Enter the `client_id` and `client_secret` from the previous step.
3. Optionally specify a scope and audience.
4. Click **Request Access Token**.

The access token returned uses the OAuth 2.0 `client_credentials` grant and can be used as a `Bearer` token in downstream service requests.

### 3. Verify a Token

1. Navigate to **Verify / Introspect Token**.
2. Paste the access token.
3. Click **Introspect Token**.

The result shows whether the token is active, its claims (client ID, subject, scope, expiry, etc.) and the raw JSON from Hydra.

---

## Scripts

```bash
npm run dev    # Start development server (http://localhost:3000)
npm run build  # Production build
npm start      # Start production server
npm run lint   # Run ESLint
```

---

## Tech Stack

- **[Next.js 16](https://nextjs.org/)** – React framework with App Router and API routes
- **[React 19](https://react.dev/)** – UI library
- **[Tailwind CSS 4](https://tailwindcss.com/)** – Utility-first styling
- **[Ory Hydra v2](https://github.com/ory/hydra)** – OAuth 2.0 / OIDC server
