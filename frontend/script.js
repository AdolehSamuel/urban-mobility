// This is our test URL locally, we have now deployed our backend
// const API_URL = "http://localhost:4500";

const API_URL = "https://urban-mobility-bj30.onrender.com";

// Fetch and render summary stats
async function loadSummaryStats() {
  try {
    const res = await fetch(`${API_URL}/trips/stats`);
    const stats = await res.json();

    document
      .querySelectorAll(".stat-card")[0]
      .querySelector(".stat-number").textContent =
      stats.totalTrips.toLocaleString();

    document
      .querySelectorAll(".stat-card")[1]
      .querySelector(".stat-number").textContent =
      stats.totalPassengers.toLocaleString();

    // Convert duration (assuming seconds) to hours with thousands separator
    const hrs = stats.totalDuration / 3600;

    document
      .querySelectorAll(".stat-card")[2]
      .querySelector(".stat-number").textContent = `${Math.round(
      hrs
    ).toLocaleString()} hrs`;
  } catch (err) {
    console.error("Failed to load stats", err);
  }
}

let currentPage = 1;
const tripsPerPage = 10;

async function loadRecentTrips(page = 1) {
  try {
    const res = await fetch(
      `${API_URL}/trips?page=${page}&limit=${tripsPerPage}`
    );
    const data = await res.json();
    const tbody = document.querySelector(".trips-table tbody");
    tbody.innerHTML = "";
    data.trips.forEach(trip => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${trip.pickup_datetime || ""}</td>
        <td>${trip.dropoff_datetime || ""}</td>
        <td>${trip.passenger_count || ""}</td>
        <td>${
          trip.trip_duration ? Math.round(trip.trip_duration / 60) : ""
        }</td>
      `;
      tbody.appendChild(tr);
    });
    updatePagination(data.page, data.totalPages);
  } catch (err) {
    console.error("Failed to load recent trips", err);
  }
}

function updatePagination(page, totalPages) {
  currentPage = page;
  document.getElementById("pageIndicator").textContent = `Page ${page}${
    totalPages ? " of " + totalPages : ""
  }`;
  const prev = document.getElementById("prevPage");
  const next = document.getElementById("nextPage");
  prev.disabled = page <= 1;
  if (totalPages) {
    next.disabled = page >= totalPages;
  } else {
    next.disabled = false;
  }
}

let tripChart = null;

async function initializeTripDurationChart() {
  try {
    const res = await fetch(`${API_URL}/trips/charts`);
    const chartData = await res.json();
    renderTripDurationChart(chartData);
  } catch (error) {
    console.error("Error loading hourly chart data:", error);
  }
}

function renderTripDurationChart(chartData) {
  const canvas = document.getElementById("tripDurationChart");
  if (!canvas) return;

  // Destroy existing chart if present
  if (tripChart) {
    tripChart.destroy();
    tripChart = null;
  }

  // Extract data arrays
  const labels = Array.from({ length: 24 }, (_, h) => {
    if (h === 0) {
      return "12 AM";
    } else if (h < 12) {
      return `${h} AM`;
    } else if (h === 12) {
      return "12 PM";
    } else {
      return `${h - 12} PM`;
    }
  });

  const hourCountMap = new Map(
    chartData.map(({ hour, count }) => [Number(hour), count])
  );

  const data = labels.map((_, h) => hourCountMap.get(h) || 0);

  tripChart = new Chart(canvas, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Trips by Hour",
          data,
          backgroundColor: "#FED6D6",
          borderColor: "#bdf0e6",
          borderWidth: 1,
          borderRadius: 6,
          hoverBackgroundColor: "#BDF0E6",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              return `${numberWithCommas(context.parsed.y)} trips`;
            },
          },
        },
        title: {
          display: true,
          text: "Trip Distribution by Hour",
          font: { size: 20 },
          color: "#bdf0e6",
          padding: { top: 18, bottom: 10 },
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Hour of Day",
            font: { size: 14 },
            color: "#bdf0e6",
          },
          grid: {
            display: false,
          },
          ticks: {
            color: "#bdf0e6",
            font: { size: 12 },
            maxRotation: 0,
            minRotation: 0,
          },
        },
        y: {
          title: {
            display: true,
            text: "Trip Count",
            font: { size: 14 },
            color: "#bdf0e6",
          },
          grid: {
            color: "#BDF0E6",
          },
          ticks: {
            color: "#bdf0e6",
            font: { size: 12 },
            precision: 0,
          },
          beginAtZero: true,
        },
      },
      layout: {
        padding: 16,
      },
      animation: {
        duration: 900,
        easing: "easeInOutQuart",
      },
    },
  });
}

document.addEventListener("DOMContentLoaded", () => {
  loadSummaryStats();
  loadRecentTrips(currentPage);
  initializeTripDurationChart();
  const prevBtn = document.getElementById("prevPage");
  const nextBtn = document.getElementById("nextPage");
  if (prevBtn && nextBtn) {
    prevBtn.addEventListener("click", () => {
      if (currentPage > 1) {
        loadRecentTrips(currentPage - 1);
      }
    });
    nextBtn.addEventListener("click", () => {
      loadRecentTrips(currentPage + 1);
    });
  }
});
