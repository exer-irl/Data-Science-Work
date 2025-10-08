const profileConfig = {
  hero: {
    name: 'Caleb Drew',
    greeting: 'Hello, I\'m',
    tagline:
      'Building data products that combine real-time intelligence, predictive analytics, and beautiful storytelling.',
    resumeUrl: 'Caleb_Drew_Resume.pdf',
    contactMailto: 'mailto:you@example.com?subject=Let\'s build data products',
    stats: {
      years: 8,
      projects: 36,
      industries: 9,
    },
  },
  skills: [
    {
      title: 'Data Science & AI',
      description: 'Forecasting, causal inference, experimentation, and NLP for executive-ready decisions.',
      tags: ['Time Series', 'Causal ML', 'LLMs', 'Uplift Modeling'],
    },
    {
      title: 'Analytics Engineering',
      description: 'Composable dbt, streaming transformations, reverse ETL, and semantic layers.',
      tags: ['dbt', 'Dagster', 'Airbyte', 'DuckDB'],
    },
    {
      title: 'Cloud & MLOps',
      description: 'Model governance, feature stores, automated retraining, and infra as code.',
      tags: ['Azure', 'AWS', 'Feature Store', 'Kubernetes'],
    },
    {
      title: 'Product Leadership',
      description: 'Translate ambiguous questions into measurable impact with data storytelling and OKRs.',
      tags: ['Roadmapping', 'Stakeholder Ops', 'Design Sprints'],
    },
  ],
  resumeTimeline: [
    {
      title: 'Head of Data Science',
      company: 'HyperGrowth SaaS',
      impact: 'Scaled experimentation platform, increasing ARR forecasting accuracy by 22%.',
      year: '2024',
      category: ['leadership', 'data-science'],
    },
    {
      title: 'Principal Data Scientist',
      company: 'Fortune 100 Retailer',
      impact: 'Launched omni-channel demand forecasting that reduced stockouts by 18%.',
      year: '2022',
      category: ['data-science'],
    },
    {
      title: 'Staff Analytics Engineer',
      company: 'Global Marketplace',
      impact: 'Rebuilt streaming ETL fabric to deliver sub-5 minute SLA dashboards.',
      year: '2020',
      category: ['engineering'],
    },
    {
      title: 'Data Scientist',
      company: 'Healthcare Innovator',
      impact: 'Delivered risk stratification models reaching 6M patients nationwide.',
      year: '2018',
      category: ['data-science', 'leadership'],
    },
  ],
  githubUsername: 'calebdrew',
  feeds: {
    investorFlows: {
      primary: 'https://raw.githubusercontent.com/datasets/investor-flow-of-funds-us/master/data/weekly.csv',
      fallback: 'data/investor_flows_sample.csv',
    },
    stocks: {
      primary: 'https://raw.githubusercontent.com/vega/vega-datasets/master/data/stocks.csv',
      fallback: 'data/stocks_sample.csv',
    },
    unemployment: {
      primary: 'https://raw.githubusercontent.com/vega/vega-datasets/master/data/unemployment-across-industries.json',
      fallback: 'data/unemployment_sample.json',
    },
    covidUs: {
      primary: 'https://raw.githubusercontent.com/nytimes/covid-19-data/master/us.csv',
      fallback: 'data/covid_us_sample.csv',
    },
    volatility: {
      primary: 'https://raw.githubusercontent.com/plotly/datasets/master/finance-charts-apple.csv',
      fallback: 'data/volatility_sample.csv',
    },
    usStates: {
      primary: 'https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json',
      fallback: 'data/us_states.geojson',
    },
    unsoldHousing: {
      primary: 'https://raw.githubusercontent.com/calebdrew/calebdrew/work/docs/data/unsold_housing_index.json',
      fallback: 'data/unsold_housing_index.json',
    },
    githubReposFallback: 'data/github_repos_sample.json',
  },
};

const charts = {};

