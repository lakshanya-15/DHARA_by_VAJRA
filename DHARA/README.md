# Rural Uber - Frontend MVP

Welcome to the **Rural Uber** frontend MVP! This is a React + Vite + Tailwind CSS application designed to connect farmers with asset operators.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1.  Navigate to the project directory:
    ```bash
    cd dhara
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
4.  Open your browser at `http://localhost:5173`.

## 🔑 Mock Credentials & Roles

The app uses a simulated authentication system. You can register a new account or use the quick "Role Selection" on the login page.

**Roles:**
- **Farmer**: Can browse assets, book them, and view booking history.
- **Operator**: Can dashboard stats, add new assets, and manage listed assets.
- **Admin**: Can view platform user and asset statistics.

**Quick Test credentials:**
- Email: `any@example.com`
- Password: `any`
- Select Role: Click the button for the desired role (Farmer/Operator/Admin) on the login screen.

## 📂 Project Structure

- `src/components`: Reusable UI and Layout components.
- `src/pages`: Page components organized by role (`farmer`, `operator`, `admin`).
- `src/context`: Authentication state management.
- `src/services`: Mock data and API placeholders.

## 🛠 Tech Stack

- **Framework**: React (Vite)
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM (v6)
- **Icons**: Lucide React
