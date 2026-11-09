# Cloudflare Pages deployment

GitHub Actions builds the frontend and uploads the prebuilt `dist` directory to
the existing `taskflow-ui-b5u` Cloudflare Pages project. Cloudflare hosts the
site but does not run the application build.

## GitHub repository configuration

Under **Settings > Secrets and variables > Actions > Secrets**, add:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

The token must have both **Workers Edit** and **Cloudflare Pages Edit** access
if the same token is shared with the backend deployment workflow.

Under **Settings > Secrets and variables > Actions > Variables**, add:

- `VITE_API_URL` (required; the production `taskflow-api` URL)
- `VITE_SUPPORT_EMAIL`
- `VITE_LEGAL_BUSINESS_NAME`
- `VITE_BUSINESS_ADDRESS`
- `VITE_BUSINESS_PHONE`

All `VITE_` values are compiled into browser JavaScript and must be considered
public. Never place API keys, passwords, or private credentials in them.

## Disable Cloudflare's automatic Git builds

In Cloudflare, open **Workers & Pages > taskflow-ui-b5u > Build > Branch
control**. Turn off **Enable automatic production branch deployments**, then
set Preview branch deployments to **None**.

Do not delete the Pages project or its custom domains. The GitHub workflow uses
Wrangler Direct Upload to deploy to that same project and preserve its URL.
