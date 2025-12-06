# Operational Runbooks

## 1. Manual Tenant Sync Failure
1. Identify the tenant ID from monitoring (`shopify.sync.failure` counter tags) or logs.
2. Check application logs for `Failed to sync tenant` messages to capture stack traces.
3. Validate Shopify credentials stored in Vault / `.env` for that tenant.
4. Trigger a manual sync via `POST /api/tenants/{tenantId}/sync`.
5. If retries continue to fail with 4xx responses, re-authenticate the Shopify private app and update stored tokens.

## 2. Shopify Rate Limit Surge
1. Prometheus alert `shopify.sync.failure{exception="ShopifyRateLimitException"}` fires.
2. Confirm current request volume and Shopify plan limits.
3. Consider pausing scheduled syncs (`TenantSyncScheduler`) by toggling the Spring profile or scaling down worker pods.
4. Increase `SHOPIFY_RATE_LIMIT_BACKOFF_SECONDS` temporarily and redeploy.
5. Resume normal schedule once rate limit counters stabilize.

## 3. Database Connectivity Loss
1. Health endpoint `/actuator/health` will report `DOWN` for the `db` component.
2. Inspect PostgreSQL cluster status; fail over if using HA setup.
3. Once DB is back, verify Flyway migrations applied (`flyway_schema_history`).
4. Run smoke tests (`mvn -pl backend test`) before re-enabling public traffic.

## 4. Credential Rotation
1. Update secrets in Vault (`secret/data/shopify-dashboard`).
2. Restart the backend deployment to reload configuration from Vault.
3. Validate JWT issuance (`/auth/login`) and webhook signatures.
4. Remove the previous secret version after confirming clients use new tokens.

## 5. Disaster Recovery / Restore
1. Restore the latest PostgreSQL backup to a new instance.
2. Point the backend to the restored DB by updating `DB_HOST`/`DB_NAME` secrets.
3. Run `Flyway repair` followed by `Flyway migrate` to ensure schema alignment.
4. Replay missed Shopify data by invoking manual sync per tenant.
