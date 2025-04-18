"use client";
import React from "react";
import Link from "next/link";
import useSWR from "swr";
import axios from "axios";
import DataExportOptions from "./DataExportOptions";
import ThemeToggle from "./ThemeToggle";

const fetcher = (url) => axios.get(url).then((res) => res.data);

const Header = () => {
  // Fetch all coin market data (up to 250 coins for export)
  const { data: coinsData, error } = useSWR(
    "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&sparkline=false",
    fetcher,
    { refreshInterval: 60000 }
  );

  return (
    <header className="bg-slate-700 dark:bg-slate-900 text-white p-4">
      <div className="flex items-center justify-between">
        {/* Title flushed to the far left */}
        <div className="flex-1 text-left">
          <Link href="/">
            <span className="text-2xl font-bold">
            CryptoVision: Integrating Machine Learning with Real-Time Market Data
            </span>
          </Link>
        </div>
        {/* Right controls: Theme toggle (bigger) and export options */}
        <div className="flex items-center gap-4">
          <ThemeToggle />
          {error && <div className="text-white">Error loading export data.</div>}
          {!coinsData && <div className="text-white">Loading export data...</div>}
          {coinsData && (
            <div className="max-w-xs">
              <DataExportOptions data={coinsData} fileName="all_coin_data" />
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
