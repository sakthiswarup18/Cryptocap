"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import CoinGraph from "./CoinGraph";
import dynamic from "next/dynamic";

const CoinInfo = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get("id"); // Replace "bitcoin" with the correct key if needed
  const [coin, setCoin] = useState();

  const currency = "USD";

  const HandleCoinData = async () => {
    try {
      const respones = await axios.get(
        `https://api.coingecko.com/api/v3/coins/${id}`
      );
      console.log(respones.data);
      setCoin(respones.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    HandleCoinData();
  }, [id]);

  function numberWithCommas(x) {
    if (x === null || x === undefined) {
      return "N/A"; // Handle null or undefined gracefully
    }
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  return (
    <div className="p-4">
      <div className="flex flex-row flex-wrap">
        {/* Left Sidebar */}
        <div className="w-full md:w-[30%] vh-[100%] border-r-0 md:border-r-[1px] border-gray-200 p-4">
          {/* Coin Details Header */}
          <div className="mb-4">
            <div className="flex flex-row gap-2 items-center">
              <img
                src={coin?.image.large}
                alt={coin?.name}
                className="w-[40px] h-[40px] mb-1"
              />
              <p className="text-[18px] font-bold">{coin?.name}</p>
              <p className="text-[12px] uppercase text-gray-500">
                {coin?.symbol}
              </p>
              <p className="text-[12px] bg-slate-400 text-white px-2 py-1 rounded-md">
                {`# ${coin?.market_cap_rank}`}
              </p>
            </div>
          </div>

          {/* Current Price */}
          <div className="mb-4">
            <p className="text-gray-400 text-5xl font-semibold">
              {"$"}{" "}
              {numberWithCommas(
                coin?.market_data.current_price[currency.toLowerCase()]
              )}
            </p>
          </div>

          {/* Description */}
          <div className="mb-4">
            <p className="text-gray-600">
              {coin?.description.en.split(". ")[0]}
            </p>
          </div>

          {/* Explorers */}
          <div className="mb-4 flex items-center gap-3">
            <p className="text-xl font-bold">Explorers :</p>
            <Link
              href={`${coin?.links.homepage[0]}`}
              className="text-blue-500 hover:underline"
              target="_blank"
            >
              {coin?.links.homepage[0]}
            </Link>
          </div>

          {/* Market Cap */}
          <div className="mb-4 flex items-center gap-3">
            <p className="text-xl font-bold">Market Cap :</p>
            <p className="text-gray-400 text-xl font-bold">
              {"$"}{" "}
              {numberWithCommas(
                coin?.market_data.market_cap[currency.toLowerCase()]
                  .toString()
                  .slice(0, -6)
              )}{" "}
              M
            </p>
          </div>
          <div className="mb-4 flex items-center gap-3">
            <p className="text-xl font-bold">total_supply</p>
            <p className="text-gray-400">
              {"$"} {numberWithCommas(coin?.market_data.total_supply)}M
            </p>
          </div>
          <div className="mb-4 flex items-center gap-3">
            <p className="text-xl font-bold">total_volume</p>
            <p className="text-gray-400">
              {"$"}{" "}
              {numberWithCommas(
                coin?.market_data.total_volume[currency.toLowerCase()]
                  .toString()
                  .slice(0, -6)
              )}{" "}
              M
            </p>
          </div>
        </div>

        {/* Right Content */}
        <div className="w-full md:w-[70%] px-3">
          <div>
            <CoinGraph coinid={coin?.id} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default dynamic(() => Promise.resolve(CoinInfo), { ssr: false });
