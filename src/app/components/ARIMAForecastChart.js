"use client";
import React from "react";
import useSWR from "swr";
import axios from "axios";
import Arima from "arima";            // this comes from the `arima` npm package
import { Chart } from "react-chartjs-2";

const fetcher = (url) => axios.get(url).then(r => r.data);

export default function ARIMAForecastChart({ coinId, days, history }) {
  const prices = history.map(([, p]) => p);
  // fit an ARIMA(1,1,1)(1,1,1)[7]
  const arima = new Arima({ p:1, d:1, q:1, P:1, D:1, Q:1, s:7 });
  const [forecast] = arima.fit(prices).predict(7);

  const labels = [
    ...history.map(pt => new Date(pt[0]).toLocaleDateString()),
    ...forecast.map((_,i) => `+${i+1}`)
  ];
  const series = Array(prices.length).fill(null).concat(forecast);

  return (
    <Chart
      type="line"
      data={{
        labels,
        datasets: [
          { label: "Historical", data: prices, borderColor: "#EEBC1D", fill: false },
          { label: "SARIMA",       data: series, borderColor: "#ff7300", borderDash: [5,5], fill: false }
        ]
      }}
    />
  );
}
