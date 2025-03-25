# Document-Management-and-RAG-based-Q-A-Application

This project implements user authentication, document management, and ingestion trigger/control, built with NestJS and PostgreSQL.

## Features
-User Authentication: Implements JWT-based authentication with role-based access control (RBAC) for Admin, Editor, and Viewer roles.

-Document Management: Supports uploading, retrieving, and managing documents.

-Ingestion Control: Provides endpoints to trigger and monitor document ingestion processes, integrating seamlessly with a Python backend.

## Modules Overview

The application is structured into several key modules:

-Auth Module: Manages user authentication and authorization.

-Users Module: Handles user-related operations and data management.

-Documents Module: Manages document-related functionalities, including file uploads and metadata.

-Ingestion Module: Facilitates triggering and monitoring of document ingestion processes, interfacing with the Python backend.

## API Endpoints

Below is a summary of the primary API endpoints organized by module:

## Auth Module

### POST /auth/register

**Description**: Registers a new user with role-based access.

**Request Body**:
- `username` (string): Desired username.
- `password` (string): User's password.
- `email` (string): User's email.
- `role` (string): Role assigned to the user. Values: Admin, Editor, Viewer.

**Response**:
- `user` (object): Created user details.

---

### POST /auth/login

**Description**: Authenticates a user and returns a JWT token.

**Request Body**:
- `email` (string): The user's email.
- `password` (string): The user's password.

**Response**:
- `accessToken` (string): JWT token for authenticated access.
"""
---

### POST /auth/logout

**Description**: Logs out the user by clearing client-side JWT (stateless logout).

**Headers**:
- `Authorization`: Bearer token.

**Response**:
- `message` (string): Logout confirmation.
"""
---

## Users Module

### GET /users

**Description**: Retrieves a list of all users. Requires Admin role.

**Headers**:
- `Authorization`: Bearer token

**Response**:
- Array of user objects

---

### PATCH /users/:id

**Description**: Update a role of user. Requires Admin role.

**Headers**:
- `Authorization`: Bearer token

**Request Body**:
- `id` (string): User's id.
- `role` (string): Role assigned to the user. Values: Admin, Editor, Viewer.

**Response**:
- `user` (object): Updated user details.

---

### DELETE /users/:id

**Description**: Delete user. Requires Admin role.

**Headers**:
- `Authorization`: Bearer token

**Request Body**:
- `id` (string): User's id.

**Response**:
- `user` (object): User Deleted.

---
## Documents Module

### POST /documents/upload

**Description**: Uploads a new document.

**Headers**:
- `Authorization`: Bearer token
- `Content-Type`: multipart/form-data

**Request Body**:
- `file` (binary): Document file to upload

**Response**:
- `id` (number): Document ID.
- `filename` (string): Name of the uploaded file.
- `uploadedAt` (string): Upload timestamp.

---

### GET /documents

**Description**: Retrieves all uploaded documents.

**Headers**:
- `Authorization`: Bearer token

**Response**:
- Array of document objects

---

### GET /documents/:id

**Description**: Retrieves a specific document by ID.

**Headers**:
- `Authorization`: Bearer token

**Response**:
- Document object

---
### DELETE /documents/:id

**Description**: Delete a specific document by ID.

**Headers**:
- `Authorization`: Bearer token

**Response**:
- Document object

---

## Ingestion Module

### POST /ingestion/trigger/:id

**Description**: Triggers the ingestion process for documents.

**Headers**:
- `Authorization`: Bearer token

**Response**:
- `message` (string): Confirmation message.
- `jobId` (string): Ingestion job ID.

---

### GET /ingestion/status/:id

**Description**: Retrieves the status of a specific ingestion job.

**Headers**:
- `Authorization`: Bearer token

**Response**:
- `jobId` (string): Job ID.
- `status` (string): Status of the ingestion job.
"""

---

### POST /ingestion/retry/:id

**Description**: Retry for the status of a specific ingestion job.

**Headers**:
- `Authorization`: Bearer token

**Response**:
- `jobId` (string): Job ID.
- `status` (string): Status of the ingestion job.

---
### GET /ingestion/status/all

**Description**: Retrieves the status of all ingestion job.

**Headers**:
- `Authorization`: Bearer token

**Response**:
 Array of status objects 
"""

---

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
