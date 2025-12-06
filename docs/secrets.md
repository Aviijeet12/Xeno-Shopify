# Secrets Management

This project supports two complementary approaches for managing sensitive configuration.

## 1. Environment Variables / .env files

- Copy `backend/.env.example` to `backend/.env` and fill in strong values for JWT, database, and Shopify keys.
- Never commit `.env` – it is ignored via the repository `.gitignore`.
- When running locally with Docker, VS Code, or IntelliJ, load the variables from `.env` or your shell environment.

## 2. HashiCorp Vault (recommended for production)

Spring Cloud Vault is enabled through `spring-cloud-starter-vault-config`.

1. Deploy a Vault cluster (HA recommended). Enable KV version 2 at the mount path defined by `VAULT_KV_BACKEND` (defaults to `secret`).
2. Create a policy that grants read access to `secret/data/shopify-dashboard` (customize `VAULT_APP_NAME` as needed).
3. Store secrets as key/value pairs, for example:
   ```json
   {
     "DB_HOST": "prod-db.internal",
     "DB_PORT": "5432",
     "DB_NAME": "shopify_dashboard",
     "DB_USERNAME": "svc_dashboard",
     "DB_PASSWORD": "<strong-password>",
     "JWT_SECRET": "<512-bit-hex>",
     "SHOPIFY_WEBHOOK_SECRET": "<webhook-secret>"
   }
   ```
4. Provide the application with a Vault token (or configure Kubernetes auth) and set these environment variables before starting the backend:
   ```bash
   export VAULT_ENABLED=true
   export VAULT_URI=https://vault.internal:8200
   export VAULT_TOKEN=<token-with-policy>
   export VAULT_KV_BACKEND=secret
   export VAULT_APP_NAME=shopify-dashboard
   ```
5. On startup, Spring Cloud Vault loads the entries and exposes them as standard environment properties, overriding values from `.env` files.

## Rotation

- Rotate JWT and webhook secrets regularly. Update Vault first, then restart the backend instances so they pick up new values.
- Database credentials should be rotated via PostgreSQL roles and coordinated with Vault to avoid downtime.

## Auditing

- Enable Vault audit devices (e.g., file or syslog) to track secret access.
- Restrict `.env` usage to local development and ensure CI/CD pipelines inject secrets via secure variables instead of plaintext files.
