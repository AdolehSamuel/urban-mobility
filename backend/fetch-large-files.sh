# #!/usr/bin/env bash

DB_FILE_PATH="src/db/trips.db"
RAW_DATA_FILE_PATH="src/data/raw/train.csv"

curl -L "https://github.com/AdolehSamuel/urban-mobility/raw/master/backend/$DB_FILE_PATH" -o "$DB_FILE_PATH"
curl -L "https://github.com/AdolehSamuel/urban-mobility/raw/master/backend/$RAW_DATA_FILE_PATH" -o "$RAW_DATA_FILE_PATH"
