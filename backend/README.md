# OneChat Backend

A Node.js backend API for the OneChat application built with Express.js and PostgreSQL.

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file from the example:
```bash
cp .env.example .env
```

3. Update the `.env` file with your PostgreSQL credentials:
   - `DB_HOST`: PostgreSQL host (default: localhost)
   - `DB_PORT`: PostgreSQL port (default: 5432)
   - `DB_NAME`: Database name
   - `DB_USER`: PostgreSQL username
   - `DB_PASSWORD`: PostgreSQL password
   - `PORT`: Server port (default: 3000)

4. Make sure PostgreSQL is running and the database exists.

5. Start the server:
```bash
npm start
```

The server will start on `http://localhost:3000` (or the port specified in your `.env` file).

## API Endpoints

### Health Check
- `GET /health` - Returns `{ status: "ok" }`

## Project Structure

```
backend/
├── src/
│   ├── app.js          # Express app setup
│   ├── server.js       # Server entry point
│   ├── config/
│   │   └── db.js       # PostgreSQL connection
│   └── routes/
│       └── health.js   # Health check route
├── .env.example        # Environment variables example
├── package.json        # Dependencies and scripts
└── README.md           # This file
```

