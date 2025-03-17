# Document-Management-and-RAG-based-Q-A-Application
This project implements user authentication, document management, and ingestion trigger/control, built with NestJS and PostgreSQL.

## Features
- JWT Authentication with Role-based Access Control (Admin, Editor, Viewer)
- Document Management APIs with file upload
- Ingestion trigger & status APIs integrated with a Python backend

## Project Setup

### Prerequisites
- Node.js (v16+ recommended)
- PostgreSQL (v12+)
- Docker & Docker Compose (optional)

### Installation
```bash
git clone <repo-url>
cd <repo-directory>
npm install
```

### Environment Variables
Create a `.env` file in the root folder and configure:
```
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=nestjs_project
JWT_SECRET=your_jwt_secret
PYTHON_BACKEND_URL=http://localhost:5000/ingest
```

### Running Locally
```bash
npm run start:dev
```

### Running Tests
```bash
npm run test
```

### Docker (Optional)
Use the included `docker-compose.yml` to start both NestJS and Python services.

### API Documentation
Swagger UI available at `http://localhost:3000/api/docs`

### Admin Credentials (if seeded)
```
email: admin@example.com
password: admin123
```