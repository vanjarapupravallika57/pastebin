# Pastebin-Lite

A simple, secure, and ephemeral pastebin application built with Next.js and Redis.

## Features
- Create text pastes with optional expiration (TTL).
- Limit view counts (Burn after reading).
- Secure, URL-safe IDs.
- Dark mode UI.
- **Persistence**: Redis (survives serverless cold starts).

## Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Persistence**: Redis (`ioredis`)

## Setup & Running Locally

### Prerequisites
- Node.js 18+
- Redis Server (Optional for local dev, Required for production)

### Installation
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start Redis (optional). If not available, the app falls back to in-memory storage (data will be lost on restart).
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000).

## Persistence Choice
I chose **Redis** as the persistence layer because:
1. **TTL Support**: Native expiration support makes implementing time-based pastes efficient and reliable.
2. **Atomic Counters**: `HINCRBY` and atomic operations allow precise view counting without race conditions.
3. **Performance**: Extremely fast read/write operations suitable for high-traffic paste access.
4. **Serverless Compatibility**: Works well with Vercel KV or Upstash Redis for serverless deployments.

## Design Decisions
- **Next.js App Router**: Leveraged for Server Components (safe rendering) and easy API routes.
- **Lua Scripts**: Used for `getPaste` to ensure checking expiry, view counts, and decrementing views happens atomically.
- **Tailwind CSS**: For rapid, responsive, and beautiful UI development.
- **Test Mode**: Implements `TEST_MODE=1` and `x-test-now-ms` header handling for deterministic expiry testing.
