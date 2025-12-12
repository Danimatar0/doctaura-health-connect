# Welcome to Doctaura project

## Project Info
This project is related to a digital health platform serving as a bridge between doctors and patients in Lebanon and MENA region.

## Development Setup

### Prerequisites
- Node.js 18+ and npm
- Environment variables configured (copy `.env.example` to `.env` and update values)

### Installation
```bash
npm install
```

### Configuration
Update your `.env` file with your Keycloak server details:
```env
VITE_KEYCLOAK_URL=https://keycloak.danmtech.com
VITE_KEYCLOAK_REALM=doctaura
VITE_KEYCLOAK_CLIENT_ID=doctaura-app
```

### Development Server
```bash
npm run dev
```
The app will run on `http://localhost:8080`

### Build for Production
```bash
npm run build
```
The production build will be in the `dist` folder.