function normalizeFeed(feedOrUrl, fallbackUrl) {
  if (!feedOrUrl) {
    throw new Error('Feed configuration not provided.');
  }
  if (typeof feedOrUrl === 'string') {
    return { primary: feedOrUrl, fallback: fallbackUrl };
  }
  if (feedOrUrl && typeof feedOrUrl === 'object') {
    const primary = feedOrUrl.primary;
    if (!primary) {
      throw new Error('Feed configuration missing a primary URL.');
    }
    return {
      primary,
      fallback: feedOrUrl.fallback ?? fallbackUrl,
    };
  }
  throw new Error('Invalid feed configuration supplied.');
}

async function fetchWithFallback(url, fallbackUrl) {
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) {
      throw new Error(`Primary feed unavailable (${res.status})`);
    }
    return res;
  } catch (error) {
    if (!fallbackUrl) throw error;
    console.warn(`Falling back from ${url} to ${fallbackUrl}:`, error.message);
    const res = await fetch(fallbackUrl);
    if (!res.ok) throw new Error(`Fallback feed failed (${res.status})`);
    return res;
  }
}

async function fetchJson(feedOrUrl, fallbackUrl) {
  const { primary, fallback } = normalizeFeed(feedOrUrl, fallbackUrl);
  const res = await fetchWithFallback(primary, fallback);
  return res.json();
}

