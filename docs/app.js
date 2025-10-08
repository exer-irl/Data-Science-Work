const siteConfig = {
  hero: {
    name: 'Caleb Drew',
    greeting: "Hello, I'm",
    tagline:
      'Manufacturing analytics leader turning ERP, shop floor, and macro signals into real-time intelligence.',
    resumeUrl: 'Caleb_Drew_Resume.pdf',
    contactMailto: 'mailto:calebldrew@gmail.com?subject=Let%27s build intelligent operations',
    yearsExperience: 4,
  },
  tools: [
    { name: 'Python', logo: 'https://cdn.simpleicons.org/python/3776AB' },
    { name: 'SQL Server', logo: 'https://cdn.simpleicons.org/microsoftsqlserver/CC2927' },
    { name: 'Power BI', logo: 'https://cdn.simpleicons.org/powerbi/F2C811' },
    { name: 'Microsoft Fabric', logo: 'https://cdn.simpleicons.org/microsoft/6366F1' },
    { name: 'Azure', logo: 'https://cdn.simpleicons.org/microsoftazure/0089D6' },
    { name: 'Airbyte', logo: 'https://cdn.simpleicons.org/airbyte/615EFF' },
    { name: 'Oracle', logo: 'https://cdn.simpleicons.org/oracle/F80000' },
    { name: 'SAP', logo: 'https://cdn.simpleicons.org/sap/0FAAFF' },
    { name: 'Microsoft Excel', logo: 'https://cdn.simpleicons.org/microsoftexcel/217346' },
    { name: 'Lean Six Sigma', logo: 'https://cdn.simpleicons.org/sixsigma/0033A0' },
  ],
  skills: [
    {
      title: 'Operational Analytics & Lean Manufacturing',
      description:
        'Redesigned KPI reporting for Hultec (S&B), moving global operations from manual spreadsheets to real-time Fabric dashboards with 95% adoption.',
      resumeLink: 'Hultec (S&B) — Analyst (Internal Consultant)',
    },
    {
      title: 'Predictive Demand & Inventory Modeling',
      description:
        'Implemented seasonal demand models that cut emergency production by 10% and reduced stockouts to 5%, protecting service levels across plants.',
      resumeLink: 'Hultec (S&B) — Analyst (Internal Consultant)',
    },
    {
      title: 'Pricing & Margin Intelligence',
      description:
        'Delivered data-driven pricing analytics at Distribution International, reducing material cost variance by $75K and boosting pricing accuracy 15%.',
      resumeLink: 'Distribution International — Industrial Engineer / Data Analyst',
    },
    {
      title: 'Automated BI & ERP Integration',
      description:
        'Unified Oracle ERP and Microsoft Fabric data models so daily reporting runs in minutes instead of hours, saving eight analyst-hours per week.',
      resumeLink: 'Distribution International — Industrial Engineer / Data Analyst',
    },
    {
      title: 'Executive Storytelling & Decision Enablement',
      description:
        'Partnered with leadership to rebuild ERP + shop floor reporting, eliminating 30% of manual data entry errors while aligning executives on a $2M expansion plan.',
      resumeLink: 'Hultec (S&B) — Analyst (Internal Consultant)',
    },
  ],
  resume: [
    {
      role: 'Analyst (Internal Consultant)',
      company: 'Hultec (S&B)',
      dates: 'Dec 2024 – Present',
      highlights: [
        'Launched live KPI suites (AP terms, inventory turns, backorders) spanning three continents and shrinking manual reporting to near zero.',
        'Connected Microsoft Fabric lakehouses with Power BI to cut executive prep time from 3 days to under 1 hour.',
        'Built market valuation modeling blending World Bank signals with sales data to size a 12% growth opportunity supporting a $2M expansion ask.',
      ],
    },
    {
      role: 'Industrial Engineer / Data Analyst',
      company: 'Distribution International (TopBuild)',
      dates: 'Sep 2023 – Nov 2024',
      highlights: [
        'Automated SQL + Oracle ERP refreshes, saving 8 analyst hours per week and improving reporting reliability.',
        'Drove $75K reduction in material cost variance while improving pricing accuracy by 15% across 700K+ SKUs.',
        'Embedded Lean improvements across supply chain analytics, partnering with ops leaders to modernize pricing visibility.',
      ],
    },
  ],
};

