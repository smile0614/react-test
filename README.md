# Device & Player Management (Test Task)

Tech stack: React 18 + TypeScript + Vite, React-Bootstrap, Bootstrap 5, React-Toastify.

## Run locally

```bash
npm install
npm run dev
```

Open the printed local URL. Styling is loaded from `bootstrap` in node_modules via Vite.

## Notes
- API is mocked in `src/services/api.ts` to simulate the Swagger endpoints:
  - `GET /a/devices/` → `api.getDevices()`
  - `GET /a/devices/{device_id}/` → `api.getDevice(id)`
  - `POST /a/devices/{device_id}/place/{place_id}/update` → `api.updateBalance(deviceId, placeId, delta)`
  - `GET /time` → `api.getTime()`
- Balances are kept in minor currency units (e.g., cents) as integers to avoid floating-point rounding errors.
- Validation restricts amounts to max 2 decimal places via regex and input-mode decimal.

## Why 2-decimal validation matters (comment)
In real financial apps, money should never be handled with binary floating-point because it produces rounding artifacts (e.g., 0.1 + 0.2 ≠ 0.3). Accepting more than two decimals for currencies like USD/EUR leads to mismatches between UI, business rules, and ledger storage (usually integer minor units). The validation prevents impossible amounts from ever reaching the backend and aligns input with ledger precision.

## Bonus features
- Keypad (pinpad) for quick entry (`src/components/PinPad.tsx`).
- Simple fade-in animation using Bootstrap's `fade show` classes for player rows.

## Project structure (key files)
- `src/App.tsx` — layout, device loading, time badge
- `src/components/DevicesList.tsx` — device list
- `src/components/PlayersPanel.tsx` — players table and operations
- `src/components/PinPad.tsx` — optional keypad
- `src/services/api.ts` — mock API and in-memory data

