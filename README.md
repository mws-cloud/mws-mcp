# MWS Deploy MCP

Remote MCP for MWS customer accounts. Same idea as Vercel (`https://mcp.vercel.com`) and Cloudflare: the agent talks to **your** hosting account.

Not a discovery tool. You already have an MWS account.

## What the agent can do

- List your apps
- Deploy a **public** GitHub repo to `*.deploy.mws.co.il`
- Check app status / live URL

No invoices. No plan purchases. Private Git: connect GitHub in the panel, then `git push`.

## 1. Token

In the MWS panel → Settings → create a deploy token (`mws_dk_…`). Copy once.

## 2. Claude.ai / Claude Desktop (remote, like Vercel)

Custom connector URL:

- Prod: `https://app.mws.co.il/mcp`
- TEST: `https://apptest.mws.co.il/mcp`

Auth: request header `Authorization` = `Bearer mws_dk_…`

## 3. Cursor

Paste from Settings (**העתק הגדרת Cursor**) or put this in MCP config, then replace the token:

```json
{
  "mcpServers": {
    "mws": {
      "url": "https://app.mws.co.il/mcp",
      "headers": {
        "Authorization": "Bearer mws_dk_YOUR_TOKEN"
      }
    }
  }
}
```

## 4. Local stdio (this repo)

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

TEST host: `"MWS_API_URL": "https://apptest.mws.co.il"`.

## Do you still need the paste-link / CLI?

| Thing | Still needed? |
|---|---|
| Token `mws_dk_` | **Yes.** MCP authenticates with it. |
| `/for-claude` paste link | **Yes** for customers who only chat on claude.ai and will not add a connector. |
| `mws` CLI | Optional. The agent uses MCP instead of a terminal. |
| Panel `/new` | **Yes** for private repos and people who click, not agents. |

## License

MIT