async function fetchCsv(feedOrUrl, fallbackUrl) {
  const { primary, fallback } = normalizeFeed(feedOrUrl, fallbackUrl);
  const res = await fetchWithFallback(primary, fallback);
  const text = await res.text();
  const [headerLine, ...lines] = text.trim().split(/\r?\n/);
  const headers = headerLine.split(',').map((h) => h.trim());
  return lines
    .map((line) => line.split(/,(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/).map((cell) => cell.replace(/^"|"$/g, '')))
    .filter((cells) => cells.length === headers.length)
    .map((cells) =>
      headers.reduce((row, header, index) => {
        row[header] = cells[index];
        return row;
      }, {})
    );
}

function renderHero() {
  const { name, greeting, tagline, resumeUrl, contactMailto, stats } = profileConfig.hero;
  document.getElementById('hero-name').textContent = name;
  document.getElementById('hero-greeting').textContent = greeting;
  document.getElementById('hero-tagline').textContent = tagline;
  document.getElementById('download-resume').onclick = () => {
    const link = document.createElement('a');
    link.href = resumeUrl;
    link.target = '_blank';
    link.rel = 'noopener';
    if (!/^https?:/i.test(resumeUrl)) {
      link.download = resumeUrl.split('/').pop() || 'Caleb_Drew_Resume.pdf';
    }
    document.body.appendChild(link);
    link.click();
    link.remove();
  };
  document.getElementById('contact-me').onclick = () => (window.location.href = contactMailto);
  document.getElementById('statYears').textContent = stats.years;
  document.getElementById('statProjects').textContent = stats.projects;
  document.getElementById('statIndustries').textContent = stats.industries;

  const signatureCtx = document.getElementById('signatureChart');
  charts.signature = new Chart(signatureCtx, {
    type: 'radar',
    data: {
      labels: ['Strategy', 'AI', 'Data Engineering', 'Product', 'Storytelling'],
      datasets: [
        {
          label: 'Capability Footprint',
          data: [98, 92, 88, 85, 95],
          backgroundColor: 'rgba(100, 230, 209, 0.15)',
          borderColor: 'rgba(100, 230, 209, 0.9)',
          borderWidth: 2,
          pointRadius: 3,
        },
      ],
    },
    options: {
      plugins: { legend: { display: false } },
      scales: {
        r: {
          min: 0,
          max: 100,
          grid: { color: 'rgba(255,255,255,0.08)' },
          angleLines: { color: 'rgba(255,255,255,0.1)' },
          ticks: { display: false },
        },
      },
    },
  });
}

function renderSkills() {
  const container = document.getElementById('skillMatrix');
  profileConfig.skills.forEach((skill) => {
    const chip = document.createElement('article');
    chip.className = 'skill-chip';
    chip.innerHTML = `
      <span class="pill">${skill.title}</span>
      <p class="title">${skill.description}</p>
      <div class="tag-grid">${skill.tags
        .map((tag) => `<span class="tag">${tag}</span>`)
        .join('')}</div>
    `;
    container.appendChild(chip);
  });
}

async function renderGithubSection() {
  const { githubUsername } = profileConfig;
  if (!githubUsername) return;
  try {
    let repos = [];
    try {
      const response = await fetch(
        `https://api.github.com/users/${githubUsername}/repos?per_page=100&sort=updated`,
        {
          headers: { Accept: 'application/vnd.github+json' },
          cache: 'no-store',
        }
      );
      if (!response.ok) {
        throw new Error(`GitHub API unavailable (${response.status})`);
      }
      repos = await response.json();
    } catch (apiError) {
      console.warn('Falling back to cached GitHub analytics dataset', apiError);
      repos = await fetchJson(profileConfig.feeds.githubReposFallback);
    }

    if (!repos || !repos.length) {
      throw new Error('No repository data available.');
    }
    const languageCounts = repos.reduce((acc, repo) => {
      if (repo.language) {
        acc[repo.language] = (acc[repo.language] || 0) + repo.stargazers_count + 1;
      }
      return acc;
    }, {});
    const topLanguages = Object.entries(languageCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);

    const ctx = document.getElementById('langChart');
    charts.githubLanguages = new Chart(ctx, {
      type: 'polarArea',
      data: {
        labels: topLanguages.map(([language]) => language),
        datasets: [
          {
            data: topLanguages.map(([, score]) => score),
            backgroundColor: topLanguages.map((_, index) => `hsla(${index * 45}, 90%, 60%, 0.6)`),
            borderColor: 'rgba(255,255,255,0.2)',
          },
        ],
      },
      options: {
        plugins: { legend: { position: 'right' } },
        scales: { r: { grid: { color: 'rgba(255,255,255,0.08)' } } },
      },
    });

    const repoList = document.getElementById('repoList');
    repoList.innerHTML = '';
    repos
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, 6)
      .forEach((repo) => {
        const item = document.createElement('li');
        item.className = 'repo-item';
        item.innerHTML = `
          <div>
            <strong>${repo.name}</strong>
            <span>${repo.description || 'No description provided yet.'}</span>
          </div>
          <div>
            ⭐ ${repo.stargazers_count.toLocaleString()}<br />
            🍴 ${repo.forks_count.toLocaleString()}
          </div>
        `;
        repoList.appendChild(item);
      });
  } catch (error) {
    document.getElementById('repoList').innerHTML = `<li class="repo-item">${error.message}</li>`;
    console.error(error);
  }
}

