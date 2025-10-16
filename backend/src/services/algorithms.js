const NYC_BOUNDS = {
  minLat: 40.4774,
  maxLat: 40.9176,
  minLon: -74.2591,
  maxLon: -73.7004,
};

// Anomaly Detection Algorithm
function isAnomalousTrip(trip) {
  const {
    trip_duration,
    trip_speed_kmh,
    pickup_lat,
    pickup_long,
    dropoff_lat,
    dropoff_long,
  } = trip;

  // duration too short (< 1 min)
  if (trip_duration < 60) {
    return { anomaly: true, reason: "too_short_duration" };
  }

  // duration too long (> 2 hours)
  if (trip_duration > 7200) {
    return { anomaly: true, reason: "too_long_duration" };
  }

  // speed is too high (> 120 km/h)
  if (trip_speed_kmh > 120) {
    return { anomaly: true, reason: "unrealistic_speed" };
  }

  // pickup or dropoff is outside New York
  if (
    pickup_lat < NYC_BOUNDS.minLat ||
    pickup_lat > NYC_BOUNDS.maxLat ||
    dropoff_lat < NYC_BOUNDS.minLat ||
    dropoff_lat > NYC_BOUNDS.maxLat ||
    pickup_long < NYC_BOUNDS.minLon ||
    pickup_long > NYC_BOUNDS.maxLon ||
    dropoff_long < NYC_BOUNDS.minLon ||
    dropoff_long > NYC_BOUNDS.maxLon
  ) {
    return { anomaly: true, reason: "outside_nyc" };
  }

  // return false if no anomalies
  return { anomaly: false, reason: null };
}

module.exports = { isAnomalousTrip };
