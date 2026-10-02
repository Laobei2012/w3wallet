# w3wallet

An experimental Ethereum (EVM) wallet built with Vue 3, Ionic and Capacitor. It runs in the browser and as an Android / iOS app.

> **⚠️ Experimental and unaudited. Do not use it with real funds.**
> The project was written in 2023 and has not had a security review. See [Known security limitations](#known-security-limitations) and [SECURITY.md](SECURITY.md).

## Features

- Multiple accounts: import a private key, or extract one from a 12-word mnemonic
- Multiple networks (mainnet and testnets), with custom networks
- Assets, NFTs and transaction history (via [Alchemy](https://www.alchemy.com/))
- Message and transaction signing views
- Optional password encryption of stored keys (AES-GCM, PBKDF2)

## Getting started

Requirements: Node.js 18+ and npm.

```bash
npm install
cp .env.example .env   # add your own Alchemy API keys
npm run dev
```

| Command | Purpose |
| --- | --- |
| `npm run dev` | Vite dev server |
| `npm run build` | Type-check and production build |
| `npm run test:unit` | Unit tests (Vitest) |
| `npm run test:e2e` | End-to-end tests (Cypress) |
| `npm run lint` | ESLint |

### Mobile

```bash
npm run build
npx cap sync
npx cap open android   # or: npx cap open ios
```

The `android/` and `ios/` projects are committed, but the synced web assets are not. Run `npx cap sync` after every build.

## Known security limitations

These are documented openly so that contributors can help fix them:

- **Fixed AES-GCM IV.** A single IV is generated once and reused for every encryption under the same key (`src/utils/webCrypto.ts`). Reusing an IV with AES-GCM breaks its confidentiality and authenticity guarantees. Each encryption needs a fresh random IV, stored alongside its ciphertext.
- **Keys are stored in `localStorage`.** Even when encrypted, this is weak. Use platform secure storage (Keychain / Keystore) on mobile.
- **PBKDF2 uses 50,000 iterations.** OWASP currently recommends about 600,000 for PBKDF2-HMAC-SHA256.
- **Storage encryption is off by default** (`enableStorageEnctyption: false`).
- **Dependencies are about three years old** (Capacitor 5, Ionic 7, ethers v5).

## Contributing

Issues and pull requests are welcome. Please report security problems privately, following [SECURITY.md](SECURITY.md).

## License

[Apache License 2.0](LICENSE)