async function renderFundFlows() {
  try {
    const rows = await fetchCsv(profileConfig.feeds.investorFlows);
    const parsedRows = rows
      .slice(-60)
      .map((row) => {
        const label = row['Date'] || row['date'] || row['Week'] || row['week'];
        const raw = row['Total'] ?? row['total'] ?? row['TOTAL'];
        const cleaned = typeof raw === 'string' ? raw : raw != null ? String(raw) : '';
        const value = Number(cleaned.replace(/[^0-9.-]/g, ''));
        return { label, value };
      })
      .filter((entry) => entry.label && Number.isFinite(entry.value));
    if (!parsedRows.length) {
      throw new Error('No valid capital flow observations available.');
    }
    const labels = parsedRows.map((entry) => entry.label);
    const values = parsedRows.map((entry) => entry.value);
    const ctx = document.getElementById('flowChart');
    charts.fundFlow = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Total Fund Flows (USD Millions)',
            data: values,
            borderColor: 'rgba(92,108,255,0.8)',
            backgroundColor: 'rgba(92,108,255,0.25)',
            fill: true,
            tension: 0.35,
          },
        ],
      },
      options: {
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: 'rgba(255,255,255,0.7)' } },
          y: { ticks: { color: 'rgba(255,255,255,0.7)' }, grid: { color: 'rgba(255,255,255,0.05)' } },
        },
      },
    });

    const latest = values[values.length - 1];
    const avg = values.reduce((acc, val) => acc + val, 0) / values.length;
    const delta = latest - avg;
    document.getElementById('flowInsight').textContent =
      `Latest net flow is ${latest.toFixed(1)}M vs ${avg.toFixed(1)}M average. ${
        delta >= 0 ? 'Bullish inflow momentum detected.' : 'Monitoring outflows for risk alerts.'
      }`;
  } catch (error) {
    document.getElementById('flowInsight').textContent = `Unable to load business ops feed: ${error.message}`;
    console.error(error);
  }
}

function linearRegressionForecast(series, horizon, optimism = 0.5) {
  const n = series.length;
  const xMean = (n - 1) / 2;
  const yMean = series.reduce((sum, value) => sum + value, 0) / n;
  const numerator = series.reduce((sum, y, i) => sum + (i - xMean) * (y - yMean), 0);
  const denominator = series.reduce((sum, _, i) => sum + (i - xMean) ** 2, 0) || 1;
  const slope = numerator / denominator;
  const intercept = yMean - slope * xMean;
  const adjustedSlope = slope * (0.8 + optimism * 0.6);
  const forecast = [];
  for (let i = 1; i <= horizon; i += 1) {
    const x = n - 1 + i;
    forecast.push(intercept + adjustedSlope * x);
  }
  return forecast;
}

async function renderRevenueForecast(symbol = 'MSFT') {
  try {
    const rows = await fetchCsv(profileConfig.feeds.stocks);
    const companyRows = rows.filter((row) => row.symbol === symbol.toUpperCase());
    if (!companyRows.length) {
      throw new Error(`No dataset entries for ${symbol}. Try MSFT, AAPL, AMZN, GOOG, FB, IBM.`);
    }
    const chronological = companyRows.sort((a, b) => new Date(a.date) - new Date(b.date));
    const closing = chronological.map((row) => Number(row.price));
    const horizon = Number(document.getElementById('horizon').value) || 9;
    const optimism = Number(document.getElementById('optimism').value) || 0.5;
    const forecast = linearRegressionForecast(closing.slice(-24), horizon, optimism);

    const labels = [...chronological.slice(-24).map((row) => row.date), ...forecast.map((_, idx) => `+${idx + 1}`)];
    const datasetActual = closing.slice(-24);
    if (!datasetActual.length) {
      throw new Error('Not enough historical price data to compute a forecast.');
    }
    if (!forecast.length) {
      throw new Error('Forecast window produced no projections.');
    }
    const ctx = document.getElementById('revChart');
    if (charts.revenueForecast) charts.revenueForecast.destroy();
    charts.revenueForecast = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Historical (synthetic revenue)',
            data: [...datasetActual, null, null],
            borderColor: 'rgba(92,108,255,0.8)',
            pointRadius: 0,
            tension: 0.35,
          },
          {
            label: 'Forecast',
            data: [...Array(datasetActual.length).fill(null), ...forecast],
            borderColor: 'rgba(100,230,209,0.85)',
            borderDash: [6, 6],
            pointRadius: 0,
          },
        ],
      },
      options: {
        plugins: { legend: { position: 'bottom' } },
        scales: { y: { grid: { color: 'rgba(255,255,255,0.05)' } } },
      },
    });

    const lastActual = datasetActual.at(-1);
    const finalForecast = forecast.at(-1);
    document.getElementById('revenue-company-title').textContent = `${symbol.toUpperCase()} Revenue Scenario`;
    document.getElementById('revInsight').textContent = `Projected quarter-end revenue proxy: ${finalForecast.toFixed(
      2
    )} (vs last actual ${lastActual.toFixed(2)}). ${optimism > 0.5 ? 'Optimistic growth bias applied.' : 'Conservative projection active.'}`;
  } catch (error) {
    document.getElementById('revInsight').textContent = error.message;
    console.error(error);
  }
}

