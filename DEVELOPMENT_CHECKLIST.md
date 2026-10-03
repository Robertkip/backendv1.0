# Waridi Backend: Development Checklist

Work top to bottom. Each phase makes the next one safer. Tick an item only when its **Done when** check passes.

Source of these items: a fresh-clone run of branch `remove-committed-secrets` on 2026-10-02 (Node 26, Postgres 17, Redis, MongoDB, RabbitMQ) that registered a user, logged in, and called every mounted `GET` route with a valid token. `POST`, `PUT` and `DELETE` routes, GraphQL, gRPC, sockets and file uploads were **not** tested yet (see Phase 4).

---

## Phase 0: Secrets (do first)

- [ ] **Rotate every leaked credential.** The repo and its upstream `Waridi-RE/backendv1.0` are public, so all of these are compromised:
  - [ ] Firebase service-account keys, all of them, in projects `waridi-793c4` and `waridi-598ea` (Google Cloud → IAM → Service Accounts → Keys)
  - [ ] Postgres passwords `waridi123` and `postgres123` on `62.171.172.146`; also confirm port 5432 is not open to the internet
  - [ ] SSH key `yes` (`SHA256:F4bxhUyYPEzZoar7U5d503XeTj9IM4Z2ZQr5EcV32Eo`): remove it from `authorized_keys` on every server
  - [ ] Twilio auth token
  - [ ] Google Maps API key, then restrict it to the APIs you use
  - [ ] Google OAuth client secret
  - [ ] Facebook app secret
  - [ ] Cloudinary API key
  - [ ] Gmail refresh token (revoke at myaccount.google.com/permissions)
  - [ ] TextFlow key and SMS API key
  - [ ] `JWT_TOKEN`, `JWT_REFRESH_TOKEN`, `REDIS_SESSION_SECRET` (generate with `openssl rand -hex 32`)
  - **Done when:** every new value is in the production `.env`, the app restarts cleanly, and the old values are rejected by each provider.
- [ ] **Merge branch `remove-committed-secrets`** into `backendv1.2` through a PR.
  - **Done when:** `git ls-files | grep -E '^yes|adminsdk'` prints nothing on `backendv1.2`.
- [ ] **Decide on history cleanup** with your collaborators (rewriting history needs a force-push and breaks existing clones). Optional once Phase 0 rotation is complete.

---

## Phase 1: Critical security bugs

Fixed on branch `fix/auth-security`, covered by [tests/auth.test.js](tests/auth.test.js), [tests/routeAuth.test.js](tests/routeAuth.test.js) and [tests/ownership.test.js](tests/ownership.test.js).

- [x] **Anyone can sign up as ADMIN or SUPERADMIN.** Signup now accepts only USER, AGENT and LANDLORD; any other `roleId` becomes USER. Grant staff roles some other way.
- [x] **Anyone can skip email verification.** Signup now ignores `verified` and `active` from the request body.
- [x] **The password hash can be used as the password.** A stored hash is never accepted as a password. Accounts that still hold a plain-text password can log in once, and the password is then stored hashed.
- [x] **Password hashes are leaked.** Login tokens no longer contain `password`. The `User` model hides `password`, `confirm_password`, `accessToken` and the reset-token fields from every query by default; code that must check a password uses `User.scope("withPassword")`.
- [x] **SQL injection in `GET /api/v1/get-single-user`.** The `id` query parameter was pasted into raw SQL. It now must be a number (otherwise 400) and matches that exact id. (Before, `?id=1` also returned users 10, 11, 12, and so on.)
- [x] **Add login checks to routes.** Every route now requires a token except the list in `PUBLIC_ROUTES` in [tests/routeAuth.test.js](tests/routeAuth.test.js): signup, login, OTP verification, forgot password, social login, and read-only browsing of apartments, the market, facilities, properties (amenities), locations and roles. Each route declares `Authenticated` itself; the cart router's `router.use(Authenticated)`, which silently applied to every router mounted after it, is gone. Route mounting moved to [src/routers/index.js](src/routers/index.js).
  - Note: `/allproperty`, `/properties`, `/lands`, `/property/:id` and `/rating/:itemId` already needed a token in production (because of the cart catch-all) and still do. Make them public by adding them to `PUBLIC_ROUTES` if you want that.
