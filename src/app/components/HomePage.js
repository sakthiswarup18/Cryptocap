"use client";
import React from "react";
import Header from "./Header";
import CoinListData from "./CoinListData";
import dynamic from "next/dynamic";

const HomePage = () => {
  return (
    <div>
      <Header />
      <div className="p-4">
        <p className="text-center text-2xl font-bold">
          Cryptocurrency Prices by Market Capacity
        </p>
      </div>
      <CoinListData />
    </div>
  );
};

export default dynamic(() => Promise.resolve(HomePage), { ssr: false });
