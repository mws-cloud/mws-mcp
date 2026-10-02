# MWS Deploy MCP

Remote MCP for an **MWS customer account**. Same idea as Cloudflare / Vercel MCP: the agent talks to *your* hosting, domains, tickets, and billing. Not a public search tool.

- **Remote URL (no install):** `https://app.mws.co.il/mcp`
- **Docs (Hebrew + English):** https://app.mws.co.il/docs/mcp
- **This repo (stdio / `npx`):** `npx -y github:mws-cloud/mws-mcp`
- **עברית:** [README.he.md](./README.he.md)

## What the agent can do

| Area | Tools (examples) |
| --- | --- |
| Deploy | list apps, status, deploy / redeploy, build + runtime logs, rollback |
| GitHub | status, repo list, **one-click GitHub App install** (`install_url`), then private deploy |
| Billing | invoices, pay link `https://mws.co.il/go.php?c=inv{id}`, plans, quotes |
| Orders | create order / upgrade / cancel only after `confirm=true`. **Never charges a card** |
| Account | profile, contacts, credit, entitlements |
| Domains | list, lock, contacts, EPP, renew invoice, nameservers |
| DNS / Cloudflare | list / add / update / delete records, CF status + connect |
| Tickets | list, read, open, reply |
| WordPress / VPN / affiliate | sites, `wp_action`, panel SSO, VPN, affiliate |

Writes need `confirm=true` after the customer said yes. Pay tools return a link. They never run `payInvoiceCard`.

## 1. Website / any agent (OAuth)

Paste this as a custom / remote MCP connector. Browser login to MWS. **No token.**

```
https://app.mws.co.il/mcp
```

Works in Claude, ChatGPT (Connectors), Cursor, Gemini, Copilot, Windsurf, VS Code.

ChatGPT: Settings → Connectors → add the URL. Same endpoint — not a separate GPT plugin.

## 2. Cursor (JSON)

```json
{
  "mcpServers": {
    "mws": {
      "url": "https://app.mws.co.il/mcp"
    }
  }
}
```

## 3. GitHub / local stdio (this repo)

For agents that only run a local command. Create a deploy token in the MWS panel (Settings): `mws_dk_…`.

```json
{
  "mcpServers": {
    "mws": {
      "command": "npx",
      "args": ["-y", "github:mws-cloud/mws-mcp"],
      "env": {
        "MWS_TOKEN": "mws_dk_YOUR_TOKEN",
        "MWS_API_URL": "https://app.mws.co.il"
      }
    }
  }
}
```

Same tools as the remote URL. TEST: `"MWS_API_URL": "https://apptest.mws.co.il"`.

## Private GitHub

`mws_github_status` returns `install_url` → GitHub App (one click). State is bound to the MWS account. After approve, the agent polls until `connected=true`. No extra panel login.

## License

MIT
