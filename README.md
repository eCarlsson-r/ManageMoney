# ControlMoney

ControlMoney is a simple, offline-first personal finance and bookkeeping app built with Expo + React Native. Track transactions in separate “books”, view balances at a glance, and manage your books—all stored locally on your device using SQLite.

## Highlights

- Offline-first storage with SQLite (no account required)
- Multiple books/accounts, each with its own currency
- Add and edit transactions with date picker support
- Dashboard tab with quick actions, recent activity, and per-book balances
- Bottom tab navigation via Expo Router

## Tech stack

- Expo + React Native
- Expo Router (file-based routing + typed routes)
- `expo-sqlite` for local persistence
- React Native Paper for UI components

## Getting started

### Prerequisites

- Node.js (recommended: current LTS)
- npm (or your preferred package manager)
- Expo tooling (`npx expo` is enough for most workflows)

### Install

```bash
npm install
```

### Run

```bash
npx expo start
```

Then open in:

- Android emulator/device
- iOS simulator/device
- Web (Expo web)

## Project structure (high level)

- `app/(tabs)/dashboard` — dashboard tab (overview + quick actions)
- `app/(tabs)/bookkeeping` — select book + ledger screens
- `app/(tabs)/managebooks` — create/update/delete books
- `db/handler.ts` — SQLite schema + queries

## Data & privacy

All data is stored locally on-device in a SQLite database. There is currently no cloud sync, login, or remote analytics built in.

## Roadmap ideas

- Search/filter transactions and books
- Export/backup (CSV/JSON) and restore
- Recurring transactions and reminders
- Charts and trends (month-to-date, category breakdowns)
- Biometric lock / app passcode

## Contributing

Issues and PRs are welcome. If you’re proposing a larger feature, open an issue first so we can align on scope and UX.
