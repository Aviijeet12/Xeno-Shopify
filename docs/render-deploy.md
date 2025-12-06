# Render Deployment Guide

## Prerequisites
- Render account with permission to create Web Service and PostgreSQL resources.
- Shopify private app tokens (`SHOPIFY_API_KEY`, `SHOPIFY_API_SECRET`, `SHOPIFY_ACCESS_TOKEN` / `shpat_…`).
- JWT signing secret for the dashboard API (`JWT_SECRET`).
- Custom webhook secret you will register in Shopify (`SHOPIFY_WEBHOOK_SECRET`).
- GitHub repository (`Aviijeet12/Xeno-Shopify`) connected to Render.

## 1. Provision infrastructure via Blueprint
1. Install the Render CLI (`npm install -g render-cli`) or use the dashboard "Blueprints" tab.
2. From the repository root run:
   ```bash
   render blueprint launch render.yaml
   ```
   This creates:
   - `shopify-dashboard-db`: managed PostgreSQL instance (starter plan, Oregon region).
   - `shopify-dashboard-backend`: Docker-based Web Service built from `backend/Dockerfile`.
3. Confirm the health check path `/actuator/health` shows **UP** once the service boots.

## 2. Environment variables / secrets
Set these in Render (Web Service → Environment):

| Key | Description |
| --- | --- |
| `SPRING_PROFILES_ACTIVE` | Always `production` in Render deployment. |
| `SPRING_TESTCONTAINERS_ENABLED` | Keep `false`; prevents Spring from trying to spin up Testcontainers during startup scripts. |
| `JWT_SECRET` | Long random string used to sign dashboard JWTs. |
| `JWT_EXPIRATION_SECONDS` | Token lifetime (defaults to `3600`). |
| `SHOPIFY_API_KEY` | Shopify custom app API key. |
| `SHOPIFY_API_SECRET` | Shopify custom app API secret. |
| `SHOPIFY_ACCESS_TOKEN` | `shpat_…` token with read/write scopes for the store. |
| `SHOPIFY_WEBHOOK_SECRET` | Shared secret for webhook verification. |
| `SHOPIFY_HOST` | Base shop domain, e.g. `your-shop.myshopify.com`. |
| `SHOPIFY_API_VERSION` | Keep `2024-10` unless Shopify requires newer version. |
| `SHOPIFY_REQUEST_TIMEOUT_MS` | Optional tuning (default `10000`). |
| `SHOPIFY_MAX_RETRIES` | Optional tuning (default `3`). |
| `SHOPIFY_RATE_LIMIT_BACKOFF_SECONDS` | Optional tuning (default `5`). |
| `JAVA_TOOL_OPTIONS` | `-XX:MaxRAMPercentage=75 -XX:+UseContainerSupport` (already set in blueprint). |
| `SERVER_PORT` | Render listens on `8080`; leave default. |
| `APP_BASE_URL` | Public Render URL (used for docs/logging reference). |
| `VAULT_ENABLED` | Leave `false` unless Render can reach your Vault cluster. |

Database credentials are injected automatically from the blueprint (`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USERNAME`, `DB_PASSWORD`).

## 3. Build & release flow
1. On each push to `main`, GitHub Actions still runs `mvn -B test`. With the `disabledWithoutDocker` flag, repository tests skip gracefully if Docker is unavailable.
2. Render auto-builds after GitHub CI passes. The Dockerfile already skips tests during the build stage (`mvn -DskipTests package`) to keep container builds deterministic.
3. To force a deployment: `git push` or "Deploy latest commit" from the Render dashboard.

## 4. Shopify configuration
1. Update your Shopify app webhook URLs to the Render domain, e.g. `https://shopify-dashboard-backend.onrender.com/webhooks/orders/create`.
2. Make sure the webhook secret in Shopify matches `SHOPIFY_WEBHOOK_SECRET` in Render.
3. For OAuth/private app token refreshes, update the corresponding Render environment variable and hit "Deploy latest" to recycle the service.

## 5. Smoke test checklist
1. Hit `GET https://<render-domain>/actuator/health` → expect `"status":"UP"`.
2. Create a tenant via `POST /api/tenants` and confirm record exists in Render Postgres (`shopify_dashboard` DB).
3. Trigger `POST /api/tenants/{tenantId}/sync` and verify logs contain Shopify API calls without rate-limit errors.
4. Check Prometheus metrics at `/actuator/prometheus` to ensure Micrometer endpoint is exposed for observability.

Deployments are now turnkey—once you fill in the Shopify tokens and JWT secret, the backend can be promoted to production on Render.
