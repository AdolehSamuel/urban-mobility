const app = require("./src/app");
const path = require("path");
const sqlite3 = require("sqlite3");

const PORT = process.env.PORT || 4500;

// Checking DB on startup
const dbPath = path.join(__dirname, "src/db/trips.db");

new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, err => {
  if (err) {
    console.error("Failed to connect to the database:", err.message);
    process.exit(1);
  } else {
    console.log("Database connection established.");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  }
});
