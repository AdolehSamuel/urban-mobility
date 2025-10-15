# Urban Mobility Data Explorer

A web-based dashboard for analyzing NYC taxi trip data, providing insights into urban mobility patterns.

## Features

- Real-time statistics dashboard
- Trip data visualization
- Hourly trip distribution charts
- Paginated trip data viewing
- Responsive design for all devices

## Tech Stack

### Frontend
- HTML5/CSS
- JavaScript
- Chart.js for data visualization
- CSS Grid/Flexbox for responsive layouts

### Backend
- Node.js
- Express.js
- SQLite3 for data storage
- CSV Parser for data ingestion

## Project Structure

```
urban-mobility/
├── backend/
│   ├── src/
│   │   ├── app.js         # Express app configuration
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   └── db/           # Database files
│   ├── package.json
│   └── server.js         # Server entry point
└── frontend/
    ├── index.html        # Main dashboard page
    ├── styles.css        # Styling
    ├── script.js         # Frontend logic
    └── utils.js          # Utility functions
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository:
```sh
git clone https://github.com/AdolehSamuel/urban-mobility.git
cd urban-mobility
```

2. Install backend dependencies:
```sh
cd backend
npm install
```

### Running the Application

1. Start the backend server:
```sh
cd backend
npm run dev
```

2. Open `frontend/index.html` in your browser

The application will be available at:
- Frontend: Open `index.html` directly
- Backend API: `http://localhost:4500`

## API Endpoints

- `GET /trips` - Get paginated trip data
- `GET /trips/stats` - Get summary statistics
- `GET /trips/charts` - Get hourly trip distribution data

## Data Processing

The application processes NYC taxi trip data and stores it in SQLite with the following enrichments:
- Trip distance calculation using Haversine formula
- Speed calculations
- Temporal features (hour of day, day of week, weekend flags)

## License

MIT

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