function attachRevenueControls() {
  document.getElementById('runRev').addEventListener('click', () => {
    const symbol = document.getElementById('sym').value || 'MSFT';
    renderRevenueForecast(symbol);
  });
}

function colorScale(value) {
  const min = 1.5;
  const max = 5.0;
  const clamped = Math.max(min, Math.min(max, value));
  const ratio = (clamped - min) / (max - min);
  const hue = 220 - ratio * 220;
  return `hsl(${hue}, 75%, ${40 + ratio * 20}%)`;
}

async function renderHousingMap() {
  try {
    const housingData = await fetchJson(profileConfig.feeds.unsoldHousing);
    if (!housingData?.states?.length) {
      throw new Error('Housing dataset missing state inventory data.');
    }
    const stateData = Object.fromEntries(
      housingData.states.map((entry) => [entry.code, entry.inventoryIndex])
    );

    const map = L.map('housing-map', {
      scrollWheelZoom: false,
      attributionControl: false,
    }).setView([37.8, -96], 4);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
    }).addTo(map);

    const geojson = await fetchJson(profileConfig.feeds.usStates);
    L.geoJSON(geojson, {
      style: (feature) => {
        const abbr = feature.properties.postal;
        const value = stateData[abbr];
        return {
          fillColor: value ? colorScale(value) : 'rgba(255,255,255,0.05)',
          weight: 1,
          opacity: 1,
          color: 'rgba(0,0,0,0.4)',
          fillOpacity: 0.85,
        };
      },
      onEachFeature: (feature, layer) => {
        const abbr = feature.properties.postal;
        const value = stateData[abbr];
        layer.bindPopup(
          `<strong>${feature.properties.name}</strong><br/>Unsold inventory index: ${value ? value.toFixed(2) : 'N/A'}`
        );
      },
    }).addTo(map);
  } catch (error) {
    document.getElementById('housing-map').innerHTML = `<p>${error.message}</p>`;
    console.error(error);
  }
}

async function renderMacroForecast() {
  try {
    const housingData = await fetchJson(profileConfig.feeds.unsoldHousing);
    if (!housingData?.states?.length) {
      throw new Error('Housing dataset missing state inventory data.');
    }
    const unsoldAverage =
      housingData.states.reduce((acc, entry) => acc + entry.inventoryIndex, 0) /
      housingData.states.length;

    const unemployment = await fetchJson(profileConfig.feeds.unemployment);
    const recent = unemployment.slice(-36);
    const grouped = recent.reduce((acc, row) => {
      const isoDate = row.date || (row.year && row.month ? `${row.year}-${String(row.month).padStart(2, '0')}` : null);
      if (!isoDate) return acc;
      const key = isoDate.slice(0, 7);
      const measurement = Number(row.unemployed ?? row.count ?? row.value ?? row.Total ?? 0);
      if (!Number.isFinite(measurement)) return acc;
      acc[key] = acc[key] || [];
      acc[key].push(measurement);
      return acc;
    }, {});
    const unemploymentAverage = Object.entries(grouped)
      .sort(([a], [b]) => (a > b ? 1 : -1))
      .map(([date, values]) => ({
        date,
        value:
          values.map((val) => Number(val)).reduce((sum, val) => sum + val, 0) / values.length,
      }));

    const combined = unemploymentAverage.slice(-8).map((entry, idx, arr) => ({
      date: entry.date,
      housingIndex: unsoldAverage,
      unemployment: entry.value,
      composite: unsoldAverage * 20 + entry.value / 200,
      quarter: idx === arr.length - 1 ? 'Forecast' : 'Observed',
    }));

    const latestComposite = combined.at(-1)?.composite ?? unsoldAverage * 20;
    const priorComposite = combined.length > 1 ? combined.at(-2).composite : latestComposite;
    const forecastNext = latestComposite * 0.98;
    const ctx = document.getElementById('macroChart');
    if (charts.macroForecast) charts.macroForecast.destroy();
    charts.macroForecast = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: combined.map((row) => row.date),
        datasets: [
          {
            label: 'Composite Growth Signal',
            data: combined.map((row) => row.composite),
            backgroundColor: 'rgba(92,108,255,0.7)',
          },
        ],
      },
      options: {
        plugins: { legend: { display: false } },
        scales: { y: { grid: { color: 'rgba(255,255,255,0.05)' } } },
      },
    });

    document.getElementById('macroInsight').textContent = `Projected GDP growth proxy for next quarter: ${forecastNext
      .toFixed(1)
      .toString()} vs baseline ${priorComposite.toFixed(1)}. Inventory index baseline ${unsoldAverage.toFixed(2)}.`;
  } catch (error) {
    document.getElementById('macroInsight').textContent = `Macro forecast unavailable: ${error.message}`;
    console.error(error);
  }
}

