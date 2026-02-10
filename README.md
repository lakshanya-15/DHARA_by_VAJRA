# Rural Uber for Farm Assets – Backend

MVP backend for a web platform where farmers rent agricultural machinery from verified local operators.

## Tech stack

- **Runtime:** Node.js  
- **Framework:** Express.js  
- **Auth:** JWT  
- **Config:** dotenv  
- **Language:** JavaScript  

Database: **PostgreSQL** via **Prisma**, using the same schema as the `dharaa` folder (shared DB).

## Setup

```bash
npm install
cp .env.example .env
# Edit .env: set JWT_SECRET and DATABASE_URL (PostgreSQL connection string, same as dharaa)
npx prisma generate
npm start
# Or: npm run dev (with --watch)
```

- **DATABASE_URL** must point to the same PostgreSQL database as `dharaa` (e.g. `postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public`).
- Schema is in `prisma/schema.prisma` and matches `dharaa/prisma/schema.prisma`. Run migrations from either place; do not change table/column names if both apps use the DB.

Server runs at `http://localhost:3000` (or `PORT` from `.env`).

## Connecting to the API

The API allows cross-origin requests (CORS). From a frontend or another service:

- **Base URL:** `http://localhost:3000` (or your deployed URL)
- **Auth:** Send the JWT in the header: `Authorization: Bearer <token>`

Example (browser or Node):

```js
const API_BASE = 'http://localhost:3000';

// Login and store token
const res = await fetch(`${API_BASE}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'farmer@test.com', password: 'pass123' }),
});
const { data } = await res.json();
const token = data.token;

// Call a protected endpoint
const assetsRes = await fetch(`${API_BASE}/assets`, {
  headers: { 'Authorization': `Bearer ${token}` },
});
```

To restrict which origins can call the API, set `CORS_ORIGIN` in `.env` (e.g. `http://localhost:5173`). Leave unset to allow all origins (`*`).

## Frontend integration (React)

**→ Full step-by-step tutorial:** [FRONTEND_INTEGRATION.md](FRONTEND_INTEGRATION.md) — use this to wire your React app (env, API client, auth, and every endpoint).

Short reference below.

**1. API base URL**  
In your React app, set the backend URL (env or config), e.g.:
- Local: `http://localhost:3000`
- Production: your deployed backend URL (e.g. `https://your-api.onrender.com`)

**2. Auth**  
- **Register:** `POST /auth/register` with body `{ email, password, name?, role? }`. `role` = `"FARMER"` \| `"OPERATOR"` \| `"ADMIN"`.  
- **Login:** `POST /auth/login` with body `{ email, password }`.  
- Response shape for both: `{ success: true, data: { user: { id, email, name, role }, token } }`.  
- Store `data.token` (e.g. in localStorage or React state/context) and send it on every protected request:  
  `Authorization: Bearer <token>`.

**3. Protected requests**  
For `/assets` (POST), `/bookings`, `/bookings/my`, `/admin/*`, add the header:
```text
Authorization: Bearer <your-stored-token>
```

**4. CORS**  
- Local: if the React app runs on another port (e.g. `http://localhost:5173`), CORS is already allowed by default. To lock it to that origin, set in this backend’s `.env`: `CORS_ORIGIN=http://localhost:5173`.  
- Production: set `CORS_ORIGIN` to your frontend’s deployed URL so only that origin can call the API.

**5. Response convention**  
- Success: `{ success: true, data: <payload> }`.  
- Error: `{ success: false, error: "<message>" }`.  
- Use `data` for lists and single resources (e.g. `GET /assets` → `data` is an array of assets).

**6. Request bodies (POST)**  
- Register: `{ email, password, name?, role? }` — `role`: `"FARMER"` \| `"OPERATOR"` \| `"ADMIN"`.  
- Login: `{ email, password }`.  
- Create asset (OPERATOR): `{ name, hourlyRate, type?, description? }`.  
- Create booking (FARMER): `{ assetId, startDate, endDate, notes? }`.

## API overview

| Method | Endpoint           | Auth   | Role      | Description              |
|--------|--------------------|--------|-----------|--------------------------|
| POST   | `/auth/register`   | No     | -         | Register (body: email, password, optional name, role) |
| POST   | `/auth/login`      | No     | -         | Login (body: email, password) |
| GET    | `/assets`          | No     | -         | List assets (public)     |
| POST   | `/assets`          | JWT    | OPERATOR  | Create asset             |
| POST   | `/bookings`        | JWT    | FARMER    | Create booking           |
| GET    | `/bookings/my`     | JWT    | FARMER/OPERATOR | My bookings (role-based) |
| GET    | `/admin/users`     | JWT    | ADMIN     | List all users           |
| GET    | `/admin/assets`    | JWT    | ADMIN     | List all assets          |
| GET    | `/admin/bookings`  | JWT    | ADMIN     | List all bookings        |

**Auth header:** `Authorization: Bearer <token>`

## Testing the API

- **In the browser:** Only `GET /`, `GET /health`, and `GET /assets` return data. Visiting `GET /auth/register` or `GET /auth/login` returns **405** with a hint to use POST.
- **POST endpoints** need a JSON body and `Content-Type: application/json`. Use [Postman](https://www.postman.com/), [Insomnia](https://insomnia.rest/), or `curl`:

```bash
# Register
curl -X POST http://localhost:3000/auth/register -H "Content-Type: application/json" -d "{\"email\":\"op@test.com\",\"password\":\"pass123\",\"role\":\"OPERATOR\"}"

# Login (copy the token from the response)
curl -X POST http://localhost:3000/auth/login -H "Content-Type: application/json" -d "{\"email\":\"op@test.com\",\"password\":\"pass123\"}"

# List assets (no auth)
curl http://localhost:3000/assets

# Create asset (OPERATOR; use token from login)
curl -X POST http://localhost:3000/assets -H "Content-Type: application/json" -H "Authorization: Bearer YOUR_TOKEN" -d "{\"name\":\"Tractor\",\"hourlyRate\":50}"
```

If you get **404**, check the URL and HTTP method; the 404 response includes a `hint` with valid paths.

## Project structure

```
src/
├── app.js           # Express app, routes, error handler
├── server.js        # Entry point
├── config/          # Env config (no secrets in code)
├── routes/          # Auth, assets, bookings, admin
├── controllers/     # Request handlers
├── middlewares/     # JWT auth, role check, error handler
├── services/        # Prisma-backed (User, Asset, Booking)
└── utils/           # Response helpers, validation
```

## Security

- Passwords hashed with bcrypt  
- JWT middleware on protected routes  
- Role middleware for OPERATOR/FARMER/ADMIN  
- Errors sanitized (no stack in production)  
- No hardcoded secrets (use `.env`)  

## Database (dharaa)

- The backend uses **Prisma** with the schema in `prisma/schema.prisma`, which mirrors `dharaa/prisma/schema.prisma` so both use the same PostgreSQL database.
- **Config:** `src/config/prisma.js` exports the Prisma client singleton.
- **Mapping:** API uses `hourlyRate` and `startDate`/`endDate`; the DB has `priceperday` and `bookingdate` (single date). Services map between them; `description` and `endDate`/`notes` are not stored in the current schema.
- To apply migrations (from dharaa or here), run `npx prisma migrate deploy` or use your existing migration workflow.
