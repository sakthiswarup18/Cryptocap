// src/app/components/HoltWintersForecastChart.js
"use client";

import React, { useMemo } from "react";
import { Line } from "react-chartjs-2";
import ChartJS from "./chartTheme";  // only to initialize the theme
import { useTheme } from "next-themes";

// Exportable Holt–Winters additive forecast function
export function holtWintersAdditive(
  prices,
  horizon = 7,
  alpha = 0.2,
  beta = 0.1,
  gamma = 0.3,
  seasonLength = 7
) {
  if (!Array.isArray(prices) || prices.length === 0) {
    return [];
  }
  const n = prices.length;
  if (n < seasonLength * 2) {
    return Array(n + horizon).fill(prices[prices.length - 1]);
  }
  let level = prices[0];
  let trend = prices[1] - prices[0];
  const seasonals = new Array(seasonLength).fill(0);
  for (let i = 0; i < seasonLength; i++) {
    seasonals[i] = prices[i] - level;
  }
  const forecast = [];
  for (let t = 0; t < n + horizon; t++) {
    const idx = t % seasonLength;
    const seasonal = seasonals[idx] || 0;
    if (t < n) {
      const value = prices[t];
      const lastLevel = level;
      level = alpha * (value - seasonal) + (1 - alpha) * (level + trend);
      trend = beta * (level - lastLevel) + (1 - beta) * trend;
      seasonals[idx] = gamma * (value - level) + (1 - gamma) * seasonal;
      forecast.push(level + trend + seasonals[idx]);
    } else {
      forecast.push(level + trend * (t - n + 1) + seasonals[idx]);
    }
  }
  return forecast;
}

const HoltWintersForecastChart = ({ labels = [], prices = [] }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const { textColor, gridColor, tooltipBg } = useMemo(() => ({
    textColor:  isDark ? "#ededed"             : "#000000",
    gridColor:  isDark ? "rgba(237,237,237,0.2)" : "rgba(0,0,0,0.2)",
    tooltipBg:  isDark ? "#14161a"             : "#ffffff",
  }), [isDark]);

  if (!Array.isArray(prices) || prices.length === 0) {
    return (
      <div className="text-center text-gray-400 py-4">
        No data for Holt–Winters
      </div>
    );
  }

  const full   = holtWintersAdditive(prices, 7);
  const fitted = full.slice(0, prices.length);
  const future = full.slice(prices.length);

  return (
    <div key={theme} style={{ position: "relative", height: "400px" }}>
      <Line
        data={{
          labels: [...labels, ...future.map((_, i) => `+${i + 1}`)],
          datasets: [
            {
              label: "Historical Price",
              data: prices,
              borderColor: "#EEBC1D",
              fill: false,
              tension: 0.4,
              pointRadius: 0,
            },
            {
              label: "Holt–Winters Forecast",
              data: [...fitted, ...future],
              borderColor: "#82ca9d",
              borderDash: [5, 5],
              fill: false,
              tension: 0.4,
              pointRadius: 0,
            },
          ],
        }}
        options={{
          maintainAspectRatio: false,
          plugins: {
            legend: { position: "top", labels: { color: textColor } },
            tooltip: {
              mode: "index",
              intersect: false,
              backgroundColor: tooltipBg,
              titleColor: textColor,
              bodyColor: textColor,
              borderColor: gridColor,
              borderWidth: 1,
            },
          },
          interaction: { mode: "nearest", axis: "x", intersect: false },
          scales: {
            x: {
              ticks: { color: textColor },
              grid:  { color: gridColor },
            },
            y: {
              title: { display: true, text: "Price (USD)", color: textColor },
              ticks: { color: textColor },
              grid:  { color: gridColor },
            },
          },
        }}
      />
    </div>
  );
};

export default HoltWintersForecastChart;
