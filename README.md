# WARIDI REAL ESTATE BACKEND

## Overview
This is a real estate mobile application that connects users to LandLords, Property Owners and a possibility of becoming a tenant. It also connects users to users to come to  an agreement if they can be on a budget to co-exist or become room mates.

## Requirements

- Node.js 20 or newer (`node --version`)
- PostgreSQL
- Redis
- RabbitMQ (email delivery, see [Email delivery](#email-delivery))
- MongoDB (posts and chat messages; the rest of the API runs without it)

## Quick start

1. `npm install --legacy-peer-deps`
2. Create an empty Postgres database (default name `waridi`): `CREATE DATABASE waridi;`
3. Copy `env.example` to `.env` and set at least `JWT_TOKEN`, `JWT_REFRESH_TOKEN` and `DATABASE_PASSWORD` (generate secrets with `openssl rand -hex 32`). `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_USER` and `DATABASE_NAME` default to `localhost`, `5432`, `postgres` and `waridi`; `MONGO_URI` defaults to `mongodb://localhost:27017/waridi` and `REDIS_URL` to `redis://localhost:6379`.
4. `npm run dev:server`

The server refuses to start when a required setting is missing and names it. In production (`NODE_ENV=production`) `REDIS_SESSION_SECRET` and `DATABASE_PASSWORD` are required too.

Startup applies any pending database migrations, which also create the roles (USER, AGENT, LANDLORD, SALES, ADMIN, SUPERADMIN). Google sign-in is turned on only when `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set; Facebook sign-in is not wired up yet. Both answer 503 until configured. Place search (`/search-apartment`, `/search-property`) needs `API_KEY` and `PLACES_API_ENDPOINT` and answers 503 without them.

Push notifications need a Firebase service account key: get it from an administrator and set `FIREBASE_SERVICE_ACCOUNT_PATH` to its location (default `waridi-793c4-firebase-adminsdk-4z45i-cf675a6b0d.json` in the project root). Without it the server starts with push notifications disabled. Never commit this file or `.env`.

## Database migrations

Migrations live in `migrations/*.cjs` and run in file-name order. Startup applies the pending ones; you can also run them by hand:

- `npm run db:migrate`: apply pending migrations
- `npm run db:migrate:status`: list applied and pending migrations
- `npm run db:migrate:undo`: undo the last one

To change the schema, change the model and add a new migration file named `YYYYMMDDHHMMSS-what-it-does.cjs` that exports `up(queryInterface, Sequelize)` and `down(queryInterface, Sequelize)`. Never edit a migration that has already run somewhere.

The first migration creates any missing tables from the models, so it is safe on a database created before migrations were committed; the next ones bring such a database up to date.

## Running tests

Tests drop and recreate tables, so they only run against a database whose name ends in `_test` (default `waridi_test`; override with `TEST_DATABASE_NAME`). They also need Redis.

1. Create the test database once: `CREATE DATABASE waridi_test;`
2. `npm test`

The connection uses the same `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_USER` and `DATABASE_PASSWORD` as the app. GitHub Actions runs the tests, an API-docs check and a gitleaks secret scan on every pull request (`.github/workflows/ci.yml`).

## Request validation

Every route that reads a request body checks it against a zod schema in `src/validation/schemas.js` before the handler runs (`validateBody` in the router). Invalid bodies get a 400:

```json
{ "message": "Invalid request body", "errors": [{ "field": "email", "message": "must be a valid email" }] }
```

Fields a route does not accept are dropped, strings are trimmed, and form fields (upload routes) are converted to numbers where the schema expects one. New passwords (signup, reset, change) need at least 8 characters. When you add a route that reads a body, add its schema too: `tests/validation.test.js` fails otherwise.

## Logging

Logs are JSON lines written by pino (`src/config/logger.js`), at the level set by `LOG_LEVEL` (default `info`). Every request is logged once when it finishes, with a request id that is also returned in the `X-Request-Id` response header (or taken from that request header when a proxy sets it). Errors logged while handling a request carry the same id, so a client's report can be matched to the server's logs. Authorization headers, cookies, passwords and tokens are redacted. For readable output while developing: `npm run dev:server | npx pino-pretty`.

## API docs

Swagger UI is served at `/swagger-ui`. `swagger-output.json` is generated from the mounted routes and their body schemas: after adding or changing a route, run `npm run swagger-autogen` and commit the result. CI fails when it is out of date.

## Email delivery

This server does not send email itself. Signup, agent login and forgot-password publish a job to the RabbitMQ queue named by `EMAIL_QUEUE`, and a separate consumer service sends it. Without a running consumer, users never receive their OTP codes.

Each job is a persistent JSON message:

```json
{ "to": "user@example.com", "subject": "Verify Your Waridi Account", "html": "<rendered email>", "text": "Plain-text version" }
```

The queue is declared durable with a 60-second message TTL; expired or rejected messages go to the `email-dlx` exchange with routing key `DEAD_LETTER_QUEUE`. The consumer must declare the queue with the same arguments, send the email (for example with nodemailer), then acknowledge the message.

If RabbitMQ is down, signup answers 500 and saves nothing, so the person can sign up again once it is back.

## API changes for the mobile app

These routes changed in the Phase 2 fixes (see `DEVELOPMENT_CHECKLIST.md`). Writes need a token and are allowed only for the owner of the apartment or property, or an admin.

| Before | Now |
| --- | --- |
| `POST /api/v1/addproperties` | `POST /api/v1/apartment-properties` (`apartment_id` in body) or `POST /api/v1/property-properties` (`property_id`) |
| `GET /api/v1/allproperties`, `GET /api/v1/properties/:id` | `GET /api/v1/apartment-properties[/:id]` or `GET /api/v1/property-properties[/:id]` |
| `POST /api/v1/addfacility` | `POST /api/v1/apartment-facilities` or `POST /api/v1/property-facilities` |
| `GET /api/v1/allfacilities`, `GET /api/v1/facilities/:id` | `GET /api/v1/apartment-facilities[/:id]` or `GET /api/v1/property-facilities[/:id]` |
| `POST /api/v1/addlocation`, `GET /api/v1/alllocations`, `/locations`, `/location/:id` (property locations) | `POST /api/v1/property-locations`, `GET /api/v1/property-locations[/:id]` |
| `GET /api/v1/update/:id` | `PUT /api/v1/<prefix>/:id` |
| `GET /api/v1/deleteproperty/:id`, `/deletefacilities/:id`, `/deletefacility/:id`, `/deletelocation/:id` | `DELETE /api/v1/<prefix>/:id` |
| `GET /api/v1/location/update/:id`, `GET /api/v1/location/deletelocation/:id` | `PUT` / `DELETE /api/v1/location/locations/:id` |
| `GET /api/v1/property/:agent_id` | `GET /api/v1/property/agent/:agent_id` |
| `GET /api/v1/allapartment/`, `GET /api/v1/allproperty/` (trailing slash) | `GET /api/v1/allapartment`, `GET /api/v1/allproperty` |
| `POST /api/v1/forgotpassword` answered 401 for unknown emails | Always 200; then `POST /api/v1/resetpassword` with `email`, `code`, `password`, `confirm_password` |
| `POST /api/v1/create-message` used `senderId` from the body | The sender is the logged-in user |
| `GET /api/v1/agent-documents` returned one document by an id it never received | Returns the logged-in agent's documents |
| `POST /api/v1/send-connection-request` used `currentUserId` from the body | The sender is the logged-in user; send only `selectedUserId` |
| `POST /api/v1/receive-connection-request` used `senderId` and `recepientId` from the body | The logged-in user accepts; send only `senderId` |
| `POST /api/v1/token/store-device-token` used `userId` from the body | The device is registered for the logged-in user |
| `GET /api/v1/token/?userId=` matched any id containing the digits | Exact match; only that user or an admin; no `userId` means your own |
| `POST /api/v1/property/addfiles` with `apartment_id` and `uploaded_by` | `property_id` (`apartment_id` still accepted); the uploader is the logged-in user |
| `PUT /api/v1/agent-profile/:id` with `agent_name`, `agent_email`, `agent_phone` (never saved) | `agent_fname`, `agent_lname`, `agent_mname`, `agent_phonenumber`, `agent_gender`, `agent_description` |
| Any body | Checked against a schema: invalid bodies get 400 with the failing fields (see Request validation) |

The list routes accept `?apartment_id=` or `?property_id=` to return only one listing's records.
