const app = require("./src/app");
const path = require("path");
const sqlite3 = require("sqlite3");

const PORT = process.env.PORT || 4500;

const dbPath = path.join(__dirname, "src/db/trips.db");

// Checking DB on startup
new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, err => {
  if (err) {
    process.exit(1);
  } else {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}. 🚀`);
    });
  }
});
