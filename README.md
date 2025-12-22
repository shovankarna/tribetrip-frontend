# TripTribe Frontend

This is the web client for TripTribe, built with React, Vite, and TypeScript.

## 🛠 Tech Stack
- **React 18**
- **TypeScript**
- **Vite**
- **Keycloak-JS** (Authentication)

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- NPM

### Installation

```bash
npm install
```

### Running Locally

```bash
npm run dev
```

The application will start at `http://localhost:5173`.

### Configuration
Keycloak configuration is currently located in `src/auth.ts`. Ensure your local Keycloak instance is running on port 8080 with the realm `TripTribe`.
