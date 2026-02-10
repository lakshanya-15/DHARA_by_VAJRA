# Contributing to Rural Uber (DHARA)

Welcome to the team! Here is how you can set up the project and contribute changes.

## 1. Initial Setup (One Time)

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/lakshanya-15/YOUR_REPO_NAME.git
    cd rural-uber-farm-assets
    ```

2.  **Install Dependencies**:
    You need to install dependencies for both the backend (root) and frontend (DHARA).
    ```bash
    # Root (Backend)
    npm install

    # Frontend
    cd DHARA
    npm install
    cd .. 
    ```

3.  **Environment Variables**:
    Create a `.env` file in the **root** directory (copy from `.env.example` if available, or ask a teammate):
    ```env
    PORT=3000
    DATABASE_URL="postgresql://postgres:1234@localhost:5432/dhara"
    JWT_SECRET="your_secret_key"
    CORS_ORIGIN=http://localhost:5173
    ```

4.  **Database Setup**:
    Ensure you have PostgreSQL running and a database named `dhara`.
    ```bash
    npx prisma generate
    npx prisma db push
    ```

## 2. Making Changes (Daily Workflow)

1.  **Pull Latest Changes**:
    Always start by getting the latest code from the main branch.
    ```bash
    git checkout main
    git pull origin main
    ```

2.  **Create a New Branch**:
    Never work directly on `main`. Create a branch for your feature or fix.
    ```bash
    git checkout -b feature/add-new-payment-gateway
    ```

3.  **Make Your Changes**:
    Edit the code, add assets, etc.

4.  **Test Locally**:
    Run the app to make sure it works!
    ```bash
    npm start         # Backend
    cd DHARA && npm run dev  # Frontend
    ```

5.  **Commit and Push**:
    ```bash
    git add .
    git commit -m "Added payment gateway logic"
    git push origin feature/add-new-payment-gateway
    ```

6.  **Create a Pull Request (PR)**:
    - Go to the GitHub repository.
    - You will see a "Compare & pull request" button.
    - Click it, describe your changes, and request a review.
    - Once approved, merge it into `main`.

## 3. Troubleshooting
- **Database issues**: Run `npx prisma db push` to sync schema changes.
- **Frontend errors**: Try deleting `node_modules` in frontend folder and re-running `npm install`.
