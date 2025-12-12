# ⚖️ Online Judge System

A powerful, isolated code execution engine built with **NestJS**, **Docker**, and **BullMQ**.  
Capable of running Python and C++ code in secure sandboxed containers with strict time and memory limits.

![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Redis](https://img.shields.io/badge/redis-%23DD0031.svg?style=for-the-badge&logo=redis&logoColor=white)
![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)

---

## 🚀 Features

*   **Isolated Execution**: Every submission runs in a fresh, network-isolated Docker container.
*   **Multi-Language Support**: currently supports **Python 3.9** and **C++ (GCC)**.
*   **Resource Limits**: Strict controls on CPU, RAM (OOM Killer), and Time (TLE).
*   **Verdict System**: Detects Accepted, Wrong Answer, TLE, MLE, Compilation Error (CE), and Runtime Error (RE).
*   **Queueing**: Uses BullMQ (Redis) to handle high loads asynchronously.

---

## 🛠️ Prerequisites

Before running the "shaitan machine", ensure you have:

1.  **Docker Desktop** (running and executing `docker` commands without sudo).
2.  **Node.js** (v16 or higher).
3.  **PostgreSQL** (or use the provided docker-compose).
4.  **Redis** (or use the provided docker-compose).

---

## ⚡ Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/Feruum/Online-Judge.git
cd Online-Judge
npm install
```

### 2. Infrastructure Setup
Start PostgreSQL and Redis using Docker Compose:
```bash
docker-compose up -d
```

### 3. Environment Configuration
Create a `.env` file in the root directory (if not present):
```env
DB_HOST=localhost
DB_PORT=5433
DB_USER=user
DB_PASSWORD=password
DB_NAME=online_judge
REDIS_HOST=localhost
REDIS_PORT=6379
DOCKER_SOCK_PATH=//./pipe/docker_engine
# For Linux/Mac use: /var/run/docker.sock
```

### 4. Build Docker Images
The system needs base images for runners. They will be pulled automatically, but you can pre-pull them:
```bash
docker pull python:3.9-alpine
docker pull gcc:latest
```

### 5. Run the System
```bash
# Development mode
npm run start
```
The server will start on `http://localhost:3000`.

---

## 📡 API Usage

### 1. Create a Problem
**POST** `/api/problems`
```json
{
    "title": "Sum of Two",
    "description": "Add two numbers",
    "slug": "sum-two",
    "timeLimit": 1,
    "memoryLimit": 128,
    "testCases": [
        { "input": "2 3", "output": "5" },
        { "input": "10 10", "output": "20" }
    ]
}
```

### 2. Submit a Solution
**POST** `/api/submissions`
```json
{
    "problemId": 1,
    "language": "python",
    "code": "a, b = map(int, input().split())\nprint(a + b)"
}
```

### 3. Check Verdict
**GET** `/api/submissions/:id`
```json
{
    "id": "uuid-...",
    "status": "COMPLETED",
    "verdict": "Accepted"
}
```

---

## 🧪 Testing Limits

*   **Time Limit (TLE)**: Create a loop `while True: pass` in Python.
*   **Memory Limit (MLE)**: Allocate a huge array `[1] * 1024 * 1024 * 100`.
*   **Security**: Try `import os; os.system('rm -rf /')` -> Blocked by permissions and isolation.
