"use client";
import React from "react";
import Header from "./Header";
import CoinListData from "./CoinListData";
import dynamic from "next/dynamic";

const HomePage = () => {
  return (
    <div>
      <Header />
      <div>
        <p className="p-3 text-start text-2xl text-bold">
          Cryptocurrency Prices by Market Cap
        </p>
      </div>
      <CoinListData />
    </div>
  );
};

export default dynamic(() => Promise.resolve(HomePage), { ssr: false });
