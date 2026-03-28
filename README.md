# Remesh Software Engineer Take Home

Simplified Remesh-style application built with Node.js, React, and PostgreSQL in a single repository.

## Stack

- Backend: Node.js, Express, Prisma
- Frontend: React, Vite
- Database: PostgreSQL
- Tests: Vitest, Supertest, React Testing Library

## Features

- Create conversations with a title and start date
- Edit and delete conversations
- Create messages under a conversation
- Edit and delete messages
- Create thoughts under a message
- Edit and delete thoughts
- View a conversation list
- View a conversation detail page with messages and nested thoughts
- Search conversations by title
- Search messages by content within a conversation
- Search thoughts by content within each message card
- Expand and collapse message cards
- Handle non-happy paths such as invalid IDs, malformed JSON, empty input, invalid dates, parent-not-found cases, and empty states

## Repo Structure

- `shared/`: shared API types and Zod schemas used by both client and server
- `server/`: Express API, Prisma schema, migrations, backend tests
- `client/`: React app, frontend tests

## Prerequisites

- Node.js 20+ recommended
- npm 10+ recommended
- PostgreSQL 14+ recommended

## Environment Variables

Copy [server/.env.example] to `server/.env` and set your database URL:

```bash
cp server/.env.example server/.env
```

Example:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/remesh_take_home?schema=public"
```

Backend tests automatically derive a separate test database URL by appending `_test` to the database name in `DATABASE_URL`. You only need to set `TEST_DATABASE_URL` manually if you want to override that default.

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create the database in Postgres if it does not already exist:

```bash
createdb remesh_take_home
```

If `createdb` is not available, create it from `psql`:

```sql
CREATE DATABASE remesh_take_home;
```

3. Generate the Prisma client:

```bash
npm --workspace server run prisma:generate
```

4. Run the database migration:

```bash
npm --workspace server run prisma:migrate -- --name init
```

5. Optional: seed example data:

```bash
npm --workspace server run seed
```

6. Start the backend:

```bash
npm --workspace server run dev
```

The API will run at `http://localhost:4000`.

7. In a second terminal, start the frontend:

```bash
npm --workspace client run dev
```

The UI will run at the Vite URL shown in the terminal, typically `http://localhost:5173`.

## Running Tests

Run the full test suite:

```bash
npm run test
```

This runs:

- backend route/unit tests
- backend Postgres-backed integration tests against a separate test database
- frontend component tests

Run backend tests only:

```bash
npm --workspace server run test
```

Run frontend tests only:

```bash
npm --workspace client run test
```

Run optional Playwright smoke tests:

```bash
npm run test:e2e
```

Note: Playwright smoke tests assume browsers are installed locally. If needed:

```bash
npx playwright install chromium
```

## Production Build

Build both apps:

```bash
npm run build
```

## API Endpoints

- `GET /api/health`
- `GET /api/conversations?search=...`
- `POST /api/conversations`
- `PATCH /api/conversations/:id`
- `DELETE /api/conversations/:id`
- `GET /api/conversations/:id?messageSearch=...`
- `POST /api/conversations/:id/messages`
- `PATCH /api/messages/:id`
- `DELETE /api/messages/:id`
- `POST /api/messages/:id/thoughts`
- `PATCH /api/messages/thoughts/:id`
- `DELETE /api/messages/thoughts/:id`

## Architecture Notes

- Shared request/response types and validation schemas live in `shared/` so the client and server do not drift on payload shape or field rules.
- The database uses explicit relational modeling:
  - `conversations -> messages -> thoughts`
- The conversation detail endpoint returns nested messages and thoughts to keep the frontend thin and avoid request fan-out.
- Search is case-insensitive.
- Validation is enforced server-side for route params, query strings, and request bodies.
- The frontend uses TanStack Query for request caching, mutation invalidation, and async state handling.
- The frontend also performs lightweight client-side validation for a faster feedback loop, using the same schema rules as the backend after local date conversion.
- Empty states, loading states, and API error states are rendered explicitly rather than falling through to blank screens.
- Backend service logic is split by domain instead of a single service module:
  - conversations
  - messages
  - thoughts

## Testing Notes

Backend coverage includes:

- successful route handling
- validation errors
- malformed UUIDs
- malformed JSON
- not-found service errors
- search query validation
- service-layer trimming and parent-not-found cases
- Postgres-backed integration tests for real create/list/detail flows

Frontend coverage includes:

- empty states
- successful form submissions
- backend error display
- client-side validation blocking invalid submits
- invalid conversation ID handling
- detail-page rendering and nested thought rendering
- conversation edit and delete flows
- message edit and delete flows
- thought edit and delete flows
- thought creation flow
- message-search empty state behavior
- thought-search empty state behavior
- message-card expand/collapse behavior

Playwright smoke coverage includes:

- creating a conversation through the real UI
- opening the created conversation detail page
- client-side validation on the conversation form

## Tradeoffs

- Styling is intentionally lightweight and submission-focused rather than product-complete.
- Authentication and authorization are intentionally omitted because the assignment explicitly says not to include them.
- Editing and deletion were implemented as extra functionality beyond the minimum requirements.
- Pagination is not included because the take-home requirements focus on correctness and relationships rather than large-scale listing behavior.

## AI Usage

AI was used as a coding assistant for:

- architecture planning
- identifying edge cases
- generating initial scaffolding
- suggesting tests and refactors
- tightening README structure

The generated output was manually reviewed and revised before being kept. In particular, validation boundaries, route behavior, Prisma modeling, frontend UX, and tests were corrected and expanded manually.

Example prompt themes:

- design a single-repo Node.js + React + Postgres take-home app around conversations, messages, and thoughts
- enumerate non-happy paths and missing validation cases
- propose a test plan for backend and frontend core flows

Challenges encountered while using AI:

- initial scaffolding was too thin on edge cases
- some generated code needed restructuring to fit Express and Prisma cleanly
- validation and test behavior needed manual tightening after real execution against the project environment
