// src/app/components/CoinInfo.js
"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import useSWR from "swr";
import axios from "axios";
import Link from "next/link";
import dynamic from "next/dynamic";

import AdvancedChart from "./AdvancedChart";
import HoltWintersForecastChart from "./HoltWintersForecastChart";
import RegressionAnalysis from "./RegressionAnalysis";
import ExponentialRegressionAnalysis from "./ExponentialRegressionAnalysis";
import MarketAlertEmail from "./MarketAlertEmail";

import { SingleCoin, HistoricalChart } from "../config/api";
import { chartDays } from "../config/data";

const fetcher = (url) => axios.get(url).then((res) => res.data);

const predictWithConfidence = (prices) => {
  if (!prices || prices.length < 2) return null;
  const n = prices.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  prices.forEach(([t, y]) => {
    sumX += t;
    sumY += y;
    sumXY += t * y;
    sumXX += t * t;
  });
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  const last = prices[n - 1][0], prev = prices[n - 2][0];
  const interval = last - prev;
  const future = last + interval;
  const pred = slope * future + intercept;
  const residuals = prices.map(([t, y]) => y - (slope * t + intercept));
  const ssErr = residuals.reduce((a, e) => a + e * e, 0);
  const stdErr = Math.sqrt(ssErr / (n - 2));
  const margin = 2 * stdErr;
  return { predicted: pred, lower: pred - margin, upper: pred + margin };
};

const CoinInfo = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const currency = "USD";

  const { data: coin, error: coinError } = useSWR(
    id ? SingleCoin(id) : null,
    fetcher
  );

  const [selectedTime, setSelectedTime] = useState(() => {
    const defaultDay = chartDays.find((d) => d.label === "30 Days");
    return defaultDay ? defaultDay.value : chartDays[0].value;
  });

  const [userEmail, setUserEmail] = useState("");
  const [alertThreshold, setAlertThreshold] = useState(25000);
  const [alertDirection, setAlertDirection] = useState("above");

  const { data: hist, error: histError } = useSWR(
    coin ? HistoricalChart(coin.id, selectedTime) : null,
    fetcher,
    { refreshInterval: 60000 }
  );

  if (coinError) return <div>Error loading coin data.</div>;
  if (!coin) return <div>Loading coin data...</div>;

  const fmt = (x) => x == null ? "N/A" : x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  const hasHist = hist && Array.isArray(hist.prices);
  const labels = hasHist
    ? hist.prices.map(([t]) =>
        selectedTime === 1
          ? new Date(t).toLocaleTimeString()
          : new Date(t).toLocaleDateString()
      )
    : [];
  const priceData = hasHist ? hist.prices.map(([, p]) => p) : [];
  const volumeData = hasHist ? hist.total_volumes.map(([, v]) => v) : [];

  let advancedChartSection = null;
  if (histError) {
    advancedChartSection = <div className="text-center py-4">Error loading chart data.</div>;
  } else if (!hist) {
    advancedChartSection = <div className="text-center py-4">Loading chart data...</div>;
  } else {
    const pred = predictWithConfidence(hist.prices);
    const pricePred = priceData.map(() => null);
    const lowerPred = priceData.map(() => null);
    const upperPred = priceData.map(() => null);
    if (pred) {
      const idx = priceData.length - 1;
      pricePred[idx] = pred.predicted;
      lowerPred[idx] = pred.lower;
      upperPred[idx] = pred.upper;
    }
    advancedChartSection = (
      <AdvancedChart
        labels={labels}
        priceData={priceData}
        volumeData={volumeData}
        predictedPriceData={pricePred}
        predictedLowerData={lowerPred}
        predictedUpperData={upperPred}
      />
    );
  }

  return (
    <div className="p-4">
      <div className="flex flex-col md:flex-row">
        <div className="w-full md:w-1/4 border-b md:border-r border-gray-200 p-3">
          <div className="flex items-center gap-3 mb-3">
            <img src={coin.image.large} alt={coin.name} className="w-8 h-8" />
            <h2 className="text-2xl font-bold">{coin.name}</h2>
            <span className="uppercase text-sm text-gray-500 dark:text-gray-400">
              {coin.symbol}
            </span>
            <span className="text-xs bg-gray-400 text-white px-1 py-0.5 rounded">
              #{coin.market_cap_rank}
            </span>
          </div>
          <div className="text-3xl font-semibold text-gray-600 dark:text-gray-300 mb-3">
            ${fmt(coin.market_data.current_price[currency.toLowerCase()])}
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-3 text-base">
            {coin.description.en.split(". ")[0]}.
          </p>
          <div className="mb-3">
            <p className="font-semibold text-gray-700 dark:text-gray-300 text-base">
              Explorer:
            </p>
            <Link
              href={coin.links.homepage[0]}
              target="_blank"
              className="text-blue-500 hover:underline text-base"
            >
              {coin.links.homepage[0]}
            </Link>
          </div>
          <div className="mt-4 p-3 border rounded shadow-sm bg-white dark:bg-gray-800">
            <h3 className="text-base font-bold mb-2 text-gray-800 dark:text-gray-100">
              Set Email Alerts
            </h3>
            <input
              type="email"
              placeholder="Your email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              className="w-full p-2 mb-2 border rounded bg-gray-100 dark:bg-gray-700 text-black dark:text-white text-base"
            />
            <input
              type="number"
              placeholder="Threshold (USD)"
              value={alertThreshold}
              onChange={(e) => setAlertThreshold(Number(e.target.value))}
              className="w-full p-2 mb-2 border rounded bg-gray-100 dark:bg-gray-700 text-black dark:text-white text-base"
            />
            <select
              value={alertDirection}
              onChange={(e) => setAlertDirection(e.target.value)}
              className="w-full p-2 mb-2 border rounded bg-gray-100 dark:bg-gray-700 text-black dark:text-white text-base"
            >
              <option value="above">Above</option>
              <option value="below">Below</option>
            </select>
            {coin && userEmail && (
              <MarketAlertEmail
                coinId={coin.id}
                thresholdPrice={alertThreshold}
                direction={alertDirection}
                email={userEmail}
              />
            )}
          </div>
        </div>
        <div className="w-full md:w-3/4 px-3 mt-4 md:mt-0">
          <div className="mb-2 flex flex-wrap space-x-2">
            {chartDays.map((d) => {
              const active = d.value === selectedTime;
              return (
                <button
                  key={d.value}
                  onClick={() => setSelectedTime(d.value)}
                  className={`px-3 py-1 rounded-full border text-xs font-medium transition ${
                    active
                      ? "bg-yellow-500 text-black border-yellow-500"
                      : "border-gray-400 text-gray-800 dark:text-gray-300 hover:bg-yellow-200 dark:hover:bg-yellow-600 hover:text-black dark:hover:text-black"
                  }`}
                >
                  {d.label}
                </button>
              );
            })}
          </div>
          <h2 className="text-center text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
            Historical Chart
          </h2>
          {advancedChartSection}
          {priceData.length > 0 && (
            <div className="mt-6">
              <HoltWintersForecastChart labels={labels} prices={priceData} />
            </div>
          )}
          {priceData.length > 0 && (
            <div className="mt-6">
              <ExponentialRegressionAnalysis
                coinId={coin.id}
                selectedTime={selectedTime}
              />
            </div>
          )}
          {priceData.length > 0 && (
            <div className="mt-6">
              <RegressionAnalysis
                coinId={coin.id}
                selectedTime={selectedTime}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default dynamic(() => Promise.resolve(CoinInfo), {
  ssr: false,
});