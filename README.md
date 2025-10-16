## Urban Mobility Dashboard (NYC Taxi Trips)

This project shows NYC taxi trip data. It has:

- A backend API (Node.js + Express + SQLite)
- A simple website (HTML/CSS/JS) with charts and a table

---

### Deployed Frontend URL

https://urban-mobility-alu.netlify.app

---

### Deployed Backend URL

https://urban-mobility-bj30.onrender.com

---

## What’s inside

```
backend/
  server.js               # Starts the API
  package.json            # Scripts and dependencies
  src/
    app.js                # Express setup
    routes/trips.js       # API routes
    fetch-large-files.sh  # Fetches large files if not present
    services/
      loader.js           # Load CSV into SQLite
      index-creation.js   # Create database indexes
      algorithms.js       # Simple anomaly checks
      helpers.js          # Helper code for loader.js
    db/
      trips.db            # SQLite database (created by scripts)
    data/
      raw/
        train.csv          # Raw CSV Data
      logs/
        invalid_rows.log   # Invalid rows from Raw Data

frontend/
  index.html              # Web page
  styles.css              # Styles
  script.js               # Calls the API and draws charts
  utils.js                # Small helpers
```

---

## Setup: Backend

Requirements: Node.js 22+ and npm.

#### 1. Install packages

```bash
cd backend
npm install
```

#### 2. Fetch Large Files (Not required if you cloned the repository)

```bash
# If you downloaded a zip of this code and did not clone this repository, you will get
# pointers to the large files and not the real large files, to solve that, run this:

npm run fetch-large-files
```

#### 3. Add Indexes to data (optional but recommended)

```bash
# SQLite DB and our raw data file are very huge files that take time to recreate so they
# are stored in git via Git LFS. However, you can add indexes to the db on your setup to
# make it faster

npm run add-indexes
```

#### 4. Start the API

```bash
# Runs on http://localhost:4500 by default

npm start
```

You can also use auto-reload during development:

```bash
npm run dev
```

#### Re-process Data?

If you want to retouch our current data processor file - `backend/src/services/loader.js`, and re-process the data, make changes to the file and then run the following:

```bash
# This will delete the existing processed files and run the updated data processor

npm run process-data
```

Notes:

- Bad rows from the CSV are logged to `backend/src/data/logs/invalid_rows.log`.
- The API uses SQLite in read-only mode for safety.

---

## API (quick view)

- `GET /` – Welcome text

- `GET /trips` – List trips (paged)

  - Query: `page` (default 1), `limit` (default 20)
  - Returns: `trips`, `total`, `page`, `totalPages`

- `GET /trips/stats` – Summary

  - Returns: `totalTrips`, `totalPassengers`, `totalDuration` (in seconds)

- `GET /trips/charts` – Trips by hour
  - Returns: array of `{ hour: 0..23, count }`

---

## Setup: Frontend

Open `frontend/index.html` with a simple static server (for example: VS Code Live Server, `npx http-server`, Netlify/Vercel preview, etc.).

The file `frontend/script.js` points to a hosted API by default:

```js
const API_URL = "https://urban-mobility-bj30.onrender.com";
```

To use the local API, change it to:

```js
// const API_URL = "http://localhost:4500";
```

What you’ll see:

- Cards with totals (trips, passengers, duration in hours)
- A table with recent trips and pagination
- A bar chart of trips by hour (Chart.js)

---

## Deploy

- Backend: Render, Railway, Fly.io, or your own server. Make sure `trips.db` exists (create it with `npm run process-data`). We deployed our server to Render - https://urban-mobility-bj30.onrender.com.
- Frontend: Any static host (Netlify, Vercel, GitHub Pages, S3, etc.). We deployed our Frontend to Netlify - https://urban-mobility-alu.netlify.app/.

---

## Common problems

- If you download a zip of the repository, you will not get the large files needed to run the server, in order to do so, please run `npm run fetch-large-files` so that you get the large files needed to start the server.
- API says "Database error": make sure `backend/src/db/trips.db` exists. If not, run `npm run process-data`.
- Empty table or chart: check `API_URL` in `frontend/script.js` and verify the API is reachable.
- Slow endpoints: run `npm run add-indexes` after loading data.

---

## License

MIT