- [x] **Check ownership on update and delete.** Only the owner or an ADMIN/SUPERADMIN can change these, otherwise 403 (shared logic in [src/helpers/ownership.js](src/helpers/ownership.js)):
  - apartments (`agent_id`, or the user behind `landlord_id`), properties (`agent_id`, now recorded when a property is created; older properties without one are admin-only), market products (`sellerId`)
  - agent profiles, agent documents and agent locations (the agent profile's `user_id`), apartment comments (`user_id`), payment plans (owner of the apartment)
  - password, profile image and profile (`PUT /changepassword/:id`, `PUT /user/:id`, `PUT /updateprofile/?id=`): only that user or an admin
  - `POST /role` is admin-only again (its checks had been commented out)
- [ ] **Decide who may edit reference data.** Facilities, apartment/property amenities and locations (`/addfacility`, `/addproperties`, `/addlocation`, and the `GET /update/:id` and `GET /delete…/:id` routes) have no owner field, so any logged-in user can change or delete them. Make them admin-only, or add an owner column.

---

## Phase 2: Bugs found by the GET sweep

### 2a. Requests that crash the whole server (one request takes the API down)

- [ ] **Add a safety net first.** Express 4 does not catch errors thrown in `async` handlers. Add a shared async-error wrapper (or move to Express 5) plus a final error-handling middleware in [index.js](index.js).
  - **Done when:** a handler that throws returns a 500 and the server keeps running.
- [ ] `GET /api/v1/search-apartment` crashes with `ReferenceError: API_KEY is not defined`. It uses `API_KEY`, `PLACES_API_ENDPOINT` and `PLACES_SEARCH_API_ENDPOINT` without `process.env.`, has no try/catch, and its `findAll` is missing `where:`.
  - Where: [apartmentControllers.js:248](src/controllers/apartmentControllers.js#L248), [apartmentControllers.js:282](src/controllers/apartmentControllers.js#L282)
- [ ] `GET /api/v1/search-property` crashes with `TypeError: Invalid URL` when the Places env vars are unset. Return a clear error instead.
- [ ] `GET /api/v1/marketproducts/:sellerId` crashes with `ReferenceError: res is not defined`. The handler signature is `async ()`, and `findOne` is not awaited.
  - Where: [marketController.js:45](src/controllers/marketController.js#L45)
- [ ] `GET /api/v1/property/:id` and `GET /api/v1/property/:agent_id` crash with `ERR_HTTP_HEADERS_SENT`, because the handler sends two responses.
  - Where: [apartmentControllers.js:168](src/controllers/apartmentControllers.js#L168)
- [ ] `/property/:id` and `/property/:agent_id` are the same path, so the second route can never be reached. Rename one of them.
  - Where: [propertyRoute.js:17](src/routers/propertyRoute.js#L17), [propertyRoute.js:23](src/routers/propertyRoute.js#L23)
- [ ] `PUT /api/v1/updateprofile/` and `PUT /api/v1/user/:id` crash with `ReferenceError: PRODUCTION_IMAGE_ADDRESS is not defined`, and also crash when no file is uploaded (`req.file.filename`). Only a logged-in owner can reach them now, but the owner's own request still crashes the server.
  - Where: `updateUserProfile` and `changeImage` in [authController.js](src/controllers/authController.js)
- [ ] `POST /api/v1/property` outside production calls Google geocoding and then sends two responses (`ERR_HTTP_HEADERS_SENT`). In every branch, a failed save is swallowed and still answered with 201. The development branches also hard-code LAN image URLs (`http://192.168.1.120:8084`, `http://192.168.0.37:8084`).
  - Where: `uploadApartment` in [propertyController.js](src/controllers/propertyController.js)

### 2b. Requests that never respond (client waits forever)

- [ ] `POST /api/v1/forgotpassword` never responds when `email` is missing (the query runs outside its `try`), and when the email exists it calls `sendOtpVerification`, which uses an undefined `transporter`. Forgot-password does not work at all today.
  - Where: `forgotPassword` and `sendOtpVerification` in [authController.js](src/controllers/authController.js)

- [ ] `GET /api/v1/landlorduser/:userId`: when there is no match, nothing is sent. Return 404.
  - Where: [landlordController.js:44](src/controllers/landlordController.js#L44)
- [ ] `GET /api/v1/tenantuser/:userId`: same problem.
  - Where: [tenantController.js:62](src/controllers/tenantController.js#L62)
- [ ] `GET /api/v1/rating/:itemId`: the Redis v4 client is never connected, and its callback API no longer exists. Use the promise API, and guard against division by zero when there are no ratings.
  - Where: [ratingController.js:9](src/controllers/ratingController.js#L9)
- [ ] `getLandlordById` reads `req.params.userId`, but the route parameter is `:id`, and it calls `next()` after responding.
  - Where: [landlordController.js:59](src/controllers/landlordController.js#L59)

### 2c. 500 errors

- [ ] `GET /api/v1/agent-comment/:id`, `/agent-comments/:agentId`, `/agent-documents/:id` and `/agent-documents` all fail with `UserProfile is not defined`. The import is missing in [agentCommentController.js](src/controllers/agentCommentController.js) and [agentDocumentsController.js](src/controllers/agentDocumentsController.js).
- [ ] `GET /api/v1/allproperties` and `/allfacilities` query `where: { active: true }`, but the `apartment_properties` and `rental_facilities` models have no `active` column.
- [ ] `GET /api/v1/allcart` fails because its raw SQL uses `"CartItems"`, while the model's table is `cartitems`. Use the model or fix the table name.
  - Where: [cartItemController.js:78](src/controllers/cartItemController.js#L78)
- [ ] `GET /api/v1/apartmentaccount/:logent_id` uses the wrong parameter name (`landlord_id` is undefined).
  - Where: [apartmentRoute.js:24](src/routers/apartmentRoute.js#L24)
- [ ] `GET /api/v1/propertyaccount/:logent_id` fails because column `property.logent_id` does not exist.
  - Where: [propertyRoute.js:19](src/routers/propertyRoute.js#L19)
- [ ] `GET /api/v1/get-messages/`: when `senderId` or `receiverId` is missing, it returns 500 instead of 400.
  - Where: [messageController.js:37](src/controllers/messageController.js#L37)
- [ ] `GET /api/v1/get-connections/`: 500, because its raw SQL reads the tables `"Connections"` and `"Users"`, but the real tables are `connections` and `users`.
  - Where: [authController.js:811](src/controllers/authController.js#L811)
- [ ] `GET /api/v1/location/alllocations` and `/location/locations`: 500 when called with query parameters. Investigate `buildLocationWhere`.
  - Where: [locationController.js:65](src/controllers/locationController.js#L65)
- [ ] The delete-by-GET routes (`/deleteproperty/:id`, `/deletefacilities/:id`, `/deletefacility/:id`, `/deletelocation/:id`) return 500. Investigate them as part of 2e.
- [ ] Several handlers catch errors and send only `"Internal server error"`, which hides the cause. Log the real error on the server for every 500.
- [ ] `DELETE /api/v1/apartment/delete/all`, `/property/delete/all` and `/market/delete/all` are unreachable: the `/delete/:id` route is declared first and treats `all` as an id. Declare `/delete/all` first.
- [ ] `apartment_comments.user_id` and `agent_comments.user_id` have a foreign key to `userprofiles.id`, but the code stores the user's id (`users.id`). It only works while both ids happen to match. Point the foreign key at `users.id`.
- [ ] `PUT /api/v1/cart/:id` reads `req.params.itemId` and `req.user.userId`, which are both undefined, so it always returns 404.
  - Where: `updateQuantity` in [cartItemController.js](src/controllers/cartItemController.js)

### 2d. Route typos (unreachable endpoints)

- [ ] Change `"/apartment-comment:/id"` to `"/apartment-comment/:id"` in [apartmentCommentRoute.js:8](src/routers/apartmentCommentRoute.js#L8). This is the Dynamic Comment Section feature.
- [ ] Change `"/user-connections:/id"` to `"/user-connections/:id"` in [authRoute.js:40](src/routers/authRoute.js#L40).
- [ ] Change `"/role:/id"` to `"/role/:id"` in [roleRoute.js:15](src/routers/roleRoute.js#L15).

### 2e. Shadowed routes (second router never runs)

These routers are all mounted on `/api/v1` and define the same paths, so only the first one mounted ever handles the request:

- [ ] `/addproperties`, `/allproperties`, `/properties/:id`: `apartmentPropertiesRoute` shadows `propertyPropertiesRoute`
- [ ] `/addfacility`, `/allfacilities`, `/facilities/:id`: `facilitiesRoute` shadows `propertyFacilitiesRoute`
- [ ] `/update/:id` is shared by four routers
- [ ] **Fix:** give each router its own prefix (for example `/api/v1/property-facilities`) and update the mobile app's URLs to match.
- [ ] Change update and delete routes from `GET` to `PUT` and `DELETE`.
- **Done when:** a dump of the route table shows no duplicate method+path pairs.

### 2f. Everything in Phase 2

- **Done when:** a sweep of every `GET` route with a valid token gives no crashes, no timeouts and no 500s. Only 200, 400, 401, 403 or 404 are acceptable.

---

## Phase 3: Infrastructure to create

- [ ] **Automated tests.** `npm test` currently runs the command `test`, which does nothing.
  - [x] Add a test runner and a test database: Vitest and Supertest, `npm test`, database `waridi_test` (see README → Running tests).
  - [ ] Turn the Phase 1 and Phase 2 "Done when" checks into tests, so they never break again.
  - [ ] Add a smoke test that starts the app and calls every route (like the sweep used to build this list).
- [ ] **CI.** Add a GitHub Actions workflow that runs install, the tests and a secret scan (for example gitleaks) on every PR.
- [ ] **Database migrations.** `migrations/` is gitignored, and startup falls back to `sequelize.sync()`, which never updates existing tables. Commit real migrations and stop ignoring the folder.
- [ ] **Email delivery.** Signup and agent login only publish to RabbitMQ. A separate consumer service must send the emails.
  - [ ] Document or add the consumer service.
  - [ ] Add `RABBITMQ_HOST`, `RABBITMQ_PORT`, `RABBITMQ_USER`, `RABBITMQ_PASS`, `RABBITMQ_VHOST`, `EMAIL_QUEUE` and `DEAD_LETTER_QUEUE` to [env.example](env.example).
  - [ ] If RabbitMQ is down, signup retries for about 25 seconds and then returns 500 after the user row is already saved, so that person can never sign up again. Wrap signup in a transaction, or create the user only after the email job is accepted.
- [ ] **Configuration check at startup.** Fail fast with a clear message when a required variable is missing. `JWT_TOKEN` and `JWT_REFRESH_TOKEN` are required: login breaks without them.
- [ ] **Input validation** on every request body (for example zod or express-validator), instead of ad-hoc checks.
- [ ] **Rate limiting** on `/signin`, `/signup`, `/verify` and `/forgotpassword`.
- [ ] **Structured logging.** Remove `console.log` of tokens, user objects and API responses (for example in the `Authenticated` middleware).
- [ ] **API docs.** Regenerate `swagger-output.json` after the route fixes, and keep it in sync from CI.

---

## Phase 4: Untested areas (sweep them next)

- [ ] All `POST`, `PUT` and `DELETE` routes, with realistic request bodies: create, then read, update and delete each resource
- [ ] File uploads: apartment and property files, agent documents, post media, profile images
- [ ] GraphQL at `/graphql`, with and without a token
- [ ] gRPC `PostService` (`CreatePost`, `GetTimeline`) on port 50051
- [ ] Socket.IO: chat, live location on port 8085, and `connectSocket`
- [ ] Agent and landlord onboarding and the OTP login flow (`/verify-agent-login`)
- [ ] Push notifications with a valid Firebase key
- [ ] Google and Facebook sign-in with real credentials

---

## Phase 5: Cleanup

- [ ] `app.use(express.json())` at [index.js:81](index.js#L81) runs before the `800mb` limit at [index.js:163](index.js#L163), so the larger limit never applies. Keep one parser and pick a deliberate limit; 800 MB is very large.
- [ ] The cookie session `maxAge` at [index.js:158](index.js#L158) is `24 * 60 * 60 * 100`, which is 2.4 hours, not 24 hours.
- [ ] Remove unused dependencies that shadow Node built-ins (`fs`, `http`, `path`, `url`, `util`, `crypto`) and the stray `npm` and `install` packages from [package.json](package.json).
- [ ] Delete dead code: `agentRoute.js`, `chatRouter.js` and `rentalPriceRoute.js` are not mounted; also remove large commented-out blocks.
- [ ] Remove `dump.rdb` (a Redis data dump) and `.DS_Store` from the repo.
- [ ] Tidy the README setup steps. The old Sequelize CLI section, which switches `"type": "module"` back and forth, conflicts with the quick start.