async function renderLiveDashboards() {
  try {
    const [covidRows, volatilityRows] = await Promise.all([
      fetchCsv(profileConfig.feeds.covidUs),
      fetchCsv(profileConfig.feeds.volatility),
    ]);

    const covidRecent = covidRows.slice(-60);
    if (!covidRecent.length) {
      throw new Error('No public health trend data available.');
    }
    const covidLabels = covidRecent.map((row) => row.date);
    const covidCases = covidRecent.map((row) => Number(row.cases));
    const ctxTrend = document.getElementById('usTrend');
    charts.usTrend = new Chart(ctxTrend, {
      type: 'line',
      data: {
        labels: covidLabels,
        datasets: [
          {
            label: 'Cumulative Cases',
            data: covidCases,
            borderColor: 'rgba(255, 99, 132, 0.9)',
            backgroundColor: 'rgba(255, 99, 132, 0.25)',
            fill: true,
            tension: 0.25,
          },
        ],
      },
      options: {
        plugins: { legend: { display: false } },
        scales: { y: { grid: { color: 'rgba(255,255,255,0.05)' } } },
      },
    });

    const volatilityRecent = volatilityRows.slice(-180);
    if (!volatilityRecent.length) {
      throw new Error('No market volatility data available.');
    }
    const volatilityLabels = volatilityRecent.map((row) => row.Date);
    const closePrices = volatilityRecent.map((row) => Number(row['AAPL.Close']));
    const volatilitySeries = closePrices.map((price, idx, arr) => {
      if (idx === 0) return 0;
      return Math.abs(price - arr[idx - 1]);
    });
    const ctxVolatility = document.getElementById('volChart');
    charts.volatility = new Chart(ctxVolatility, {
      type: 'line',
      data: {
        labels: volatilityLabels,
        datasets: [
          {
            label: 'Daily Volatility Proxy',
            data: volatilitySeries,
            borderColor: 'rgba(100, 230, 209, 0.9)',
            pointRadius: 0,
          },
        ],
      },
      options: {
        plugins: { legend: { display: false } },
        scales: { y: { grid: { color: 'rgba(255,255,255,0.05)' } } },
      },
    });

    const signals = [
      {
        label: '14-day case delta',
        value:
          covidCases.at(-1) - covidCases.at(-14) > 0
            ? 'Cases trending upward – activate health risk comms.'
            : 'Cases stabilizing – maintain vigilance.',
      },
      {
        label: 'Volatility spike',
        value:
          Math.max(...volatilitySeries.slice(-10)) > Math.max(...volatilitySeries.slice(-60, -10))
            ? 'Spike detected – reassess hedging strategy.'
            : 'Volatility calm – steady risk posture.',
      },
      {
        label: 'Housing inventory baseline',
        value: 'See macro outlook for region-specific signals.',
      },
    ];
    const signalList = document.getElementById('signalList');
    signalList.innerHTML = signals
      .map((signal) => `<li class="signal-item"><strong>${signal.label}:</strong> ${signal.value}</li>`)
      .join('');
  } catch (error) {
    document.getElementById('signalList').innerHTML = `<li class="signal-item">${error.message}</li>`;
    console.error(error);
  }
}

