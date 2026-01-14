# Gigflow

A lightweight freelancing marketplace demo built with React + Redux (client) and Node.js + Express + MongoDB (server). Features include real-time notifications (Socket.io), persistent notifications, multi-admin gigs, and a race-safe "Hire" flow implemented with MongoDB transactions and conditional updates.

---

## ⚙️ Features
- Real-time notifications when:
  - A freelancer is hired (`hired` event)
  - A user is assigned as a gig admin (`adminAssigned` event)
- Persisted notifications so users see messages when they next log in
- Multi-admin support for gigs (owner can add/remove admins by email)
- Atomic, race-resistant hire flow using MongoDB transactions and conditional updates
- Simple auth (register/login), gig posting, bidding, and dashboard

---

## 🧰 Tech stack
- Server: Node.js, Express, Mongoose (MongoDB), socket.io
- Client: React, Redux Toolkit, React Router, socket.io-client, Bootstrap + Tailwind
- Dev tooling: Vite for client

---

## Prerequisites
- Node.js (v16+ recommended)
- npm
- MongoDB (local or Atlas)

---

## Environment variables
Create `.env` files for the server and the client as needed. Example variables:

Server (`server/.env`)
```
MONGO_URI=mongodb://localhost:27017/gigflow
PORT=5000
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
```

Client (`client/.env` or Vite envs)
```
VITE_API_URL=http://localhost:5000/api
VITE_API_WS_URL=http://localhost:5000
```

Note: The server requires `socket.io` as a dependency. If you see an error like "Cannot find module 'socket.io'" when starting the server, run:

```bash
cd server
npm install socket.io
```

---

## Setup & Run (development)
1. Install server dependencies and start server

```bash
cd server
npm install
# If socket.io not installed, run: npm install socket.io
npm run dev
```

2. Install client dependencies and start client

```bash
cd client
npm install
npm run dev
```

Open the client in your browser (usually http://localhost:5173) and the API at http://localhost:5000.

---

## API Overview (important endpoints)
- Auth
  - POST `/api/auth/register` — register user
  - POST `/api/auth/login` — login
  - GET `/api/auth/me` — current user

- Gigs
  - GET `/api/gigs` — browse gigs
  - GET `/api/gigs/:id` — gig details (populates `ownerId` + `admins`)
  - POST `/api/gigs` — create gig (owner only)
  - GET `/api/gigs/my-gigs` — gigs user owns or administers
  - POST `/api/gigs/:id/admins` — add admin by email (owner only)
  - DELETE `/api/gigs/:id/admins/:userId` — remove admin (owner only)

- Bids
  - POST `/api/bids` — submit a bid
  - GET `/api/bids/:gigId` — get bids for a gig (owner or admin)
  - PATCH `/api/bids/:bidId/hire` — hire a bid (owner or admin)

- Notifications
  - GET `/api/notifications` — fetch current user's notifications
  - PATCH `/api/notifications/:id/read` — mark notification read

Socket events emitted by server:
- `hired` — when a freelancer is hired (payload contains message, gigId, bidId, notification id when persisted)
- `adminAssigned` — when a user is added as an admin (payload contains message, gigId, notification id when persisted)

Clients should join a user-scoped room: `user:<userId>` so they receive targeted events. The client code does this automatically upon authentication.

---

## How admin flow works
- Owner adds an admin by providing the admin user's email via `POST /api/gigs/:id/admins`.
- Server validates email → finds user → adds user ID to the gig's `admins` array and persists a `adminAssigned` notification for that user.
- If the admin is online, the server emits a `adminAssigned` socket event to `user:<adminId>` so the admin sees the notification instantly.
- Admins appear on the gig detail page and see a "You are an Admin" badge. Admins can view bids and perform hires just like the owner.

---

## Concurrency test: verify hire is atomic
A simple sanity check to simulate two simultaneous hire attempts:

1. From two terminals (or a small Node script), make parallel PATCH requests to `/api/bids/:bidId/hire` for *different* bids on the same gig.

Example using `curl` (run near-simultaneously):

```bash
curl -X PATCH -b cookiejar -c cookiejar http://localhost:5000/api/bids/BID_ID_1/hire
curl -X PATCH -b cookiejar -c cookiejar http://localhost:5000/api/bids/BID_ID_2/hire
```

Expected result: One request should return 200 with `Freelancer hired successfully!` and the other should return 400 with a message like `This gig has already been assigned` or `This bid cannot be hired (already processed)`.

Optional: small Node script to fire two concurrent requests is included below (paste and run after configuring the URL & cookies/auth headers):

```js
// tools/concurrent-hire-test.js (example)
const axios = require('axios');
const url1 = 'http://localhost:5000/api/bids/BID_ID_1/hire';
const url2 = 'http://localhost:5000/api/bids/BID_ID_2/hire';

Promise.all([
  axios.patch(url1, {}, { withCredentials: true }),
  axios.patch(url2, {}, { withCredentials: true })
]).then(results => console.log(results.map(r => r.data))).catch(err => {
  if (err.response) console.log('Error:', err.response.data);
  else console.error(err);
});
```

---

## Troubleshooting
- Server starts but crashes with "Cannot find module 'socket.io'": run `npm install socket.io` in the `server` folder and restart.
- Real-time events not received: confirm `VITE_API_WS_URL` / `VITE_API_URL` values and ensure client and server are allowed in CORS (`CLIENT_URL` server env).
- If an admin isn't seeing bids, confirm the `GET /api/gigs/:id` response includes `admins` populated with user objects (name/email) so the client can detect admin status.

---

## Development notes
- The hire flow uses MongoDB transactions and conditional `findOneAndUpdate` calls to ensure atomicity and prevent race conditions.
- Notifications are persisted in MongoDB and also emitted via socket.io for real-time UX.
- Owner-only actions (add/remove admin) are protected on the server.

---

If you'd like, I can also add an automated integration test for the concurrent hire case and a small Postman/Insomnia collection to exercise the API. Open to adding developer scripts (e.g., `npm run test:concurrency`) if you want that included in the repo.

---

License: MIT
