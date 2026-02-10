# Step-by-step: Integrate your React frontend with this backend

This guide assumes your React app lives in a **separate folder or repo**. Follow the steps in order.

---

## Prerequisites

- This backend runs and works (see [README](README.md#setup)).
- You have a React app (Vite, Create React App, or Next.js).
- Backend is reachable at `http://localhost:3000` (or your chosen URL).

---

## Step 1: Start the backend

In **this project** (the backend):

```bash
cd path/to/project1
npm install
cp .env.example .env
# Edit .env: set DATABASE_URL and JWT_SECRET
npx prisma generate
npm start
```

Leave this terminal running. The API will be at **http://localhost:3000**.

---

## Step 2: Set the API base URL in your React app

In your **React project**, create or edit the env file so the app knows where the API is.

**If using Vite:**

Create or edit `.env` in the React project root:

```env
VITE_API_URL=http://localhost:3000
```

For production, add (or use your deployed backend URL):

```env
VITE_API_URL=https://your-backend.onrender.com
```

**If using Create React App (CRA):**

```env
REACT_APP_API_URL=http://localhost:3000
```

**If using Next.js:**

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Use the variable everywhere you call the API (see next step). Example for Vite:

```js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
```

---

## Step 3: Create an API client

Create a small module that:

- Uses the base URL from env.
- Sends `Content-Type: application/json` for POST requests.
- Attaches the JWT when you have a token.

**Option A – using `fetch`**

Create a file, e.g. `src/api/client.js` (or `api/client.js`), in your React app:

```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';  // Vite
// const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';  // CRA
// const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';  // Next.js

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem('token');  // or get from your auth context
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || res.statusText || 'Request failed');
  }

  return data;
}
```

**Option B – using axios**

If you use axios:

```bash
npm install axios
```

Create `src/api/client.js`:

```javascript
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Add token to every request if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Optional: handle 401 (e.g. logout)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Optionally redirect to login or refresh
    }
    return Promise.reject(err);
  }
);

export default api;
```

You will use this client for all API calls in the next steps.

---

## Step 4: Auth – register and login

**Response shape from backend:**

- Success: `{ success: true, data: { user: { id, email, name, role }, token } }`
- Error: `{ success: false, error: "message" }`

**Register**

- **URL:** `POST /auth/register`
- **Body:** `{ email, password, name?, role? }`
- **Role:** `"FARMER"` | `"OPERATOR"` | `"ADMIN"`

Example with `apiRequest` (fetch-based):

```javascript
export async function register(email, password, name, role = 'FARMER') {
  const data = await apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, name, role }),
  });
  return data;  // { success: true, data: { user, token } }
}
```

With axios:

```javascript
const { data } = await api.post('/auth/register', { email, password, name, role: role || 'FARMER' });
return data;  // { success: true, data: { user, token } }
```

**Login**

- **URL:** `POST /auth/login`
- **Body:** `{ email, password }`

Example:

```javascript
export async function login(email, password) {
  const data = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  return data;
}
```

**After login or register – store token and user**

Right after a successful login/register, save the token and user so you can use them globally (e.g. in a Context) and attach the token to requests:

```javascript
const result = await login(email, password);
if (result.success && result.data) {
  localStorage.setItem('token', result.data.token);
  localStorage.setItem('user', JSON.stringify(result.data.user));
  // Then: set state/context with result.data.user and redirect to dashboard
}
```

**Logout**

Clear token and user:

```javascript
localStorage.removeItem('token');
localStorage.removeItem('user');
// Clear auth state/context and redirect to login
```

---

## Step 5: Use the API in your pages (by role)

Use the same base URL and always send the token for protected routes (your client from Step 3 already does this if you read `token` from `localStorage` or from your auth context).

### Public (no token)

**List assets (homepage / browse)**

- **URL:** `GET /assets`
- **Response:** `{ success: true, data: [ { id, name, type, hourlyRate, operatorId, ... } ] }`

```javascript
const data = await apiRequest('/assets');
const assets = data.data;  // array of assets
```

### FARMER

**Create a booking**

- **URL:** `POST /bookings`
- **Body:** `{ assetId, startDate, endDate, notes? }`
- **Response:** `{ success: true, data: { id, farmerId, assetId, startDate, status, ... } }`

```javascript
const data = await apiRequest('/bookings', {
  method: 'POST',
  body: JSON.stringify({
    assetId: selectedAsset.id,
    startDate: '2025-02-15',
    endDate: '2025-02-16',
    notes: 'Optional note',
  }),
});
const booking = data.data;
```

**Get my bookings**

- **URL:** `GET /bookings/my`
- **Response:** `{ success: true, data: [ ... ] }`

```javascript
const data = await apiRequest('/bookings/my');
const myBookings = data.data;
```

### OPERATOR

**Create an asset**

- **URL:** `POST /assets`
- **Body:** `{ name, hourlyRate, type?, description? }`
- **Response:** `{ success: true, data: { id, name, type, hourlyRate, ... } }`

```javascript
const data = await apiRequest('/assets', {
  method: 'POST',
  body: JSON.stringify({
    name: 'Tractor',
    hourlyRate: 50,
    type: 'MACHINERY',
    description: 'Heavy duty',
  }),
});
const asset = data.data;
```

**Get my bookings** (bookings for assets I own)

- **URL:** `GET /bookings/my`
- **Response:** `{ success: true, data: [ ... ] }`

Same as farmer: `apiRequest('/bookings/my')`.

### ADMIN

**Get all users**

- **URL:** `GET /admin/users`
- **Response:** `{ success: true, data: [ { id, email, name, role, createdAt } ] }`

```javascript
const data = await apiRequest('/admin/users');
const users = data.data;
```

**Get all assets**

- **URL:** `GET /admin/assets`
- **Response:** `{ success: true, data: [ ... ] }`

```javascript
const data = await apiRequest('/admin/assets');
const assets = data.data;
```

**Get all bookings**

- **URL:** `GET /admin/bookings`
- **Response:** `{ success: true, data: [ ... ] }`

```javascript
const data = await apiRequest('/admin/bookings');
const bookings = data.data;
```

---

## Step 6: Handle errors and loading

- Every success response has the shape: `{ success: true, data: ... }`.
- Every error response has: `{ success: false, error: "message" }`.
- Use `try/catch` and show `error` to the user.

Example in a component:

```javascript
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

async function loadAssets() {
  setLoading(true);
  setError(null);
  try {
    const data = await apiRequest('/assets');
    setAssets(data.data);
  } catch (err) {
    setError(err.message || 'Failed to load assets');
  } finally {
    setLoading(false);
  }
}
```

For 401 (invalid/expired token), clear token and user and redirect to login (axios example in Step 3 shows one way).

---

## Step 7: CORS and production

**Local development**

- Backend allows all origins by default, so your React app (e.g. `http://localhost:5173`) can call `http://localhost:3000` without extra config.
- Optional: in the **backend** `.env`, set `CORS_ORIGIN=http://localhost:5173` to allow only your dev frontend.

**Production**

1. Deploy the backend and set `DATABASE_URL` and `JWT_SECRET`.
2. In the **backend** `.env`, set `CORS_ORIGIN` to your frontend URL, e.g. `https://your-app.vercel.app`.
3. In the **React** app, set the API URL to the deployed backend, e.g. `VITE_API_URL=https://your-backend.onrender.com`.
4. Restart the backend after changing env.

---

## Step 8: Quick test checklist

1. Backend: `npm start` in this project → `http://localhost:3000/health` returns `{ "ok": true }`.
2. React: `API_URL` points to `http://localhost:3000`.
3. Register a user (e.g. role FARMER) → check `data.user` and `data.token`; store them.
4. Login with same user → same shape; overwrite stored token and user.
5. Open a page that calls `GET /assets` → you should see `data` as an array (maybe empty).
6. As OPERATOR: login, then `POST /assets` with name and hourlyRate → 201 and asset in response.
7. As FARMER: login, then `POST /bookings` with assetId, startDate, endDate → 201 and booking in response.
8. Call `GET /bookings/my` → list of your bookings.
9. As ADMIN: `GET /admin/users`, `GET /admin/assets`, `GET /admin/bookings` → all return data arrays.

If any step fails, check: backend running, correct API URL, token sent on protected routes, and browser console/network tab for the exact error and response body.

---

## Summary

| What you do | Where |
|-------------|--------|
| Set API base URL | React `.env`: `VITE_API_URL` / `REACT_APP_API_URL` / `NEXT_PUBLIC_API_URL` |
| Send token on requests | API client: `Authorization: Bearer <token>` (from localStorage or context) |
| Store after login/register | `localStorage.setItem('token', ...)` and `localStorage.setItem('user', ...)` |
| Clear on logout | `localStorage.removeItem('token')` and `removeItem('user')` |
| Use response payload | Always use `response.data` for the actual list/object (e.g. `data.data`) |
| Handle errors | `{ success: false, error: "..." }`; show `error` to the user |

For full endpoint list and request bodies, see [README – API overview](README.md#api-overview).
