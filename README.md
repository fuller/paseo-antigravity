# paseo-antigravity

[![npm version](https://img.shields.io/npm/v/paseo-antigravity.svg)](https://www.npmjs.com/package/paseo-antigravity)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Dependencies: Zero](https://img.shields.io/badge/dependencies-0-brightgreen.svg)](https://www.npmjs.com/package/paseo-antigravity)

> Zero-dependency bridge connecting **Google Antigravity 2.0 (`agy`)** to the **Paseo** agent orchestrator and mobile app.

---

## Quick Start (Instant Setup)

Run directly in your terminal with `npx` — no pre-installation required:

```bash
npx paseo-antigravity
```

### What it does automatically:
1. **Locates local `agy`:** Resolves your installed `agy` binary (`PATH`, Homebrew, or `~/.local/bin/agy`).
2. **Discovers Gemini models:** Dynamically queries `agy models` for your available Gemini 3.6 / 3.5 models.
3. **Deploys zero-dependency bridge:** Places an ultra-lightweight bridge script in `~/.gemini/antigravity/paseo-bridge/agy-bridge.py`.
4. **Configures Paseo:** Safely adds the Google Antigravity 2.0 provider to `~/.paseo/config.json`.
5. **Auto-Syncs new models:** Automatically checks and updates newly released Gemini models in the background every 24 hours.

---

## Features & Execution Modes

Supports all of Paseo's native agent execution modes out of the box:

| Paseo UI Mode | Functionality | Native `agy` Flag |
| :--- | :--- | :--- |
| 🛡️ **Plan mode** | Puts Antigravity into read-only planning mode (no file edits). | `--mode plan` |
| 🛡️ **Accept file edits** | Permits file editing while requiring approval for commands. | `--mode accept-edits` |
| 🛡️ **Auto mode** | Automatically applies edits and tool steps. | `--mode accept-edits` |
| 🔓 **Bypass** | Bypasses all permission prompts for autonomous execution. | `--dangerously-skip-permissions` |

---

## Enterprise & Security GRC Compliance

- **Zero NPM Dependencies:** `dependencies: {}` in `package.json` — zero supply-chain risk.
- **Zero Remote Downloads:** Operates 100% locally on your machine without fetching external binaries.
- **100% Open Plaintext Code:** Every line of code is human-readable JavaScript & Python.
- **Preserves Authentication:** Respects your local Google credentials and enterprise quotas.

---

## Development & Testing

```bash
# Clone the repository
git clone https://github.com/fuller/paseo-antigravity.git
cd paseo-antigravity

# Run tests
npm test

# Test dry-run setup
node bin/setup.js --dry-run
```

---

## License

[MIT License](LICENSE) © Andrew Fuller