function renderResume() {
  const timeline = document.getElementById('timeline');
  const render = (filter) => {
    timeline.innerHTML = '';
    profileConfig.resumeTimeline
      .filter((entry) => filter === 'all' || entry.category.includes(filter))
      .forEach((entry) => {
        const card = document.createElement('article');
        card.className = 'timeline-card';
        card.dataset.year = entry.year;
        card.innerHTML = `
          <h4>${entry.title} · ${entry.company}</h4>
          <p>${entry.impact}</p>
        `;
        timeline.appendChild(card);
      });
  };

  render('all');
  document.querySelectorAll('.timeline-controls .btn').forEach((button) => {
    button.addEventListener('click', () => {
      document
        .querySelectorAll('.timeline-controls .btn')
        .forEach((btn) => btn.classList.remove('primary'));
      button.classList.add('primary');
      render(button.dataset.filter);
    });
  });
}

function renderEtLBlueprint() {
  const { feeds } = profileConfig;
  const blueprint = `// Dagster orchestrated pipeline\n@asset\ndef investor_flows_raw():\n    return load_csv('${feeds.investorFlows.primary}')\n\n@asset\ndef unsold_inventory():\n    source = fetch_json('${feeds.unsoldHousing.primary}')\n    if source.is_empty():\n        source = fetch_json('${feeds.unsoldHousing.fallback}')\n    return transform_inventory(source)\n\n@asset\ndef macro_quarter_forecast(investor_flows_raw, unsold_inventory):\n    features = feature_store.combine(investor_flows_raw, unsold_inventory)\n    return forecast_model.predict(features)\n\n@job\ndef intelligence_mesh():\n    macro_quarter_forecast()`;
  document.getElementById('etl').textContent = blueprint;
}

function attachPipelineRunner() {
  const status = document.getElementById('pipe');
  document.getElementById('runPipe').addEventListener('click', async () => {
    status.innerHTML = '';
    const addEvent = (message) => {
      const event = document.createElement('div');
      event.className = 'event';
      event.textContent = `${new Date().toLocaleTimeString()} · ${message}`;
      status.prepend(event);
    };

    addEvent('Pipeline triggered');
    try {
      const investorRows = await fetchCsv(profileConfig.feeds.investorFlows);
      addEvent(`Investor flows fetched (${investorRows.length} rows)`);
      const housingData = await fetchJson(profileConfig.feeds.unsoldHousing);
      addEvent(`Unsold inventory synced (${housingData.states.length} states)`);
      const unemployment = await fetchJson(profileConfig.feeds.unemployment);
      addEvent(`Unemployment dataset ingested (${unemployment.length} rows)`);
      addEvent('Feature engineering completed (lagged growth, supply ratios)');
      addEvent('Forecast published to dashboards ✅');
    } catch (error) {
      addEvent(`Pipeline failed: ${error.message}`);
    }
  });
}

function init() {
  renderHero();
  renderSkills();
  renderGithubSection();
  renderFundFlows();
  renderRevenueForecast();
  attachRevenueControls();
  renderHousingMap();
  renderMacroForecast();
  renderLiveDashboards();
  renderResume();
  renderEtLBlueprint();
  attachPipelineRunner();
}

document.addEventListener('DOMContentLoaded', init);
