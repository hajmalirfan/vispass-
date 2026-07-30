# 🛡️ Visitor Entry & Gate Pass Management System

A modern Visitor Entry & Gate Pass Management System built with **React**, **FastAPI**, and **PostgreSQL**. The application digitizes visitor registration, gate pass generation, host approval, QR code-based check-in/check-out, and visitor reporting.

---

# 📌 Features

- Visitor Registration
- Employee/Host Management
- Security Guard Dashboard
- Admin Dashboard
- QR Code Gate Pass
- Visitor Photo Upload
- ID Proof Upload
- Host Approval Workflow
- Visitor Check-In / Check-Out
- PDF Gate Pass Generation
- Visitor History
- Reports & Analytics
- Role-Based Access Control (RBAC)
- JWT Authentication
- Audit Logs

---

# 🛠 Technology Stack

## Frontend

- React.js
- Vite
- Tailwind CSS
- Axios
- React Router

## Backend

- Python 3.12+
- FastAPI
- SQLAlchemy
- Pydantic
- JWT Authentication

## Database

- PostgreSQL

## Other

- Docker
- Nginx
- Git
- QR Code Generator
- ReportLab (PDF)

---

# 📁 Project Structure

```
visitor-gate-pass-system/

frontend/
│
├── src/
│   ├── assets/
│   ├── components/
│   ├── layouts/
│   ├── pages/
│   ├── services/
│   ├── hooks/
│   ├── App.jsx
│   └── main.jsx
│
backend/
│
├── app/
│   ├── api/
│   ├── auth/
│   ├── database/
│   ├── models/
│   ├── schemas/
│   ├── services/
│   ├── utils/
│   └── main.py
│
├── requirements.txt
│
database/
│
docker/
│
docs/
│
README.md
```

---

# ⚙️ Prerequisites

Install the following software before running the project.

- Git
- Node.js 20+
- Python 3.12+
- PostgreSQL 16+
- Docker (Optional)

---

# 🚀 Clone Repository

```bash
git clone https://github.com/yourusername/visitor-gate-pass-system.git

cd visitor-gate-pass-system
```

---

# Backend Setup

## Create Virtual Environment

Windows

```bash
python -m venv venv
```

Activate

```bash
venv\Scripts\activate
```

Linux / macOS

```bash
python3 -m venv venv

source venv/bin/activate
```

---

## Install Dependencies

```bash
pip install -r requirements.txt
```

---

# PostgreSQL Database

Create a database

```sql
CREATE DATABASE visitor_db;
```

---

## Configure Environment

Create

```
backend/.env
```

Example

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/visitor_db

SECRET_KEY=ChangeThisSecretKey

ALGORITHM=HS256

ACCESS_TOKEN_EXPIRE_MINUTES=60
```

---

## Run Database Migration

If Alembic is used

```bash
alembic upgrade head
```

---

# Run Backend

```bash
cd backend

uvicorn app.main:app --reload
```

Backend URL

```
http://127.0.0.1:8000
```

Swagger API

```
http://127.0.0.1:8000/docs
```

ReDoc

```
http://127.0.0.1:8000/redoc
```

---

# Frontend Setup

Move to frontend

```bash
cd frontend
```

Install packages

```bash
npm install
```

Create

```
frontend/.env
```

Example

```env
VITE_API_URL=http://127.0.0.1:8000
```

Run frontend

```bash
npm run dev
```

Frontend URL

```
http://localhost:5173
```

---

# Default User Roles

## Admin

```
Email

admin@example.com

Password

Admin@123
```

## Security Guard

```
guard@example.com

Guard@123
```

## Employee

```
employee@example.com

Employee@123
```

---

# API Endpoints

Authentication

```
POST /login

POST /register

POST /refresh
```

Visitors

```
GET /visitors

POST /visitors

PUT /visitors/{id}

DELETE /visitors/{id}
```

Visits

```
POST /visit

GET /visit

PUT /visit/{id}
```

Gate Pass

```
POST /gatepass

GET /gatepass/{id}
```

Reports

```
GET /reports/daily

GET /reports/monthly
```

---

# QR Code Workflow

Visitor Registration

↓

Host Approval

↓

Generate QR Pass

↓

Security Scan

↓

Check-In

↓

Check-Out

↓

Visitor History

---

# Build Frontend

```bash
npm run build
```

Preview

```bash
npm run preview
```

---

# Docker

Build

```bash
docker-compose build
```

Run

```bash
docker-compose up -d
```

Stop

```bash
docker-compose down
```

---

# Running Tests

Backend

```bash
pytest
```

Frontend

```bash
npm test
```

---

# Security

- JWT Authentication
- Password Hashing
- Role-Based Access Control
- Input Validation
- SQL Injection Protection
- XSS Protection
- Secure File Upload
- Audit Logs

---

# Future Improvements

- Face Recognition
- RFID Entry
- NFC Gate Pass
- SMS Notification
- Email Notification
- Mobile Application
- AI Visitor Analytics
- Multi-Branch Support

---

# License

MIT License

---

# Developed By

**Your Name**

Visitor Entry & Gate Pass Management System

Powered by

React • FastAPI • PostgreSQL