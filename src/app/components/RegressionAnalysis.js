// src/app/components/RegressionAnalysis.js
"use client";

import React, { useMemo } from "react";
import useSWR from "swr";
import axios from "axios";
import RegressionChart from "./RegressionChart";
import { holtWintersAdditive } from "./HoltWintersForecastChart";
import { HistoricalChart } from "../config/api";
import { useTheme } from "next-themes";

const fetcher = (url) => axios.get(url).then((r) => r.data);

const getMetrics = (actual, pred) => {
  const n = actual.length;
  const mean = actual.reduce((a, b) => a + b, 0) / n;
  const ssTot = actual.reduce((s, y) => s + (y - mean) ** 2, 0);
  const ssRes = actual.reduce((s, y, i) => s + (y - pred[i]) ** 2, 0);
  return {
    r2: 1 - ssRes / ssTot,
    mae: actual.reduce((s, y, i) => s + Math.abs(y - pred[i]), 0) / n,
    rmse: Math.sqrt(ssRes / n),
  };
};

const RegressionAnalysis = ({ coinId, selectedTime }) => {
  const { data, error } = useSWR(
    coinId ? HistoricalChart(coinId, selectedTime) : null,
    fetcher,
    { refreshInterval: 60000 }
  );
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Compute our light/dark colors
  const { textColor, headerBg, rowBg, highlightBg, borderColor } = useMemo(
    () => ({
      textColor:   isDark ? "#ededed"             : "#000000",
      headerBg:    isDark ? "#374151"             : "#E5E7EB",    // gray‑700 vs gray‑200
      rowBg:       isDark ? "#1f2937"             : "#ffffff",    // gray‑800 vs white
      highlightBg: isDark ? "#065F46"             : "#D1FAE5",    // green‑700 vs green‑100
      borderColor: isDark ? "rgba(237,237,237,0.2)" : "rgba(0,0,0,0.1)",
    }),
    [isDark]
  );

  if (error) return <div style={{ color: textColor }}>Error loading regression data.</div>;
  if (!data) return <div style={{ color: textColor }}>Loading regression data…</div>;

  const n = data.prices.length;
  const priceData = data.prices.map(([, p]) => p);
  const labels = data.prices.map(([t]) =>
    selectedTime === 1
      ? new Date(t).toLocaleTimeString()
      : new Date(t).toLocaleDateString()
  );
  const x = [...Array(n).keys()];

  // Linear regression
  const sumX = x.reduce((a, b) => a + b, 0),
        sumY = priceData.reduce((a, b) => a + b, 0),
        sumXX = x.reduce((s, xi) => s + xi * xi, 0),
        sumXY = x.reduce((s, xi, i) => s + xi * priceData[i], 0);
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = sumY / n - slope * (sumX / n);
  const linearFit = x.map((xi) => slope * xi + intercept);

  // Quadratic (Cramer's rule)
  const x2 = x.map((xi) => xi * xi),
        x3 = x.map((xi) => xi ** 3),
        x4 = x.map((xi) => xi ** 4),
        sumX2Y = x2.reduce((s, xi2, i) => s + xi2 * priceData[i], 0);
  const A = [
    [n, sumX, sumXX],
    [sumX, sumXX, x3.reduce((a,b)=>a+b,0)],
    [sumXX, x3.reduce((a,b)=>a+b,0), x4.reduce((a,b)=>a+b,0)],
  ];
  const B = [sumY, sumXY, sumX2Y];
  const det = (m) =>
    m[0][0]*(m[1][1]*m[2][2]-m[1][2]*m[2][1]) -
    m[0][1]*(m[1][0]*m[2][2]-m[1][2]*m[2][0]) +
    m[0][2]*(m[1][0]*m[2][1]-m[1][1]*m[2][0]);
  const solve = (M, V) => {
    const d = det(M);
    const c = (col) =>
      det(M.map((r,i) => r.map((v,j) => (j===col?V[i]:v))));
    return [c(0)/d, c(1)/d, c(2)/d];
  };
  const [c0, c1, c2] = solve(A, B);
  const quadFit = x.map((xi) => c0 + c1*xi + c2*xi*xi);

  // Exponential
  const lnY = priceData.map((y) => Math.log(y)),
        sumLn = lnY.reduce((a,b)=>a+b,0),
        sumXLn = x.reduce((s, xi, i)=>s + xi*lnY[i], 0);
  const Bexp = (n*sumXLn - sumX*sumLn)/(n*sumXX - sumX*sumX);
  const Aexp = Math.exp(sumLn/n - Bexp*(sumX/n));
  const expFit = x.map((xi) => Aexp*Math.exp(Bexp*xi));

  // Holt–Winters fitted only
  let hwFit = [];
  try {
    const full = holtWintersAdditive(priceData, 7);
    hwFit = full.slice(0, n);
  } catch {
    hwFit = [];
  }

  // metrics
  const linearM = getMetrics(priceData, linearFit),
        quadM   = getMetrics(priceData, quadFit),
        expM    = getMetrics(priceData, expFit),
        hwM     = hwFit.length===n ? getMetrics(priceData, hwFit)
                                   : {r2:-Infinity,mae:null,rmse:null};

  const models = [
    { name: "Linear",      ...linearM },
    { name: "Quadratic",   ...quadM },
    { name: "Exponential", ...expM },
    ...(hwFit.length===n ? [{ name: "Holt–Winters", ...hwM }] : [])
  ];

  const best = models.reduce((a,b) => (b.r2 > a.r2 ? b : a), models[0]).name;

  return (
    <div style={{ color: textColor }}>
      <RegressionChart
        labels={labels}
        actual={priceData}
        linear={linearFit}
        quadratic={quadFit}
        exponential={expFit}
        holtwinters={hwFit}
      />

      {/* Themed Model Comparison Table */}
      <div className="mt-6">
        <h3 style={{ color: textColor }} className="text-lg font-bold mb-2">
          Model Comparison
        </h3>
        <table
          className="w-full border-collapse"
          style={{
            border: `1px solid ${borderColor}`,
          }}
        >
          <thead>
            <tr style={{ backgroundColor: headerBg, color: textColor }}>
              <th style={{ padding: "8px", border: `1px solid ${borderColor}` }}>Model</th>
              <th style={{ padding: "8px", border: `1px solid ${borderColor}` }}>R²</th>
              <th style={{ padding: "8px", border: `1px solid ${borderColor}` }}>MAE</th>
              <th style={{ padding: "8px", border: `1px solid ${borderColor}` }}>RMSE</th>
            </tr>
          </thead>
          <tbody>
            {models.map((m) => (
              <tr
                key={m.name}
                style={{
                  backgroundColor: m.name === best ? highlightBg : rowBg,
                  color: textColor,
                  fontWeight: m.name === best ? "bold" : "normal",
                }}
              >
                <td style={{ padding: "8px", border: `1px solid ${borderColor}` }}>
                  {m.name}
                </td>
                <td style={{ padding: "8px", border: `1px solid ${borderColor}` }}>
                  {m.r2.toFixed(4)}
                </td>
                <td style={{ padding: "8px", border: `1px solid ${borderColor}` }}>
                  {m.mae != null ? m.mae.toFixed(4) : "N/A"}
                </td>
                <td style={{ padding: "8px", border: `1px solid ${borderColor}` }}>
                  {m.rmse != null ? m.rmse.toFixed(4) : "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{ color: textColor }} className="mt-2 italic">
          Best model: <strong>{best}</strong>
        </p>
      </div>
    </div>
  );
};

export default RegressionAnalysis;
