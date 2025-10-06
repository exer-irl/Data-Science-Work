"""Demand forecasting pipeline with data acquisition, modeling, and reporting.

This module downloads a real-world monthly passenger dataset, creates a
four-year subset, trains a fine-tuned Holt-Winters exponential smoothing model,
produces next-month and year-ahead forecasts, evaluates accuracy, and offers a
CLI for running the workflow and exporting a chart.
"""
from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, Tuple

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from pandas.tseries.frequencies import to_offset
from sklearn.metrics import mean_absolute_error, mean_squared_error
from statsmodels.tsa.holtwinters import ExponentialSmoothing

DATA_DIR = Path(__file__).resolve().parents[1] / "data"
DATA_DIR.mkdir(exist_ok=True, parents=True)

RAW_DATA_URL = "https://raw.githubusercontent.com/selva86/datasets/master/AirPassengers.csv"
RAW_DATA_PATH = DATA_DIR / "air_passengers.csv"
HISTORY_PATH = DATA_DIR / "demand_history.csv"
FORECAST_PLOT_PATH = DATA_DIR / "demand_forecast.png"


@dataclass(frozen=True)
class ForecastResult:
    history: pd.Series
    forecast: pd.Series
    model_params: dict
    metrics: dict

    @property
    def next_month(self) -> Tuple[pd.Timestamp, float]:
        return self.forecast.index[0], float(self.forecast.iloc[0])


def download_real_dataset(force: bool = False) -> pd.DataFrame:
    """Download the AirPassengers dataset and cache it locally."""
    if not RAW_DATA_PATH.exists() or force:
        df = pd.read_csv(RAW_DATA_URL)
        df.to_csv(RAW_DATA_PATH, index=False)
    else:
        df = pd.read_csv(RAW_DATA_PATH)

    if "Month" in df.columns:
        date_col = "Month"
    elif "date" in df.columns:
        date_col = "date"
    else:
        raise KeyError("Expected a 'Month' or 'date' column in dataset")

    df[date_col] = pd.to_datetime(df[date_col])
    df = df.set_index(date_col).sort_index()

    if "#Passengers" in df.columns:
        value_col = "#Passengers"
    elif "value" in df.columns:
        value_col = "value"
    else:
        raise KeyError("Expected a '#Passengers' or 'value' column in dataset")

    df = df.rename(columns={value_col: "demand"})
    df.index.freq = "MS"
    return df


def build_four_year_history(df: pd.DataFrame) -> pd.Series:
    """Return the last four years (48 months) of demand as a Series."""
    last_month = df.index.max()
    start_month = last_month - pd.DateOffset(months=47)
    history = df.loc[start_month:last_month, "demand"].copy()
    history.index.freq = "MS"
    history.to_csv(HISTORY_PATH, header=True)
    return history


def _candidate_configs() -> Iterable[dict]:
    trends = ["add", "mul", None]
    seasonals = ["add", "mul"]
    seasonal_periods = [12]
    damped_options = [True, False]
    for trend in trends:
        for seasonal in seasonals:
            for damped in damped_options:
                if trend is None and damped:
                    continue
                yield {
                    "trend": trend,
                    "seasonal": seasonal,
                    "seasonal_periods": seasonal_periods[0],
                    "damped_trend": damped,
                }


def _time_series_train_test_split(series: pd.Series, test_size: int = 12) -> Tuple[pd.Series, pd.Series]:
    return series.iloc[:-test_size], series.iloc[-test_size:]


def evaluate_model(series: pd.Series, params: dict) -> dict:
    train, test = _time_series_train_test_split(series)
    model = ExponentialSmoothing(
        train,
        trend=params["trend"],
        seasonal=params["seasonal"],
        seasonal_periods=params["seasonal_periods"],
        damped_trend=params["damped_trend"],
    )
    fit = model.fit(optimized=True, use_brute=True)
    forecast = fit.forecast(len(test))
    mae = mean_absolute_error(test, forecast)
    rmse = np.sqrt(mean_squared_error(test, forecast))
    mape = np.mean(np.abs((test - forecast) / test)) * 100
    return {"mae": mae, "rmse": rmse, "mape": mape}


def select_best_params(series: pd.Series) -> Tuple[dict, dict]:
    best_params = None
    best_metrics = None
    for params in _candidate_configs():
        metrics = evaluate_model(series, params)
        if best_metrics is None or metrics["rmse"] < best_metrics["rmse"]:
            best_params = params
            best_metrics = metrics
    if best_params is None or best_metrics is None:
        raise RuntimeError("No valid model configuration found")
    return best_params, best_metrics


def fit_and_forecast(series: pd.Series, months_ahead: int = 12) -> ForecastResult:
    params, metrics = select_best_params(series)
    model = ExponentialSmoothing(
        series,
        trend=params["trend"],
        seasonal=params["seasonal"],
        seasonal_periods=params["seasonal_periods"],
        damped_trend=params["damped_trend"],
    )
    fit = model.fit(optimized=True, use_brute=True)
    forecast_index = pd.date_range(series.index[-1] + to_offset("MS"), periods=months_ahead, freq="MS")
    forecast_values = fit.forecast(months_ahead)
    forecast_series = pd.Series(forecast_values.values, index=forecast_index, name="forecast")
    return ForecastResult(history=series, forecast=forecast_series, model_params=params, metrics=metrics)


def plot_year_view(result: ForecastResult, out_path: Path | None = None) -> None:
    plt.figure(figsize=(12, 6))
    result.history.plot(label="History", marker="o")
    result.forecast.plot(label="Forecast", marker="o", linestyle="--")
    plt.title("Demand History and Forecast")
    plt.ylabel("Monthly Demand (passengers)")
    plt.xlabel("Month")
    plt.legend()
    plt.grid(True, alpha=0.3)
    if out_path is not None:
        out_path = Path(out_path)
        out_path.parent.mkdir(parents=True, exist_ok=True)
        plt.savefig(out_path, bbox_inches="tight")
    else:
        plt.show()
    plt.close()


def run_pipeline(plot_path: Path | None = FORECAST_PLOT_PATH) -> ForecastResult:
    df = download_real_dataset()
    history = build_four_year_history(df)
    result = fit_and_forecast(history)
    plot_year_view(result, out_path=plot_path)
    return result


def main() -> None:
    result = run_pipeline()
    next_month, value = result.next_month
    print(f"Next month ({next_month:%B %Y}) forecast: {value:.2f} passengers")
    print("Best model parameters:", result.model_params)
    print(
        "Accuracy on last-year holdout -> "
        f"MAE: {result.metrics['mae']:.2f}, RMSE: {result.metrics['rmse']:.2f}, MAPE: {result.metrics['mape']:.2f}%"
    )


if __name__ == "__main__":
    main()
