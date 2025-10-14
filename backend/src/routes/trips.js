// Trip-related API routes
// TODO: implement route logic for trip data endpoints

const express = require("express");
const router = express.Router();
const path = require("path");
const sqlite3 = require("sqlite3");

// Setup SQLite connection to trips.db
const dbPath = path.join(__dirname, "../db/trips.db");
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, err => {
  if (err) {
    console.error("Failed to connect to trips.db:", err);
  }
});

router.get("/", (req, res) => {
  const page = parseInt(req.query.page) > 0 ? parseInt(req.query.page) : 1;
  const limit = parseInt(req.query.limit) > 0 ? parseInt(req.query.limit) : 20;
  const offset = (page - 1) * limit;

  db.all(
    "SELECT * FROM trips LIMIT ? OFFSET ?",
    [limit, offset],
    (err, trips) => {
      if (err) {
        return res
          .status(500)
          .json({ error: "Database error", details: err.message });
      }

      db.get("SELECT COUNT(*) AS count FROM trips", (err2, row) => {
        if (err2) {
          return res
            .status(500)
            .json({ error: "Database error", details: err2.message });
        }

        const total = row.count || 0;
        res.json({
          trips,
          total,
          page,
          totalPages: Math.ceil(total / limit),
        });
      });
    }
  );
});

router.get("/stats", (_, res) => {
  db.get(
    `SELECT COUNT(*) AS totalTrips, SUM(passenger_count) AS totalPassengers, SUM(trip_duration) AS totalDuration FROM trips`,
    (err, row) => {
      if (err) {
        return res
          .status(500)
          .json({ error: "Database error", details: err.message });
      }
      res.json({
        totalTrips: row.totalTrips || 0,
        totalPassengers: row.totalPassengers || 0,
        totalDuration: row.totalDuration || 0,
      });
    }
  );
});

router.get("/charts", (_, res) => {
  db.all(
    `SELECT hour_of_day as hour, COUNT(*) as count FROM trips GROUP BY hour_of_day ORDER BY hour`,
    (err, rows) => {
      if (err) {
        return res
          .status(500)
          .json({ error: "Database error", details: err.message });
      }
      res.json(rows);
    }
  );
});

module.exports = router;
