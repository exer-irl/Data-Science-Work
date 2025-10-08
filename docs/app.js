const formatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 0,
});

const monthFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  year: 'numeric',
});

const actualHistory = [
  118, 126, 130, 142, 150, 158, 155, 149, 140, 134, 128, 122, // 2021
  125, 132, 138, 150, 162, 170, 168, 160, 152, 146, 140, 135, // 2022
  138, 144, 152, 164, 176, 185, 182, 174, 166, 158, 150, 144, // 2023
];

const holtWintersForecast = [
  147, 154, 162, 174, 186, 194, 190, 182, 174, 166, 158, 152, // 2024 forecast
];

const totalMonths = actualHistory.length + holtWintersForecast.length; // 48
const labels = Array.from({ length: totalMonths }, (_, index) => {
  const date = new Date(Date.UTC(2021, 0, 1));
  date.setUTCMonth(date.getUTCMonth() + index);
  return monthFormatter.format(date);
});

const actualSeries = Array.from({ length: totalMonths }, (_, index) =>
  index < actualHistory.length ? actualHistory[index] : null,
);

const forecastSeries = Array.from({ length: totalMonths }, (_, index) =>
  index >= actualHistory.length ? holtWintersForecast[index - actualHistory.length] : null,
);

const minSeries = forecastSeries.map((value) =>
  value == null ? null : Math.round(value * 0.92),
);
const maxSeries = forecastSeries.map((value) =>
  value == null ? null : Math.round(value * 1.08),
);

const latestForecast = holtWintersForecast[holtWintersForecast.length - 1];
const suggestedMin = Math.round(latestForecast * 0.92);
const suggestedMax = Math.round(latestForecast * 1.08);

document.addEventListener('DOMContentLoaded', () => {
  const ctx = document.getElementById('productionChart');

  if (ctx) {
    new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Actual production',
            data: actualSeries,
            borderColor: '#7a8bff',
            backgroundColor: 'rgba(122, 139, 255, 0.2)',
            borderWidth: 3,
            pointRadius: 0,
            tension: 0.35,
            spanGaps: true,
          },
          {
            label: 'Holt-Winters forecast',
            data: forecastSeries,
            borderColor: '#4bc4b8',
            borderWidth: 3,
            borderDash: [8, 6],
            pointRadius: 0,
            tension: 0.35,
            spanGaps: true,
          },
          {
            label: 'Min guardrail',
            data: minSeries,
            borderColor: 'rgba(255, 255, 255, 0.45)',
            borderWidth: 2,
            borderDash: [4, 6],
            pointRadius: 0,
            tension: 0.35,
            spanGaps: true,
          },
          {
            label: 'Max guardrail',
            data: maxSeries,
            borderColor: 'rgba(255, 255, 255, 0.45)',
            borderWidth: 2,
            borderDash: [4, 6],
            pointRadius: 0,
            tension: 0.35,
            spanGaps: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            grid: {
              color: 'rgba(255, 255, 255, 0.05)',
            },
            ticks: {
              maxRotation: 0,
              autoSkip: true,
              maxTicksLimit: 8,
            },
          },
          y: {
            grid: {
              color: 'rgba(255, 255, 255, 0.08)',
            },
            ticks: {
              callback: (value) => `${value}`,
            },
          },
        },
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              usePointStyle: true,
              padding: 16,
            },
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: (context) => {
                const label = context.dataset.label || '';
                const value = context.parsed.y;
                if (value == null) {
                  return `${label}: n/a`;
                }
                return `${label}: ${formatter.format(value)} units`;
              },
            },
          },
        },
        interaction: {
          mode: 'index',
          intersect: false,
        },
      },
    });
  }

  updateHeadlineMetrics();
});

function updateHeadlineMetrics() {
  const forecastValueEl = document.getElementById('forecastVolume');
  const minEl = document.getElementById('minValue');
  const maxEl = document.getElementById('maxValue');

  if (!forecastValueEl || !minEl || !maxEl) {
    return;
  }

  forecastValueEl.textContent = `${formatter.format(latestForecast)} units`;
  minEl.textContent = `${formatter.format(suggestedMin)} units`;
  maxEl.textContent = `${formatter.format(suggestedMax)} units`;
}