const fredConfig = {
  seriesId: 'CPIAUCSL',
  title: 'Consumer Price Index for All Urban Consumers: All Items in U.S. City Average',
  frequency: 'Monthly',
  provider: 'Federal Reserve Bank of St. Louis (FRED)',
  window: 120, // last ten years of monthly data
};

const apiSnippet = `const seriesId = '${fredConfig.seriesId}';
const FRED_KEY = localStorage.getItem('fred-key');
fetch(` +
  '`https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${FRED_KEY}&file_type=json`' +
  `)
  .then((r) => r.json())
  .then((d) => {
    const observations = d.observations.slice(-${fredConfig.window});
    // feed visuals + Holt-Winters forecast
  });`;

const charts = {
  hero: null,
  visual: null,
  forecast: null,
};

let fredKey = '';
let fredObservations = [];

document.addEventListener('DOMContentLoaded', () => {
  initializeHero();
  renderTools();
  renderSkills();
  renderResume();
  renderApiMetadata();
  attachEvents();
  tryLoadStoredKey();
});

function initializeHero() {
  const hero = siteConfig.hero;
  document.getElementById('hero-name').textContent = hero.name;
  document.getElementById('hero-greeting').textContent = hero.greeting;
  document.getElementById('hero-tagline').textContent = hero.tagline;
  document.getElementById('statYears').textContent = hero.yearsExperience.toString();
  document.getElementById('download-resume').addEventListener('click', () => {
    const link = document.createElement('a');
    link.href = hero.resumeUrl;
    link.target = '_blank';
    link.rel = 'noopener';
    if (!/^https?:/i.test(hero.resumeUrl)) {
      link.download = hero.resumeUrl.split('/').pop() || 'Caleb_Drew_Resume.pdf';
    }
    document.body.appendChild(link);
    link.click();
    link.remove();
  });
  document.getElementById('contact-me').addEventListener('click', () => {
    window.location.href = hero.contactMailto;
  });
}

function renderTools() {
  const grid = document.getElementById('toolGrid');
  grid.innerHTML = '';
  siteConfig.tools.forEach((tool) => {
    const card = document.createElement('div');
    card.className = 'tool-card';
    const img = document.createElement('img');
    img.alt = `${tool.name} logo`;
    img.loading = 'lazy';
    img.src = tool.logo;
    img.onerror = () => {
      const fallback = document.createElement('span');
      fallback.className = 'tool-fallback';
      fallback.textContent = tool.name.charAt(0);
      img.replaceWith(fallback);
    };
    const label = document.createElement('span');
    label.textContent = tool.name;
    card.appendChild(img);
    card.appendChild(label);
    grid.appendChild(card);
  });
}

function renderSkills() {
  const container = document.getElementById('skillList');
  container.innerHTML = '';
  siteConfig.skills.forEach((skill) => {
    const card = document.createElement('article');
    card.className = 'skill-card';
    const title = document.createElement('h3');
    title.textContent = skill.title;
    const desc = document.createElement('p');
    desc.textContent = skill.description;
    const tag = document.createElement('span');
    tag.className = 'resume-tag';
    tag.textContent = skill.resumeLink;
    card.appendChild(title);
    card.appendChild(desc);
    card.appendChild(tag);
    container.appendChild(card);
  });
}

