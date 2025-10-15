const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3");
const csv = require("csv-parser");

const sqlite = sqlite3.verbose();

const { isValidTrip, haversine, insertBatch, sleep } = require("./helpers");

const dbPath = path.join(__dirname, "../db/trips.db");
const db = new sqlite.Database(dbPath);

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS trips (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pickup_datetime TEXT,
    dropoff_datetime TEXT,
    pickup_lat REAL,
    pickup_long REAL,
    dropoff_lat REAL,
    dropoff_long REAL,
    passenger_count INTEGER,
    trip_duration INTEGER,
    trip_distance_km REAL,
    trip_speed_kmh REAL,
    hour_of_day INTEGER,
    day_of_week INTEGER,
    is_weekend INTEGER,
    trip_id TEXT UNIQUE
  )`);
});

const rawCsvPath = path.join(__dirname, "../data/raw/train.csv");
const logPath = path.join(__dirname, "../data/logs/invalid_rows.log");

const invalidLogStream = fs.createWriteStream(logPath, { flags: "w" });

let batch = [];
let batchIndex = 1;
const BATCH_SIZE = 20_000;

const stream = fs.createReadStream(rawCsvPath).pipe(csv());

stream
  .on("data", async row => {
    try {
      const pickup_lat = parseFloat(row.pickup_latitude);
      const pickup_long = parseFloat(row.pickup_longitude);
      const dropoff_lat = parseFloat(row.dropoff_latitude);
      const dropoff_long = parseFloat(row.dropoff_longitude);
      const trip_duration = parseFloat(row.trip_duration);
      const passenger_count = parseFloat(row.passenger_count);
      const pickup_datetime = row.pickup_datetime;
      const dropoff_datetime = row.dropoff_datetime;
      const trip_id = row.id;

      const cleanRow = {
        pickup_datetime,
        dropoff_datetime,
        pickup_lat,
        pickup_long,
        dropoff_lat,
        dropoff_long,
        trip_duration,
        passenger_count,
        trip_id,
      };

      if (!isValidTrip(cleanRow)) {
        invalidLogStream.write(JSON.stringify(row) + "\n");
        return;
      }

      const trip_distance_km = haversine(
        pickup_lat,
        pickup_long,
        dropoff_lat,
        dropoff_long
      );

      const trip_speed_kmh = parseFloat(
        (trip_distance_km / (trip_duration / 3600)).toFixed()
      );

      const date = new Date(pickup_datetime);
      const hour_of_day = date.getHours();
      const day_of_week = date.getDay();
      const is_weekend = day_of_week === 0 || day_of_week === 6 ? 1 : 0;

      batch.push({
        ...cleanRow,
        trip_distance_km,
        trip_speed_kmh,
        hour_of_day,
        day_of_week,
        is_weekend,
      });

      if (batch.length >= BATCH_SIZE) {
        stream.pause();

        await insertBatch(db, batch);

        console.log(`\nStarted sleeping at Batch - ${batchIndex}\n`);
        await sleep(30_000);
        console.log(`\nStopped sleeping at Batch - ${batchIndex}\n`);

        console.log(`\nInserted 20k rows to Batch - ${batchIndex}\n`);
        batchIndex++;
        batch = [];

        stream.resume();
      }
    } catch (err) {
      console.error("Error processing row:", err);
      invalidLogStream.write(JSON.stringify(row) + "\n");
    }
  })
  .on("end", async () => {
    console.log("CSV processing complete. Finalizing...\n");

    // Insert any remaining rows in the batch
    if (batch.length > 0) {
      await insertBatch(db, batch);
      console.log(`\nInserted 10k rows to Batch - ${batchIndex}\n`);
      batchIndex++;
    }

    console.log("Closing Log Stream...\n");
    invalidLogStream.end();

    console.log("Closing DB...\n");

    db.close(closeErr => {
      if (closeErr) {
        console.log("Could not close DB...\n");
        console.error("Error closing database:", closeErr, "\n");
        process.exit(1);
      }

      console.log("Database closed successfully.\n");
      process.exit(0);
    });
  })
  .on("error", err => {
    console.error("\n\nError reading CSV file:", err, "\n");
    invalidLogStream.end();
    db.close(() => {
      process.exit(1);
    });
  });
