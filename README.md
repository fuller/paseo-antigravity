# paseo-antigravity

> Zero-dependency bridge connecting **Google Antigravity 2.0 (`agy`)** to the **Paseo** agent orchestrator and mobile app.

---

## Quick Start

Run directly in your terminal with `npx`:

```bash
npx paseo-antigravity
```

### What it does:
1. **Locates local `agy`:** Automatically resolves your installed `agy` binary (`PATH`, Homebrew, or `~/.local/bin/agy`).
2. **Discovers Gemini models:** Dynamically queries `agy models` for your available Gemini 3.6 / 3.5 models.
3. **Deploys local bridge:** Places a zero-dependency Python bridge in `~/.gemini/antigravity/paseo-bridge/agy-bridge.py`.
4. **Configures Paseo:** Safely updates `~/.paseo/config.json` with the Google Antigravity 2.0 provider.
5. **Auto-Updates:** Automatically re-syncs newly released Gemini models in the background.

---

## Enterprise & Security GRC Compliance

- **Zero NPM Dependencies:** `dependencies: {}` in `package.json` — zero supply-chain risk.
- **Zero Remote Downloads:** Operates 100% locally on your machine with zero external binary fetching.
- **100% Open Code:** Every line of code is plain-text JavaScript & Python that security teams can audit.
- **Preserves Authentication:** Respects your local Google credentials and enterprise quotas.

---

## License

MIT
