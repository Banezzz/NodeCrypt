# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NodeCrypt is a zero-knowledge, end-to-end encrypted chat system. The server acts as a blind relay - it never has access to plaintext messages. All encryption/decryption happens client-side. No message history is stored; data exists only in memory and rooms disappear when empty.

## Common Commands

```bash
# Development (Cloudflare Workers local dev server)
npm run dev

# Build client for production (outputs to dist/)
npm run build

# Deploy to Cloudflare Workers
npm run deploy

# Run alternative Node.js server (self-hosted option)
cd server && npm install && node server.js
```

## Architecture

### Three-Tier Structure

```
CLIENT (client/js/)
  ├── NodeCrypt.js      # Core crypto engine (ECDH, AES-256, ChaCha20, RSA)
  ├── main.js           # App bootstrap, module orchestration
  ├── ui.js             # UI rendering, forms, modals
  ├── chat.js           # Message handling & display
  ├── room.js           # Room management
  └── util.*.js         # Utilities (i18n, theme, settings, file, emoji, etc.)

SERVER (two deployment options)
  ├── worker/index.js   # Cloudflare Workers + Durable Objects (primary)
  └── server/server.js  # Node.js WebSocket server (alternative)
```

### Security Model (3-Layer Encryption)

1. **RSA-2048**: Server identity authentication
2. **ECDH-P384/Curve25519**: Key negotiation between clients
3. **AES-256-CBC + ChaCha20**: Symmetric message encryption

Room password creates isolated encryption: `ECDH_shared_key XOR SHA256(password)`

### Key Design Principles

- Server is cryptographically blind - only relays encrypted data
- No persistent storage - memory-only, ephemeral rooms
- Forward secrecy through no message history
- Room-based isolation via password-derived keys

## Build Configuration

- **Vite** builds client from `client/` to `dist/`
- **wrangler.toml** configures Cloudflare Workers with Durable Objects binding
- Manual chunk splitting: `crypto-libs` (aes-js, elliptic, chacha20, sha256)
- Source maps disabled for privacy

## Cloudflare Workers Specifics

- Entry: `worker/index.js`
- `ChatRoom` class is a Durable Object handling WebSocket connections per room
- Static assets served from `dist/` via ASSETS binding
- RSA key pair rotates every 24 hours

## Development Notes

- Client is vanilla ES6+ JavaScript (no framework)
- All crypto libraries are pure JS (aes-js, elliptic, js-chacha20, js-sha256)
- HTML sanitization via DOMPurify
- Global config available at `window.config = { wsAddress, debug }`
- No formal testing framework currently in place
