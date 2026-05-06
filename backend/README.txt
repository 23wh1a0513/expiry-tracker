Backend for Expiry Tracker

Setup:
- Copy or create a `.env` file in this folder with the following (example):
  MONGO_URI=mongodb://127.0.0.1:27017/expiry-tracker
  PORT=3000

Install and run:
  npm install
  npm start

Notes:
- If you use MongoDB Atlas, set `MONGO_URI` to the connection string from Atlas.
- The server defaults to port 3000 unless `PORT` is set.

Endpoints:
- `GET /items` — returns JSON array of saved items.
- `POST /items` — accepts JSON { name, expiryDate } to create an item.

Serving frontend:
- The backend serves the `frontend/` directory as static files and will serve `index.html` at `/`.

Quick start (development):
1. Copy or create a `.env` file in this folder with `MONGO_URI` and optional `PORT`.
2. Install dependencies:

```
npm install
```

3. Start the server:

```
npm start
```

4. Open `http://localhost:3000` in your browser.

If you need CORS enabled for a separate frontend origin, the server already includes the `cors` middleware.