function renderResume() {
  const timeline = document.getElementById('resumeTimeline');
  timeline.innerHTML = '';
  siteConfig.resume.forEach((entry) => {
    const article = document.createElement('article');
    article.className = 'resume-card';
    const header = document.createElement('header');
    const role = document.createElement('h3');
    role.textContent = entry.role;
    const company = document.createElement('p');
    company.className = 'resume-company';
    company.textContent = `${entry.company} · ${entry.dates}`;
    header.appendChild(role);
    header.appendChild(company);
    const list = document.createElement('ul');
    entry.highlights.forEach((highlight) => {
      const li = document.createElement('li');
      li.textContent = highlight;
      list.appendChild(li);
    });
    article.appendChild(header);
    article.appendChild(list);
    timeline.appendChild(article);
  });
}

function renderApiMetadata() {
  const apiList = document.getElementById('apiList');
  apiList.innerHTML = '';
  const items = [
    {
      label: fredConfig.title,
      value: `Series ID: ${fredConfig.seriesId}`,
      link: 'https://fred.stlouisfed.org/series/CPIAUCSL',
    },
    {
      label: 'Microsoft Fabric Lakehouse',
      value: 'Production + shop floor data model',
    },
    {
      label: 'Oracle & SAP ERP Exports',
      value: 'Pricing, inventory, and vendor terms feeds',
    },
  ];
  items.forEach((item) => {
    const li = document.createElement('li');
    li.className = 'api-item';
    const heading = document.createElement('h4');
    heading.textContent = item.label;
    const meta = document.createElement('p');
    meta.textContent = item.value;
    li.appendChild(heading);
    li.appendChild(meta);
    if (item.link) {
      const anchor = document.createElement('a');
      anchor.href = item.link;
      anchor.target = '_blank';
      anchor.rel = 'noopener';
      anchor.textContent = 'View documentation';
      li.appendChild(anchor);
    }
    apiList.appendChild(li);
  });
  document.getElementById('apiSnippet').textContent = apiSnippet;
}

function attachEvents() {
  document.getElementById('loadFred').addEventListener('click', () => {
    const inputKey = document.getElementById('fredKeyInput').value.trim();
    if (!inputKey) {
      setApiStatus('Please enter a FRED API key to continue.', 'warn');
      return;
    }
    fredKey = inputKey;
    localStorage.setItem('fred-key', fredKey);
    loadFredData();
  });
}

function tryLoadStoredKey() {
  try {
    const stored = localStorage.getItem('fred-key');
    if (stored) {
      fredKey = stored;
      document.getElementById('fredKeyInput').value = fredKey;
      loadFredData();
    }
  } catch (error) {
    console.warn('Local storage unavailable', error);
  }
}

async function loadFredData() {
  setApiStatus('Syncing data from FRED…', 'info');
  if (!fredKey) {
    setApiStatus('No FRED API key detected. Please enter it above.', 'warn');
    return;
  }
  const url = new URL('https://api.stlouisfed.org/fred/series/observations');
  url.searchParams.set('series_id', fredConfig.seriesId);
  url.searchParams.set('api_key', fredKey);
  url.searchParams.set('file_type', 'json');
  url.searchParams.set('observation_start', '2014-01-01');
  try {
    const response = await fetch(url.toString());
    if (!response.ok) throw new Error(`FRED responded with ${response.status}`);
    const data = await response.json();
    if (!Array.isArray(data.observations)) throw new Error('Unexpected response payload');
    fredObservations = data.observations
      .filter((d) => d.value !== '.' && d.value !== null)
      .slice(-fredConfig.window)
      .map((row) => ({
        date: row.date.slice(0, 10),
        value: Number(row.value),
      }));
    if (!fredObservations.length) throw new Error('No observations returned.');
    updateHeroCard();
    updateVisualChart();
    updateForecastChart();
    setApiStatus('FRED data refreshed successfully.', 'success');
  } catch (error) {
    console.error(error);
    setApiStatus(`Unable to load FRED data: ${error.message}`, 'error');
  }
}

function setApiStatus(message, tone) {
  const status = document.getElementById('apiStatus');
  status.textContent = message;
  status.dataset.tone = tone;
}

