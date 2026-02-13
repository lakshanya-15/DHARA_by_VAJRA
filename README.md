# DHARA: Advanced Agriculture-as-a-Service Platform 🚜

DHARA (Dharaa) is a premium, full-stack ecosystem designed to bridge the gap between rural farmers and machinery operators. It provides a seamless, transparent, and data-driven marketplace for agricultural asset management and scheduling.

## 🚀 Core Capabilities

-   **Intelligent Pricing Engine**: A sophisticated algorithm that calculates fair market rates based on machine depreciation, legal overheads, operator wages, and real-time profit margins.
-   **Fleet Analytics & Insights**: Interactive data visualization using `recharts` for operators to track revenue trends and resource utilization.
-   **Automated Maintenance Ecosystem**: Built-in verification logging for every asset to ensure operational readiness and reliability.
-   **Role-Specific Dashboards**: Custom-tailored experiences for **Farmers** (Booking & Scheduling), **Operators** (Asset & Financial Management), and **Admins** (Platform Oversight).
-   **Real-Time Synchronization**: Instant status updates across the platform, ensuring zero schedule collisions and accurate availability.

## 🛠️ Technology Stack

### Backend Infrastructure
-   **Runtime**: Node.js & Express.js
-   **Database**: PostgreSQL (Relational Data Management)
-   **ORM**: Prisma (Type-safe Database Access)
-   **Security**: JWT-based Authentication & Bcrypt Hashing
-   **Lifecycle Management**: Automated status refreshing and notification services.

### Frontend Experience
-   **Framework**: React (Vite-powered)
-   **Visualization**: Recharts (Dynamic Data Graphs)
-   **Localization**: i18next (Multi-language support for rural accessibility)
-   **Styling**: Premium UI built with Tailwind CSS and Lucide Icons.

---

## ⚙️ Deployment & Setup

### 1. Repository Initialization
```bash
git clone <repository-url>
cd project1
```

### 2. Backend Orchestration
1.  **Dependencies**:
    ```bash
    npm install
    ```
2.  **Environment Configuration**:
    Configure your `.env` with `DATABASE_URL`, `JWT_SECRET`, and `CORS_ORIGIN`.
3.  **Database Synchronization**:
    ```bash
    npx prisma generate
    npx prisma db push
    ```

### 3. Frontend Orchestration
1.  **Initialization**:
    ```bash
    cd DHARA
    npm install
    ```
2.  **API Integration**:
    Configure `VITE_API_URL` in `DHARA/.env`.

---

## 🏃‍♂️ Operational Guide

The system operates as a distributed architecture requiring both services to be active.

**Backend Service:**
```bash
npm start # Root directory
```

**Frontend Experience:**
```bash
npm run dev # DHARA directory
```

---

## 📂 Architecture Overview

```
├── DHARA/                  # Frontend Application
│   ├── src/
│   │   ├── pages/          # Advanced Business Logic (Operator/Farmer/Admin)
│   │   ├── utils/          # Pricing & Calculation Engines
│   │   └── services/       # API Communications
├── src/                    # Backend Infrastructure
│   ├── controllers/        # Request Orchestration
│   ├── services/           # Business Logic & DB Interaction
│   └── routes/             # API Gateway
├── prisma/                 # Relational Schema Definitions
└── scripts/                # Administrative & Maintenance Utilities
```
