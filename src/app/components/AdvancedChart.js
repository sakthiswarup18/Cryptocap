// src/app/components/AdvancedChart.js
"use client";

import React, { useMemo } from "react";
import { useTheme } from "next-themes";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Chart } from "react-chartjs-2";

// register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const AdvancedChart = ({
  labels,
  priceData,
  volumeData,
  predictedPriceData,
  predictedLowerData,
  predictedUpperData,
}) => {
  // pull current theme from next-themes
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // memoize our two colors
  const { textColor, gridColor, tooltipBg } = useMemo(() => {
    return {
      textColor: isDark ? "#ededed" : "#000000",
      gridColor: isDark ? "rgba(237,237,237,0.2)" : "rgba(0,0,0,0.2)",
      tooltipBg: isDark ? "#0a0a0a" : "#ffffff",
    };
  }, [isDark]);

  // build datasets (same as before)
  const datasets = [
    {
      type: "line",
      label: "Price (USD)",
      data: priceData,
      borderColor: "#EEBC1D",
      backgroundColor: "#EEBC1D",
      yAxisID: "y",
      tension: 0.4,
      borderWidth: 2,
      fill: false,
    },
    {
      type: "bar",
      label: "Volume",
      data: volumeData,
      backgroundColor: "rgba(75, 192, 192, 0.4)",
      borderColor: "rgba(75, 192, 192, 1)",
      borderWidth: 1,
      yAxisID: "y1",
    },
  ];

  if (predictedPriceData) {
    datasets.push({
      type: "line",
      label: "Forecast",
      data: predictedPriceData,
      borderColor: "rgba(255, 99, 132, 1)",
      borderDash: [6, 6],
      backgroundColor: "rgba(255, 99, 132, 0.2)",
      yAxisID: "y",
      tension: 0.4,
      borderWidth: 2,
      fill: false,
    });
  }

  if (predictedLowerData && predictedUpperData) {
    datasets.push(
      {
        type: "line",
        label: "Upper Confidence",
        data: predictedUpperData,
        borderColor: "rgba(0,0,0,0)",
        backgroundColor: "rgba(255, 99, 132, 0.1)",
        yAxisID: "y",
        fill: "-1",
        pointRadius: 0,
        tension: 0.4,
      },
      {
        type: "line",
        label: "Lower Confidence",
        data: predictedLowerData,
        borderColor: "rgba(0,0,0,0)",
        backgroundColor: "rgba(0,0,0,0)",
        yAxisID: "y",
        pointRadius: 0,
        tension: 0.4,
      }
    );
  }

  const data = { labels, datasets };

  const options = {
    responsive: true,
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      legend: {
        position: "top",
        labels: { color: textColor },
      },
      tooltip: {
        enabled: true,
        titleColor: textColor,
        bodyColor: textColor,
        backgroundColor: tooltipBg,
        borderColor: gridColor,
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        ticks: { color: textColor },
        grid: { color: gridColor },
      },
      y: {
        position: "left",
        title: { display: true, text: "Price (USD)", color: textColor },
        ticks: { color: textColor },
        grid: { color: gridColor },
      },
      y1: {
        position: "right",
        title: { display: true, text: "Volume", color: textColor },
        ticks: { color: textColor },
        grid: { drawOnChartArea: false, color: gridColor },
      },
    },
  };

  // by giving the wrapper a key that changes with theme,
  // we force Chart.js to fully remount & pick up new colors
  return (
    <div className="p-4" key={theme}>
      <Chart data={data} options={options} />
    </div>
  );
};

export default AdvancedChart;
