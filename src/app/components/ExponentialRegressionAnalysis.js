// src/app/components/ExponentialRegressionAnalysis.js
"use client";

import React from "react";
import useSWR from "swr";
import axios from "axios";
import ExponentialRegressionChart from "./ExponentialRegressionChart";
import { HistoricalChart } from "../config/api";

const fetcher = (url) => axios.get(url).then((res) => res.data);

/**
 * Computes exponential regression fit for y = A * e^(B x)
 * Returns the fitted y-values for each index.
 */
function computeExponentialFit(yValues) {
  const n = yValues.length;
  if (n < 2) return [];

  // transform y -> ln(y)
  const lnY = yValues.map((y) => Math.log(y));
  const x = [...Array(n).keys()];

  // sums
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumLnY = lnY.reduce((a, b) => a + b, 0);
  const sumX2 = x.reduce((a, v) => a + v * v, 0);
  const sumXlnY = x.reduce((a, v, i) => a + v * lnY[i], 0);

  // compute slope B and intercept ln(A)
  const B =
    (n * sumXlnY - sumX * sumLnY) / (n * sumX2 - sumX * sumX);
  const lnA = sumLnY / n - B * (sumX / n);
  const A = Math.exp(lnA);

  // fitted curve
  return x.map((xi) => A * Math.exp(B * xi));
}

/**
 * Fetches historical price data and renders:
 *  - an exponential regression chart
 */
const ExponentialRegressionAnalysis = ({
  coinId,
  selectedTime = 1, // days
}) => {
  const { data, error } = useSWR(
    coinId ? HistoricalChart(coinId, selectedTime) : null,
    fetcher,
    { refreshInterval: 60000 }
  );

  if (error) return <div>Error loading exponential regression data.</div>;
  if (!data) return <div>Loading exponential regression data…</div>;

  // extract labels and prices
  const prices = data.prices.map(([, p]) => p);
  const labels = data.prices.map(([t]) =>
    selectedTime === 1
      ? new Date(t).toLocaleTimeString()
      : new Date(t).toLocaleDateString()
  );

  // compute fit
  const fit = computeExponentialFit(prices);

  return (
    <div className="mt-8">
      
      <ExponentialRegressionChart
        labels={labels}
        actual={prices}
        fit={fit}
      />
    </div>
  );
};

export default ExponentialRegressionAnalysis;
