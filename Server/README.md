# Freight Forwarding System - Backend

## Setup Instructions

### 1. Database Setup
The application requires PostgreSQL to be running.

1.  **Start PostgreSQL Service**:
    Open a terminal as Administrator and run:
    ```powershell
    net start postgresql-x64-16
    ```
    Or open "Services" (Win+R -> `services.msc`), find "postgresql-x64-16", and click Start.

2.  **Create Database and User**:
    Run the following commands in your terminal (you may need to enter your postgres password):
    ```powershell
    psql -U postgres -c "CREATE DATABASE freight_db;"
    psql -U postgres -c "CREATE USER freight_user WITH ENCRYPTED PASSWORD 'YourSecurePassword123!';"
    psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE freight_db TO freight_user;"
    ```

3.  **Import Schema**:
    ```powershell
    psql -U freight_user -d freight_db -f schema.sql
    ```
    (Enter 'YourSecurePassword123!' when prompted)

### 2. Running the Application

1.  **Install Dependencies** (if not already done):
    ```bash
    npm install
    ```

2.  **Start Development Server**:
    ```bash
    npm run dev
    ```

3.  **Build for Production**:
    ```bash
    npm run build
    npm start
    ```

## API Endpoints

-   **Health Check**: `GET /health`
-   **Imports**: `GET /api/v1/import`, `POST /api/v1/import`
-   **Exports**: `GET /api/v1/export`, `POST /api/v1/export`