function updateHeroCard() {
  if (!fredObservations.length) return;
  const latest = fredObservations[fredObservations.length - 1];
  const priorYear = fredObservations.findIndex((row) => row.date === offsetMonths(latest.date, -12));
  const changeElement = document.getElementById('latestCpiChange');
  document.getElementById('latestCpiValue').textContent = `${latest.value.toFixed(1)} index pts`;
  if (priorYear > -1) {
    const delta = latest.value - fredObservations[priorYear].value;
    const pct = (delta / fredObservations[priorYear].value) * 100;
    const direction = delta >= 0 ? '▲' : '▼';
    changeElement.textContent = `${direction} ${pct.toFixed(2)}% vs LY`;
    changeElement.className = delta >= 0 ? 'positive' : 'negative';
  } else {
    changeElement.textContent = '';
  }
  const labels = fredObservations.slice(-36).map((row) => row.date);
  const values = fredObservations.slice(-36).map((row) => row.value);
  const ctx = document.getElementById('heroSparkline');
  if (charts.hero) {
    charts.hero.data.labels = labels;
    charts.hero.data.datasets[0].data = values;
    charts.hero.update();
  } else {
    charts.hero = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            data: values,
            borderColor: 'rgba(100, 230, 209, 0.8)',
            backgroundColor: 'rgba(100, 230, 209, 0.25)',
            fill: true,
            tension: 0.3,
            pointRadius: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        scales: { x: { display: false }, y: { display: false } },
      },
    });
  }
  document.getElementById('heroSparklineNote').textContent = `Latest update: ${latest.date}`;
}

function updateVisualChart() {
  if (!fredObservations.length) return;
  const labels = fredObservations.map((row) => row.date);
  const values = fredObservations.map((row) => row.value);
  const ctx = document.getElementById('visualChart');
  if (!charts.visual) {
    charts.visual = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'CPI (Index 1982–84=100)',
            data: values,
            borderColor: 'rgba(92, 108, 255, 0.9)',
            backgroundColor: 'rgba(92, 108, 255, 0.15)',
            tension: 0.2,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' },
          tooltip: { mode: 'index', intersect: false },
        },
        scales: {
          x: { ticks: { maxTicksLimit: 10 } },
          y: { title: { display: true, text: 'Index (1982–84=100)' } },
        },
      },
    });
  } else {
    charts.visual.data.labels = labels;
    charts.visual.data.datasets[0].data = values;
    charts.visual.update();
  }
  const yoy = computeYoY(values, 12);
  document.getElementById('visualInsight').textContent = `Year-over-year CPI change: ${yoy.toFixed(2)}%. Rolling 3-month slope ${computeSlope(values.slice(-6)).toFixed(2)} index points.`;
}

function updateForecastChart() {
  if (!fredObservations.length) return;
  const values = fredObservations.map((row) => row.value);
  const labels = fredObservations.map((row) => row.date);
  const { forecast, seasonal, level, trend } = holtWintersAdditive(values, 12, 0.6, 0.2, 0.2, 12);
  const forecastLabels = [];
  const lastDate = fredObservations[fredObservations.length - 1].date;
  for (let i = 1; i <= forecast.length; i += 1) {
    forecastLabels.push(offsetMonths(lastDate, i));
  }
  const ctx = document.getElementById('forecastChart');
  if (!charts.forecast) {
    charts.forecast = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [...labels, ...forecastLabels],
        datasets: [
          {
            label: 'Observed',
            data: [...values, ...new Array(forecast.length).fill(null)],
            borderColor: 'rgba(92, 108, 255, 1)',
            backgroundColor: 'rgba(92, 108, 255, 0.1)',
            tension: 0.2,
            fill: false,
            pointRadius: 0,
          },
          {
            label: 'Holt-Winters Forecast',
            data: [...new Array(values.length - 1).fill(null), values[values.length - 1], ...forecast],
            borderColor: 'rgba(100, 230, 209, 1)',
            borderDash: [6, 4],
            tension: 0.2,
            fill: false,
            pointRadius: 0,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' },
          tooltip: { mode: 'index', intersect: false },
        },
        scales: {
          x: { ticks: { maxTicksLimit: 12 } },
          y: { title: { display: true, text: 'Index (1982–84=100)' } },
        },
      },
    });
  } else {
    charts.forecast.data.labels = [...labels, ...forecastLabels];
    charts.forecast.data.datasets[0].data = [...values, ...new Array(forecast.length).fill(null)];
    charts.forecast.data.datasets[1].data = [...new Array(values.length - 1).fill(null), values[values.length - 1], ...forecast];
    charts.forecast.update();
  }
  const avgForecast = forecast.reduce((sum, val) => sum + val, 0) / forecast.length;
  const latest = values[values.length - 1];
  const change = ((avgForecast - latest) / latest) * 100;
  document.getElementById('forecastInsight').innerHTML = `
    <p><strong>Model:</strong> Additive Holt-Winters (α=0.6, β=0.2, γ=0.2, seasonality=12)</p>
    <p>Projected average CPI over the next 12 months: <strong>${avgForecast.toFixed(1)}</strong>.</p>
    <p>Directional change versus last observation: <strong>${change >= 0 ? '▲' : '▼'} ${Math.abs(change).toFixed(2)}%</strong>.</p>
    <p>Level (${level.toFixed(2)}), trend (${trend.toFixed(2)}), and last seasonal effect (${seasonal.toFixed(2)}) confirm the inflation regime embedded in the resume-backed forecasting process.</p>
  `;
}

