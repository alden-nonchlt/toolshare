# ToolShare

ToolShare is a community tool-lending app: members list tools they are willing to share, request to borrow them, and track each loan from request to return.

## Setup

### 1. Start the backend

```bash
cd backend
npm install
```

Create `backend/.env` with a JWT signing secret:

```env
JWT_SECRET=replace-with-a-long-random-secret
```

Load the demo data (this clears the current local database):

```bash
npm run seed
```

Start the API:

```bash
node server.js
```

The API runs at `http://localhost:5000`.

### 2. Start the frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the Vite URL shown in the terminal, normally `http://localhost:5173`.

## Demo accounts

All seed accounts use the password `demo12345`:

- `alice@toolshare.demo` — member
- `bob@toolshare.demo` — member
- `admin@toolshare.demo` — administrator

## Tech stack

- React, Vite, React Router, and Tailwind CSS
- Axios for API requests and JWT authorization headers
- Express and Node.js
- SQLite with better-sqlite3
- bcrypt for password hashing and jsonwebtoken for authentication

## Features

- Browse and search active tool listings
- Sign up and log in with JWT authentication
- Protected dashboard for creating, editing, and deleting owned listings
- Borrow requests directly from the browse page
- Request lifecycle: pending, approved, rejected, and returned
- Admin listing moderation and user deactivation
- Responsive slate-themed UI with loading, empty, error, and 404 states

## Three-minute demo script

1. **Problem (0:00–0:20):** “Useful tools often sit unused while someone nearby needs them for one project. ToolShare makes it simple for a community to lend, borrow, and track those tools.”
2. **Live workflow (0:20–2:10):** Log in as Alice, open **Dashboard**, choose **Add listing**, and create a tool. Sign out, log in as Bob, find that tool on **Browse**, and select **Request to borrow**. Sign back in as Alice, open **Incoming Requests**, approve Bob’s request, then use **Mark returned** to complete the loan. Point out that the listing returns to available.
3. **Admin (2:10–2:35):** Log in as `admin@toolshare.demo`, open **Admin**, and show the listing flag and member deactivation actions.
4. **Technical highlight (2:35–3:00):** “The request API enforces a small state machine: only pending requests can be approved or rejected, and only approved requests can be returned. Each transition also updates tool availability, so the UI reflects a consistent lending state.”
