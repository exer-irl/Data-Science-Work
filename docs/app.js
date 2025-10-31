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

// IoT Chart Data
const iotHours = Array.from({ length: 24 }, (_, i) => `${i}:00`);

const temperatureData = [
  165, 168, 172, 175, 178, 182, 185, 188, 190, 192, 195, 198,
  200, 198, 195, 193, 190, 187, 183, 178, 173, 170, 167, 165
];

const uptimeData = [
  100, 100, 98, 95, 100, 100, 88, 100, 100, 92, 100, 100,
  100, 85, 100, 100, 100, 95, 100, 100, 100, 78, 100, 100
];

const cyclesData = [
  42, 45, 48, 52, 55, 58, 61, 64, 67, 70, 72, 75,
  78, 76, 73, 70, 67, 63, 58, 52, 47, 43, 40, 38
];

let currentIotChart = null;
let currentChartType = 'temperature';

document.addEventListener('DOMContentLoaded', () => {
  const ctx = document.getElementById('productionChart');
  const chartLib = window.Chart;

  // Initialize production forecast chart
  if (ctx && chartLib) {
    new chartLib(ctx, {
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
  } else if (ctx && !chartLib) {
    renderChartFallback(ctx);
  }

  updateHeadlineMetrics();

  // Initialize IoT chart
  initializeIotChart();

  // Initialize chart controls
  initializeChartControls();

  // Initialize ETL animation
  initializeETLAnimation();

  // Initialize navigation
  initializeNavigation();

  // Initialize interactive metrics
  initializeInteractiveMetrics();
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

function renderChartFallback(canvasEl) {
  const fallback = document.createElement('div');
  fallback.className = 'chart-fallback';

  fallback.innerHTML = `
    <p class="chart-fallback-title">Production forecast snapshot</p>
    <p class="chart-fallback-copy">
      The interactive view is temporarily unavailable.
      Recent Holt-Winters projections still point to a healthy seasonal peak with tightened guardrails.
    </p>
    <ul class="chart-fallback-list">
      <li><span>Latest forecast</span><span>${formatter.format(latestForecast)} units</span></li>
      <li><span>Suggested minimum</span><span>${formatter.format(suggestedMin)} units</span></li>
      <li><span>Suggested maximum</span><span>${formatter.format(suggestedMax)} units</span></li>
    </ul>
  `;

  canvasEl.replaceWith(fallback);
}

// Initialize IoT Chart
function initializeIotChart() {
  const iotCtx = document.getElementById('iotChart');
  const chartLib = window.Chart;

  if (!iotCtx || !chartLib) return;

  currentIotChart = new chartLib(iotCtx, {
    type: 'line',
    data: {
      labels: iotHours,
      datasets: [{
        label: 'Temperature (°F)',
        data: temperatureData,
        borderColor: '#ff6b6b',
        backgroundColor: 'rgba(255, 107, 107, 0.1)',
        borderWidth: 3,
        pointRadius: 3,
        pointHoverRadius: 6,
        tension: 0.4,
        fill: true,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: { maxTicksLimit: 12 },
        },
        y: {
          grid: { color: 'rgba(255, 255, 255, 0.08)' },
          ticks: {
            callback: (value) => currentChartType === 'uptime' ? `${value}%` : value,
          },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context) => {
              const value = context.parsed.y;
              if (currentChartType === 'temperature') {
                return `Temperature: ${value}°F`;
              } else if (currentChartType === 'uptime') {
                return `Uptime: ${value}%`;
              } else {
                return `Cycles: ${value} per hour`;
              }
            },
          },
        },
      },
    },
  });

  // Update datapoints metric
  const datapointsEl = document.getElementById('datapointsValue');
  if (datapointsEl) {
    datapointsEl.textContent = formatter.format(28800);
  }
}

// Initialize Chart Controls
function initializeChartControls() {
  const chartButtons = document.querySelectorAll('.chart-btn');

  chartButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active state
      chartButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Get chart type
      const chartType = btn.getAttribute('data-chart');
      currentChartType = chartType;

      // Update chart data
      if (currentIotChart) {
        let newData, label, color, bgColor;

        if (chartType === 'temperature') {
          newData = temperatureData;
          label = 'Temperature (°F)';
          color = '#ff6b6b';
          bgColor = 'rgba(255, 107, 107, 0.1)';
        } else if (chartType === 'uptime') {
          newData = uptimeData;
          label = 'Uptime (%)';
          color = '#4bc4b8';
          bgColor = 'rgba(75, 196, 184, 0.1)';
        } else {
          newData = cyclesData;
          label = 'Cycles per Hour';
          color = '#7a8bff';
          bgColor = 'rgba(122, 139, 255, 0.1)';
        }

        currentIotChart.data.datasets[0].data = newData;
        currentIotChart.data.datasets[0].label = label;
        currentIotChart.data.datasets[0].borderColor = color;
        currentIotChart.data.datasets[0].backgroundColor = bgColor;
        currentIotChart.update('active');
      }
    });
  });
}

// Initialize ETL Animation
function initializeETLAnimation() {
  const etlSources = document.querySelectorAll('.etl-source');
  const processSteps = document.querySelectorAll('.process-step');
  const etlStatus = document.getElementById('etlStatus');

  if (etlSources.length === 0) return;

  // Hover effects on sources
  etlSources.forEach((source, index) => {
    source.addEventListener('mouseenter', () => {
      source.style.transform = 'scale(1.1)';
    });

    source.addEventListener('mouseleave', () => {
      source.style.transform = 'scale(1)';
    });
  });

  // Auto-animate transformation steps
  let currentStep = 0;
  setInterval(() => {
    processSteps.forEach(step => step.classList.remove('active'));
    processSteps[currentStep].classList.add('active');
    currentStep = (currentStep + 1) % processSteps.length;

    // Update status on last step
    if (currentStep === 0 && etlStatus) {
      etlStatus.textContent = 'Processing...';
      setTimeout(() => {
        etlStatus.textContent = 'Ready';
      }, 1200);
    }
  }, 2000);
}

// Initialize Navigation
function initializeNavigation() {
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (!navMenu) return;

  // Smooth scroll
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href');
      const targetSection = document.querySelector(targetId);

      if (targetSection) {
        const offsetTop = targetSection.offsetTop - 80;
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
      }
    });
  });

  // Show/hide nav on scroll
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 100) {
      navMenu.classList.add('scrolled');
    } else {
      navMenu.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
  });
}

// Initialize Interactive Metrics
function initializeInteractiveMetrics() {
  const metrics = document.querySelectorAll('.interactive-metric');

  metrics.forEach(metric => {
    metric.addEventListener('mouseenter', () => {
      metric.style.transform = 'translateY(-4px)';
      metric.style.boxShadow = '0 12px 24px rgba(122, 139, 255, 0.2)';
    });

    metric.addEventListener('mouseleave', () => {
      metric.style.transform = 'translateY(0)';
      metric.style.boxShadow = 'none';
    });
  });
}
