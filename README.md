# Data-Science-Work

A compilation of different projects under the data science umbrella.

## Demand Forecasting Project

This project delivers a complete demand forecasting workflow using a real-world
monthly passenger dataset (AirPassengers). It automatically downloads the data,
extracts the most recent four years of observations (48 months), fine-tunes a
Holt-Winters exponential smoothing model, evaluates accuracy on a hold-out
window, forecasts the next 12 months, and exports a combined history/forecast
line chart.

### Features
- **Real data acquisition** – downloads the [AirPassengers dataset](https://raw.githubusercontent.com/selva86/datasets/master/AirPassengers.csv) and caches it locally.
- **Four-year training history** – isolates the last 48 months for modeling while
  retaining the full dataset for reference.
- **Automated hyper-parameter search** – grid-searches Holt-Winters options
  (additive/multiplicative trend, seasonal, and damped trend) to minimize RMSE.
- **Accuracy reporting** – prints MAE, RMSE, and MAPE calculated on the last 12
  months of observed data.
- **Visualization** – saves `data/demand_forecast.png` showing historical demand
  and the upcoming 12-month forecast.

### Setup
```bash
pip install -r requirements.txt
```

### Usage
```bash
python -m src.demand_forecast
```
The command prints the next-month forecast, the best-fitting model parameters,
and accuracy metrics for the final year of actual data. It also generates the
line chart in `data/demand_forecast.png`.

### Testing
```bash
pytest
```

## Portfolio Site (GitHub Pages)

The interactive resume and analytics experience lives in the `docs/` folder so
it can be published directly with GitHub Pages. To make the site publicly
available:

1. Push the repository to GitHub.
2. In the GitHub UI, open **Settings → Pages**.
3. Under **Source**, choose **Deploy from a branch**.
4. Select the `main` branch and the `/docs` folder, then click **Save**.

GitHub will build the page and provide a URL like
`https://<your-username>.github.io/<repository-name>/`. Visit that URL to see
the live dashboard.

### Previewing locally

You can also run the page locally by serving the `docs/` directory, for example:

```bash
cd docs
python -m http.server 8000
```

Then open `http://localhost:8000` in a browser.

### Live data sources and fallbacks

The portfolio pulls from openly available datasets so the dashboards render on
GitHub Pages without server-side code. Each feed has an on-platform fallback in
`docs/data/` to guarantee charts render even if the upstream API is
temporarily unavailable.

| Section | Primary feed | Fallback |
| --- | --- | --- |
| Business Ops fund flows | [datasets/investor-flow-of-funds-us](https://github.com/datasets/investor-flow-of-funds-us) | `docs/data/investor_flows_sample.csv` |
| Revenue scenarios | [vega-datasets/stocks.csv](https://github.com/vega/vega-datasets/blob/master/data/stocks.csv) | `docs/data/stocks_sample.csv` |
| Macro outlook (unemployment) | [vega-datasets/unemployment-across-industries](https://github.com/vega/vega-datasets/blob/master/data/unemployment-across-industries.json) | `docs/data/unemployment_sample.json` |
| Macro outlook (unsold housing) | Raw GitHub link to `docs/data/unsold_housing_index.json` | `docs/data/unsold_housing_index.json` |
| Live dashboards (health) | [nytimes/covid-19-data](https://github.com/nytimes/covid-19-data) | `docs/data/covid_us_sample.csv` |
| Live dashboards (volatility) | [plotly/datasets finance-charts-apple](https://github.com/plotly/datasets) | `docs/data/volatility_sample.csv` |
| Open source analytics | GitHub REST API | `docs/data/github_repos_sample.json` |

If you change the default branch name, update the `profileConfig.feeds.unsoldHousing.primary`
URL in `docs/app.js` so it points at the correct branch in the raw GitHub
content path.

### Resume download

Replace the placeholder `docs/Caleb_Drew_Resume.pdf` with your real resume to
enable the hero “Download Resume” button. The button automatically downloads
local files and opens external links in a new tab.
