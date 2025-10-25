# CampusSafe Backend

This is the backend for the CampusSafe application, built with Node.js, Express, and Firebase. It provides a secure, serverless API for incident reporting, risk assessment, and other safety features.

## Features

- Incident reporting and management
- Risk scoring and "safe route" suggestions (stubbed)
- Buddy-check sessions and check-ins
- SOS alert fan-out (stubbed)
- AI-powered incident summaries (stubbed)

## Prerequisites

- Node.js (v20 or later)
- Firebase CLI (`npm install -g firebase-tools`)
- A Firebase project

## Setup

1.  **Clone the repository:**
    ```bash
    git clone <your-repo-url>
    cd <your-repo-folder>
    ```

2.  **Install dependencies:**
    Navigate to the `functions` directory and install the required packages.
    ```bash
    cd functions
    npm install
    ```

3.  **Configure Firebase:**
    Log in to the Firebase CLI and associate the project with your Firebase project.
    ```bash
    firebase login
    firebase use --add
    ```

## Running with Emulators

The project is configured to run with local Firebase emulators for development and testing.

1.  **Start the emulators:**
    From the root directory, run:
    ```bash
    firebase emulators:start
    ```
    This will start the Auth, Firestore, and Functions emulators, as well as the Emulator UI.

2.  **Run the functions:**
    In a separate terminal, navigate to the `functions` directory and run the `emu` script to start the functions in watch mode.
    ```bash
    cd functions
    npm run emu
    ```

## Running Tests

The project includes end-to-end tests that run against the local emulators.

1.  **Start the emulators** as described above.

2.  **Run the tests:**
    In a separate terminal, navigate to the `functions` directory and run the `test` script.
    ```bash
    cd functions
    npm run test
    ```

## API Endpoints

The API is served from the `/api` endpoint of the functions emulator (e.g., `http://localhost:5001/<your-project-id>/us-central1/api`). See the `example.http` file for sample requests.