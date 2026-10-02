#!/usr/bin/env node
/**
 * Stdio MCP for MWS Deploy. Proxies JSON-RPC to POST /mcp (same tools as the panel).
 * Default API: https://app.mws.co.il  (override MWS_API_URL for TEST)
 * Auth: MWS_TOKEN=mws_dk_…
 */

const HOST = (process.env.MWS_API_URL || 'https://app.mws.co.il').replace(/\/$/, '');
const TOKEN = process.env.MWS_TOKEN || '';

function writeRpc(obj) {
  const json = JSON.stringify(obj);
  const buf = Buffer.from(json, 'utf8');
  process.stdout.write(`Content-Length: ${buf.length}\r\n\r\n`);
  process.stdout.write(buf);
}

async function mcpRpc(body) {
  if (!TOKEN.startsWith('mws_dk_')) {
    throw new Error('Set MWS_TOKEN to mws_dk_… from MWS settings');
  }
  const res = await fetch(`${HOST}/mcp`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${TOKEN}`,
      accept: 'application/json, text/event-stream',
      'content-type': 'application/json',
      'mcp-protocol-version': '2025-03-26'
    },
    body: JSON.stringify(body)
  });
  const text = await res.text();
  if (res.status === 202 && !text.trim()) return null;
  let json;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { error: text.slice(0, 300) };
  }
  if (!res.ok) {
    throw new Error(json.message || json.error || `${res.status}`);
  }
  return json;
}

async function handle(msg) {
  const id = msg.id ?? null;
  const method = msg.method ?? '';
  if (method.startsWith('notifications/')) {
    await mcpRpc(msg).catch(() => null);
    return;
  }
  try {
    const rpc = await mcpRpc(msg);
    if (rpc == null) return;
    writeRpc(rpc);
  } catch (e) {
    writeRpc({
      jsonrpc: '2.0',
      id,
      error: { code: -32000, message: e instanceof Error ? e.message : 'failed' }
    });
  }
}

let buf = Buffer.alloc(0);

process.stdin.on('data', (chunk) => {
  buf = Buffer.concat([buf, chunk]);
  while (true) {
    const headerEnd = buf.indexOf('\r\n\r\n');
    if (headerEnd < 0) return;
    const header = buf.subarray(0, headerEnd).toString('utf8');
    const m = /Content-Length:\s*(\d+)/i.exec(header);
    if (!m) {
      buf = buf.subarray(headerEnd + 4);
      continue;
    }
    const len = parseInt(m[1], 10);
    const start = headerEnd + 4;
    if (buf.length < start + len) return;
    const json = buf.subarray(start, start + len).toString('utf8');
    buf = buf.subarray(start + len);
    let msg;
    try {
      msg = JSON.parse(json);
    } catch {
      continue;
    }
    handle(msg).catch((e) => {
      process.stderr.write(String(e) + '\n');
    });
  }
});

process.stdin.on('end', () => process.exit(0));