function computeYoY(series, lag) {
  if (series.length <= lag) return 0;
  const latest = series[series.length - 1];
  const previous = series[series.length - 1 - lag];
  return ((latest - previous) / previous) * 100;
}

function computeSlope(series) {
  if (series.length < 2) return 0;
  const xMean = (series.length - 1) / 2;
  const yMean = series.reduce((sum, value) => sum + value, 0) / series.length;
  let numerator = 0;
  let denominator = 0;
  series.forEach((value, index) => {
    numerator += (index - xMean) * (value - yMean);
    denominator += (index - xMean) ** 2;
  });
  return denominator === 0 ? 0 : numerator / denominator;
}

function holtWintersAdditive(series, seasonLength, alpha, beta, gamma, periods) {
  if (series.length < seasonLength * 2) {
    throw new Error('Need at least two full seasons of data for Holt-Winters.');
  }
  const seasonAverages = [];
  const seasons = Math.floor(series.length / seasonLength);
  for (let j = 0; j < seasons; j += 1) {
    const start = j * seasonLength;
    const slice = series.slice(start, start + seasonLength);
    seasonAverages.push(slice.reduce((sum, value) => sum + value, 0) / seasonLength);
  }
  const initialLevel = seasonAverages[0];
  let initialTrend = 0;
  for (let i = 0; i < seasonLength; i += 1) {
    initialTrend += (series[i + seasonLength] - series[i]) / seasonLength;
  }
  initialTrend /= seasonLength;
  const seasonals = new Array(seasonLength).fill(0).map((_, idx) => series[idx] - initialLevel);

  let level = initialLevel;
  let trend = initialTrend;
  const fitted = [];
  for (let t = 0; t < series.length; t += 1) {
    const seasonalIndex = t % seasonLength;
    const value = series[t];
    const seasonal = seasonals[seasonalIndex];
    const prevLevel = level;
    level = alpha * (value - seasonal) + (1 - alpha) * (level + trend);
    trend = beta * (level - prevLevel) + (1 - beta) * trend;
    seasonals[seasonalIndex] = gamma * (value - level) + (1 - gamma) * seasonal;
    fitted.push(level + trend + seasonals[seasonalIndex]);
  }
  const forecast = [];
  for (let m = 1; m <= periods; m += 1) {
    const seasonal = seasonals[(series.length + m - 1) % seasonLength];
    forecast.push(level + m * trend + seasonal);
  }
  return { forecast, fitted, level, trend, seasonal: seasonals[(series.length - 1) % seasonLength] };
}

function offsetMonths(dateString, offset) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  date.setMonth(date.getMonth() + offset);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
