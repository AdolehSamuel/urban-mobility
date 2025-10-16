const sqlite3 = require("sqlite3");

function haversine(lat1, lon1, lat2, lon2) {
  const toRad = deg => deg * (Math.PI / 180);

  const R = 6371; // Earth radius in km

  const dLat = toRad(lat2 - lat1);

  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function isValidTrip(row) {
  return row.trip_duration > 0 && row.passenger_count > 0;
}

// Batch insert function - now properly handles transactions
function insertBatch(db = new sqlite3.Database(), rows = []) {
  return new Promise((resolve, reject) => {
    const statement = db.prepare(
      `INSERT INTO trips 
      (pickup_datetime, dropoff_datetime, pickup_lat, pickup_long, dropoff_lat, dropoff_long,
       passenger_count, trip_duration, trip_distance_km, trip_speed_kmh, hour_of_day, day_of_week, is_weekend, trip_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      (_, error) => {
        if (error) {
          throw error;
        }
      }
    );

    for (const row of rows) {
      statement.run(
        row.pickup_datetime,
        row.dropoff_datetime,
        row.pickup_lat,
        row.pickup_long,
        row.dropoff_lat,
        row.dropoff_long,
        row.passenger_count,
        row.trip_duration,
        row.trip_distance_km,
        row.trip_speed_kmh,
        row.hour_of_day,
        row.day_of_week,
        row.is_weekend,
        row.trip_id
      );
    }

    statement.finalize(finalizeError => {
      console.log("Finalized statement!\n");

      if (finalizeError) {
        console.log("Finalized Error here:");
        reject(finalizeError);
      }
    });

    resolve();
  });
}

function sleep(time = 0) {
  return new Promise(resolve => setTimeout(resolve, time));
}

module.exports = {
  haversine,
  isValidTrip,
  insertBatch,
  sleep,
};
