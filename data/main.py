import pandas 
import math
import numpy as np
import os

# --- CONFIGURATION ---
# IMPORTANT: Ensure 'data/raw/train.csv' is the correct relative path to your unzipped file!
RAW_FILE_PATH = r"C:\Users\Akim\Downloads\data\raw\train.csv"
CLEANED_OUTPUT_PATH = "processed/trip_processed_data.csv"
EXCLUDED_OUTPUT_PATH = "processed/excluded_records_log.csv"

# Ensure the output directory exists
os.makedirs("data/processed", exist_ok=True)
print("Output directories ensured.")

# Load data
data = pandas.read_csv(RAW_FILE_PATH)

def calculate_distance(row):
    """
    Calculate distance between pickup and dropoff points
    Returns distance in kilometers
    """
    # Get coordinates
    lat1 = row['pickup_latitude']
    lon1 = row['pickup_longitude']
    lat2 = row['dropoff_latitude']
    lon2 = row['dropoff_longitude']

    # Convert to radians
    lat1_rad = math.radians(lat1)
    lon1_rad = math.radians(lon1)
    lat2_rad = math.radians(lat2)
    lon2_rad = math.radians(lon2)

    # Haversine formula
    dlat = lat2_rad - lat1_rad
    dlon = lon2_rad - lon1_rad

    a = math.sin(dlat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a))

    # Radius of earth in kilometers
    r = 6371
    distance = c * r

    return distance

# LOAD DATA 
try:
    data = pandas.read_csv(RAW_FILE_PATH)
    starting_count = len(data)
    print(f"Loaded raw data. Starting number of records (trips): {starting_count}")
except FileNotFoundError:
    print(f"ERROR: Raw data file not found at {RAW_FILE_PATH}. Check if the unzipped file is there.")
    exit()

# Ensure datetime columns are in datetime format
data["pickup_datetime"] = pandas.to_datetime(data["pickup_datetime"], errors="coerce")
data["dropoff_datetime"] = pandas.to_datetime(data["dropoff_datetime"], errors="coerce")

# Check for duplicates
data = data.drop_duplicates()
print(f"Records after dropping duplicates: {len(data)}")

# Remove any trip records where the time was missing or badly formatted.
data.dropna(subset=['pickup_datetime', 'dropoff_datetime'], inplace=True)
print(f"Records after dropping invalid timestamps: {len(data)}")

#Derived features
data["pickup_hour"] = data["pickup_datetime"].dt.strftime("%I %p")
data["pickup_dayofweek"] = data["pickup_datetime"].dt.day_name()

# Calculate trip distance
data["trip_distance_km"] = data.apply(calculate_distance, axis=1).round(2)

# Calculate trip speed
# trip_duration is in seconds, so we convert to hours
data["trip_duration_hours"] = data["trip_duration_seconds"] / 3600
data["trip_speed_kmh"] = (data["trip_distance_km"] / data["trip_duration_hours"]).round(2)

# Define rules to find impossible trip data:
suspicious_rules = data[
    (data["trip_distance_km"] == 0) |
    (data["trip_duration_seconds"] <= 10) |
    (data["trip_speed_kmh"] > 120)
]

# Save bad records to a separate file
impossible_trips = data[suspicious_rules].copy()
impossible_trips.to_csv(EXCLUDED_OUTPUT_PATH, index=False)

#Keep only valid records
data_clean = data[~suspicious_rules].copy()

#Show first few rows of cleaned data
print(f"Quick look at the first 3 CLEANED records (trip_duration_hours is newly calculated):")
print(data_clean[['id', 'trip_distance_km', 'trip_duration_hours', 'trip_speed_kmh']].head())

# Save cleaned data
final_count = len(data_clean)
data_clean.to_csv(CLEANED_OUTPUT_PATH, index=False)

print(f"\n--- Final Report ---")
print(f"Records successfully cleaned and saved to: {CLEANED_OUTPUT_PATH}")
print(f"Total trips started with: {starting_count}")
print(f"Total trips removed: {len(impossible_trips)}")
print(f"Total good trips saved for database: {final_count}")

# Check if cleaning worked
print(f"\n----Validation check----")
try:
    # Load cleaned data
    cleaned_data = pandas.read_csv(CLEANED_OUTPUT_PATH)

    #Check the min and max values of cleaned data
    print("Checking Min/Max values (Min should be > 0 and Max Speed should be <= 120):")
    print(cleaned_data[['trip_distance_km', 'trip_speed_kmh', 'fare_amount']].describe().loc[['min', 'max']])
    print("\nValidation completed successfully.")
except Exception as e:
    print(f"ERROR during validation: {e}")


