import pandas as pd
from pandas.testing import assert_index_equal

from src.demand_forecast import (
    ForecastResult,
    build_four_year_history,
    download_real_dataset,
    fit_and_forecast,
    run_pipeline,
)


def test_download_dataset_has_expected_structure(tmp_path, monkeypatch):
    monkeypatch.setattr("src.demand_forecast.RAW_DATA_PATH", tmp_path / "air_passengers.csv")
    df = download_real_dataset(force=True)
    assert "demand" in df.columns
    assert df.index.freqstr == "MS"
    assert df.shape[0] >= 48


def test_build_four_year_history_length(tmp_path, monkeypatch):
    monkeypatch.setattr("src.demand_forecast.HISTORY_PATH", tmp_path / "history.csv")
    df = download_real_dataset(force=True)
    history = build_four_year_history(df)
    assert len(history) == 48
    assert history.index.freqstr == "MS"


def test_fit_and_forecast_returns_next_year(tmp_path, monkeypatch):
    monkeypatch.setattr("src.demand_forecast.RAW_DATA_PATH", tmp_path / "air_passengers.csv")
    monkeypatch.setattr("src.demand_forecast.HISTORY_PATH", tmp_path / "history.csv")
    df = download_real_dataset(force=True)
    history = build_four_year_history(df)
    result = fit_and_forecast(history, months_ahead=12)
    assert isinstance(result, ForecastResult)
    assert len(result.forecast) == 12
    assert result.next_month[0] == pd.Timestamp(history.index[-1] + pd.offsets.MonthBegin())
    assert result.next_month[1] > 0
    assert_index_equal(result.forecast.index, pd.date_range(history.index[-1] + pd.offsets.MonthBegin(), periods=12, freq="MS"))


def test_run_pipeline_generates_results(tmp_path, monkeypatch):
    monkeypatch.setattr("src.demand_forecast.RAW_DATA_PATH", tmp_path / "air_passengers.csv")
    monkeypatch.setattr("src.demand_forecast.HISTORY_PATH", tmp_path / "history.csv")
    monkeypatch.setattr("src.demand_forecast.FORECAST_PLOT_PATH", tmp_path / "forecast.png")
    result = run_pipeline(plot_path=tmp_path / "forecast.png")
    assert result.metrics["mape"] < 20
    assert result.forecast.iloc[0] > 0
    assert (tmp_path / "forecast.png").exists()
