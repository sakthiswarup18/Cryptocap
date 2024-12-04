"use client";
import Link from "next/link";
import React from "react";
import axios from "axios";
import * as XLSX from "xlsx";
const Header = () => {
  const downloadCsvFile = async () => {
    try {
      const response = await axios.get(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false"
      );

      // Extract only required fields
      const filteredData = response.data.map((item) => ({
        id: item.id,
        symbol: item.symbol,
        current_price: item.current_price,
        market_cap: item.market_cap,
        market_cap_rank: item.market_cap_rank,
      }));

      // Convert filtered JSON to a worksheet
      const worksheet = XLSX.utils.json_to_sheet(filteredData);

      // Convert the worksheet to CSV
      const csvData = XLSX.utils.sheet_to_csv(worksheet);

      // Create a Blob and download it
      const blob = new Blob([csvData], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "filtered_coins_data.csv"); // Set file name
      document.body.appendChild(link);
      link.click();
      link.remove(); // Clean up the link after downloading
    } catch (error) {
      console.error("Error downloading the file", error);
    }
  };

  return (
    <div className="bg-black flex items-center justify-between p-3">
      <div className="bg-black text-white text-2xl p-3  sticky  w-[100%] ">
        <Link href="/">Sentiment Driven insights into Cryptocurrency</Link>
      </div>
      <div
        className="bg-white text-black p-2 h-10 rounded-lg"
        onClick={downloadCsvFile}
      >
        <button>Download</button>
      </div>
    </div>
  );
};

export default Header;
