# Freight Forwarding System - Quick Start Guide

Welcome to the Freight Forwarding System! This guide will help you set up and run the complete software suite (Backend + Frontend) from scratch.

## 📋 Prerequisites

Ensure you have the following installed on your Windows machine:
1.  **Node.js** (v18 or higher)
2.  **PostgreSQL** (v14 or higher)
3.  **Git** (optional, for version control)

---

## 🚀 Step 1: Database Setup

Before running the application, you need to configure the database.

1.  **Start PostgreSQL Service**:
    *   Open the **Services** app (Win+R -> `services.msc`).
    *   Locate `postgresql-x64-16` (or your version).
    *   Right-click and select **Start**.

2.  **Create Database & User**:
    Open a terminal (PowerShell or CMD) and run these commands one by one:

    ```powershell
    # Login as default postgres user
    psql -U postgres
    ```

    Inside the SQL shell, run:

    ```sql
    CREATE DATABASE freight_db;
    CREATE USER freight_user WITH ENCRYPTED PASSWORD 'YourSecurePassword123!';
    GRANT ALL PRIVILEGES ON DATABASE freight_db TO freight_user;
    \c freight_db
    GRANT ALL ON SCHEMA public TO freight_user;
    \q
    ```

3.  **Import Schema**:
    Navigate to the Server directory and import the table structure:

    ```powershell
    cd Server
    psql -U freight_user -d freight_db -f schema.sql
    ```
    *(Enter `YourSecurePassword123!` when prompted)*

---

## ⚙️ Step 2: Backend Setup (Server)

The backend handles the API and database connections.

1.  **Navigate to Server Directory**:
    ```powershell
    cd d:\Softwares\saildata-suite-main\Server
    ```

2.  **Install Dependencies**:
    ```powershell
    npm install
    ```

3.  **Start the Server**:
    ```powershell
    npm run dev
    ```
    *You should see: `Server running on port 5000` and `Connected to the PostgreSQL database`.*

---

## 💻 Step 3: Frontend Setup (User Interface)

The frontend is the web interface you will interact with.

1.  **Open a New Terminal** (Keep the backend running in the first one).

2.  **Navigate to Frontend Directory**:
    ```powershell
    cd d:\Softwares\saildata-suite-main\Frontend
    ```

3.  **Install Dependencies**:
    ```powershell
    npm install
    ```

4.  **Start the Frontend**:
    ```powershell
    npm run dev
    ```
    *This will usually start the app at `http://localhost:5173` or `http://localhost:3000`.*

---

## 🌐 How to Use

1.  **Access the App**: Open your browser and go to the URL shown in the Frontend terminal (e.g., `http://localhost:5173`).
2.  **Import Data**: Navigate to the "Imports" section to view or add new import jobs.
3.  **Export Data**: Navigate to the "Exports" section to manage export records.

---

## 🆘 Troubleshooting

*   **"Connection refused" (Database)**: Ensure the PostgreSQL service is running in Windows Services.
*   **"npm command not found"**: Make sure you installed Node.js.
*   **"Port already in use"**: If port 5000 or 5173 is taken, close other node processes or change the PORT in `.env`.

---

### Folder Structure Overview

*   **Server/**: Contains the API, database logic, and backend code.
    *   `src/config/`: Database connection settings.
    *   `src/controllers/`: Logic for handling requests.
    *   `src/models/`: Data structure definitions.
    *   `src/routes/`: API URL definitions.
*   **Frontend/**: Contains the React user interface code.
