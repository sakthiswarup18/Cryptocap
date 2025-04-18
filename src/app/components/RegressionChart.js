// src/app/components/RegressionChart.js
"use client";

import React, { useMemo } from "react";
import { Line } from "react-chartjs-2";
import ChartJS from "./chartTheme";  // initializes your global theme
import { useTheme } from "next-themes";

const RegressionChart = ({ labels = [], actual = [], linear = [], quadratic = [] }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const { textColor, gridColor, tooltipBg } = useMemo(() => ({
    textColor:  isDark ? "#ededed"             : "#000000",
    gridColor:  isDark ? "rgba(237,237,237,0.2)" : "rgba(0,0,0,0.2)",
    tooltipBg:  isDark ? "#14161a"             : "#ffffff",
  }), [isDark]);

  const len           = labels.length;
  const actualData    = actual.slice(0, len);
  const linearData    = linear.slice(0, len);
  const quadraticData = quadratic.slice(0, len);

  return (
    <div key={theme} style={{ position: "relative", height: "350px" }}>
      <Line
        data={{
          labels,
          datasets: [
            {
              label: "Actual Price",
              data: actualData,
              borderColor: "#EEBC1D",
              fill: false,
              tension: 0.4,
            },
            {
              label: "Linear Fit",
              data: linearData,
              borderColor: "#4bc0c0",
              borderDash: [6, 6],
              fill: false,
              tension: 0.4,
            },
            {
              label: "Quadratic Fit",
              data: quadraticData,
              borderColor: "#ff6384",
              borderDash: [3, 3],
              fill: false,
              tension: 0.4,
            },
          ],
        }}
        options={{
          maintainAspectRatio: false,
          plugins: {
            legend: { position: "top", labels: { color: textColor } },
            title:  { display: true, text: "Regression Analysis", color: textColor },
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
              beginAtZero: false,
            },
          },
        }}
      />
    </div>
  );
};

export default RegressionChart;
