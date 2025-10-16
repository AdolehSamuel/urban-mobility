const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const dbPath = path.join(__dirname, "../db/trips.db");
const db = new sqlite3.Database(dbPath);

console.log(
  "Adding the needed indexes for our trips database to be optimal...\n"
);

// Add index for hour_of_day (we use this for our charts data)
db.run("CREATE INDEX IF NOT EXISTS idx_hour_of_day ON trips(hour_of_day)");

// Add index for passenger_count (we will use this to make the passenger count sum faster)
db.run(
  "CREATE INDEX IF NOT EXISTS idx_passenger_count ON trips(passenger_count)"
);

// Add index for trip_duration
db.run(
  "CREATE INDEX IF NOT EXISTS idx_trip_duration ON trips(trip_duration)",
  () => {
    // Close database after all indexes are created
    db.close(err => {
      if (err) {
        console.error("Could not close DB:", err);
        process.exit(1);
      } else {
        console.log("Indexes added successfully. 🚀");
      }
    });
  }
);
