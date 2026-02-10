# Rural Uber (DHARA) 🚜

A full-stack web platform connecting farmers with local machine operators. Farmers can rent agricultural assets (tractors, harvesters, etc.) from verified operators in their vicinity.

## 🚀 Features

-   **Role-Based Access**: Specialized dashboards for **Farmers**, **Operators**, and **Admins**.
-   **Authentication**: Secure JWT-based login and registration.
-   **Asset Management**: Operators can list assets with details (type, rate, location, image).
-   **Booking System**: Farmers can browse available assets and book them for specific dates.
-   **Real-time Availability**: Assets show "Booked" or "Available" status based on database records.
-   **Responsive Design**: Built with React and Tailwind CSS for a modern, mobile-friendly UI.

## 🛠️ Tech Stack

### Frontend (`/DHARA`)
-   **Framework**: React (Vite)
-   **Styling**: Tailwind CSS, Lucide React (Icons)
-   **State Management**: React Context API
-   **HTTP Client**: Axios

### Backend (`/`)
-   **Runtime**: Node.js
-   **Framework**: Express.js
-   **Database**: PostgreSQL
-   **ORM**: Prisma
-   **Auth**: JSON Web Tokens (JWT) & Bcrypt

---

## ⚙️ Setup & Installation

Follow these steps to get the project running locally.

### 1. Prerequisites
-   Node.js (v16+)
-   PostgreSQL installed and running
-   Git

### 2. Clone the Repository
```bash
git clone <your-repo-url>
cd rural-uber-farm-assets
```

### 3. Backend Setup (Root)
1.  Install dependencies:
    ```bash
    npm install
    ```
2.  Configure Environment Variables:
    Create a `.env` file in the root directory:
    ```env
    PORT=3000
    DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/dhara"
    JWT_SECRET="your_super_secret_key_change_this"
    CORS_ORIGIN=http://localhost:5173
    ```
3.  Setup Database:
    ```bash
    npx prisma generate
    npx prisma db push
    ```

### 4. Frontend Setup (DHARA)
1.  Navigate to frontend folder:
    ```bash
    cd DHARA
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure Environment:
    Create a `.env` file in `DHARA/`:
    ```env
    VITE_API_URL=http://localhost:3000
    ```

---

## 🏃‍♂️ Running the App

You need to run both the backend and frontend servers.

**Terminal 1 (Backend):**
```bash
# In the root folder
npm start
# Server runs at http://localhost:3000
```

**Terminal 2 (Frontend):**
```bash
# In the DHARA folder
npm run dev
# App runs at http://localhost:5173
```

VISIT **[http://localhost:5173](http://localhost:5173)** to use the app!

---

## 📂 Project Structure

```
├── DHARA/                  # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # Auth Context
│   │   ├── pages/          # Full pages (Login, Dashboard, Assets)
│   │   └── services/       # API integration
│   └── ...
├── src/                    # Backend (Node + Express)
│   ├── controllers/        # Request logic
│   ├── middlewares/        # Auth & Validation
│   ├── routes/             # API Endpoints
│   ├── services/           # DB logic (Prisma)
│   └── app.js              # App entry point
├── prisma/                 # Database Schema
├── .env                    # Backend Config (GitIgnored)
└── package.json            # Backend Dependencies
```

## 🔐 API Endpoints

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Register new user | Public |
| `POST` | `/auth/login` | Login user | Public |
| `GET` | `/assets` | List all assets | Public |
| `POST` | `/assets` | Create a new asset | **Operator** |
| `POST` | `/bookings` | Book an asset | **Farmer** |
| `GET` | `/bookings/my` | View my bookings | **User** |

---

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) (if available) or follow standard Pull Request workflow.
