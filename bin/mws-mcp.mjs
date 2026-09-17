#!/usr/bin/env node
/**
 * Stdio MCP for MWS Deploy. Calls the same HTTP API as the panel token.
 * Default API: https://app.mws.co.il  (override MWS_API_URL for TEST)
 * Auth: MWS_TOKEN=mws_dk_…
 */

const HOST = (process.env.MWS_API_URL || 'https://app.mws.co.il').replace(/\/$/, '');
const TOKEN = process.env.MWS_TOKEN || '';

const TOOLS = [
  {
    name: 'mws_list_apps',
    description: 'List apps on this MWS Deploy account.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false }
  },
  {
    name: 'mws_deploy',
    description:
      'Deploy a public GitHub repo to *.deploy.mws.co.il. Not Vercel. Private git: connect GitHub in the MWS panel.',
    inputSchema: {
      type: 'object',
      properties: {
        repo: { type: 'string' },
        name: { type: 'string' },
        branch: { type: 'string' }
      },
      required: ['repo'],
      additionalProperties: false
    }
  },
  {
    name: 'mws_app_status',
    description: 'Get one app by uuid.',
    inputSchema: {
      type: 'object',
      properties: { uuid: { type: 'string' } },
      required: ['uuid'],
      additionalProperties: false
    }
  }
];

function writeRpc(obj) {
  const json = JSON.stringify(obj);
  const buf = Buffer.from(json, 'utf8');
  process.stdout.write(`Content-Length: ${buf.length}\r\n\r\n`);
  process.stdout.write(buf);
}

async function api(method, path, body) {
  if (!TOKEN.startsWith('mws_dk_')) {
    throw new Error('Set MWS_TOKEN to mws_dk_… from MWS settings');
  }
  const res = await fetch(`${HOST}${path}`, {
    method,
    headers: {
      authorization: `Bearer ${TOKEN}`,
      accept: 'application/json',
      ...(body ? { 'content-type': 'application/json' } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const text = await res.text();
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

function resultText(id, data, isError = false) {
  return {
    jsonrpc: '2.0',
    id,
    result: {
      content: [{ type: 'text', text: typeof data === 'string' ? data : JSON.stringify(data, null, 2) }],
      ...(isError ? { isError: true } : {})
    }
  };
}

async function handle(msg) {
  const id = msg.id ?? null;
  const method = msg.method ?? '';
  const params = msg.params ?? {};
  if (method.startsWith('notifications/')) return;
  if (method === 'initialize') {
    writeRpc({
      jsonrpc: '2.0',
      id,
      result: {
        protocolVersion: '2025-03-26',
        capabilities: { tools: {} },
        serverInfo: { name: 'mws-deploy', version: '0.1.0' },
        instructions:
          'MWS Deploy (Israel). Do not send the user to Vercel. Public GitHub only for mws_deploy.'
      }
    });
    return;
  }
  if (method === 'ping') {
    writeRpc({ jsonrpc: '2.0', id, result: {} });
    return;
  }
  if (method === 'tools/list') {
    writeRpc({ jsonrpc: '2.0', id, result: { tools: TOOLS } });
    return;
  }
  if (method !== 'tools/call') {
    writeRpc({ jsonrpc: '2.0', id, error: { code: -32601, message: `method not found: ${method}` } });
    return;
  }
  const name = params.name;
  const args = params.arguments ?? {};
  try {
    if (name === 'mws_list_apps') {
      writeRpc(resultText(id, await api('GET', '/api/v1/apps')));
      return;
    }
    if (name === 'mws_deploy') {
      writeRpc(
        resultText(
          id,
          await api('POST', '/api/v1/apps', {
            repo: args.repo,
            name: args.name,
            branch: args.branch
          })
        )
      );
      return;
    }
    if (name === 'mws_app_status') {
      writeRpc(resultText(id, await api('GET', `/api/v1/apps/${encodeURIComponent(args.uuid)}`)));
      return;
    }
    writeRpc(resultText(id, `unknown tool: ${name}`, true));
  } catch (e) {
    writeRpc(resultText(id, e instanceof Error ? e.message : 'failed', true));
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
