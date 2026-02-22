# WB Tariffs to Google Sheets

This application fetches tariffs from the Wildberries API, stores them in a PostgreSQL database, and updates a Google Sheet with the tariff data.

## Prerequisites

- Docker and Docker Compose
- Node.js and npm (for local development)

## Getting Started

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-name>
    ```

2.  **Set up the environment variables and credentials:**

    -   Create a `.env` file in the root of the project by copying the `example.env` file:
        ```bash
        cp example.env .env
        ```
    -   Open the `.env` file and fill in the required values:
        -   `WILDBERRIES_API_KEY`: Your API key for the Wildberries API.
        -   `GOOGLE_SHEET_IDS`: A comma-separated list of Google Sheet IDs to update.
    -   Place your Google Service Account JSON key file in the project's root directory and name it `gcreds.json`.

3.  **Run the application:**
    ```bash
    docker compose up --build -d
    ```

## How it works

The application consists of two services:

-   `postgres`: A PostgreSQL database to store the tariffs.
-   `app`: A Node.js application that:
    -   Runs database migrations on startup.
    -   Starts a scheduler that runs every hour.
    -   The scheduler fetches tariffs from the Wildberries API for the current day.
    -   The fetched tariffs are saved to the database (upserting on conflict).
    -   The scheduler then updates the Google Sheets with the latest tariff data from the database.

## Google Sheets Integration

To enable the Google Sheets integration, you need to:

1.  **Create a Google Service Account** and download the JSON key file.
2.  **Rename the downloaded file to `gcreds.json`** and place it in the root of the project.
3.  **Enable the Google Sheets API** for your project in the Google Cloud Console.
4.  **Share your Google Sheet** with the service account's email address, giving it "Editor" permissions.
5.  **Set the `GOOGLE_SHEET_IDS` environment variable** in the `.env` file.

The application will update a sheet named `stocks_coefs` in each of the provided Google Sheet IDs.
