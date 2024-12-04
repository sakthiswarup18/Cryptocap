"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

const CoinListData = () => {
  const router = useRouter();
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const coinsPerPage = 10; // Limit per page

  const fetchCoins = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false"
      );
      console.log(data);
      setCoins(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoins();
  }, [page]);

  const numberWithCommas = (x) => {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    setPage(page + 1);
  };

  const filterCoin = coins.filter(
    (res) =>
      res.name.toLowerCase().includes(search) ||
      res.symbol.toLowerCase().includes(search)
  );

  return (
    <div>
      <div className="text-end mr-4">
        <input
          label="Search For a Crypto Currency.."
          variant="outlined"
          placeholder="Search the coin Name and Sumbol"
          className="w-[400px] p-3 rounded-md text-black"
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="overflow-x-auto p-4 ">
        {loading && (
          <div className="text-center py-4">
            <span>Loading...</span>
          </div>
        )}
        {!loading && (
          <table className="min-w-full table-auto border-collapse">
            <thead>
              <tr className="bg-yellow-400">
                <th className="border-b pl-4 text-left">#</th>
                <th className="border-b p-2 text-left">Coin</th>
                <th className="border-b p-2 text-left">Price</th>
                <th className="border-b p-2 text-left">24h Change</th>
                <th className="border-b p-2 text-left">Market Cap</th>
              </tr>
            </thead>
            <tbody>
              {filterCoin.map((res) => (
                <tr
                  key={res.id}
                  onClick={() => router.push(`/coininfo/?id=${res.id}`)}
                  className={`hover:bg-[#131111] ${
                    res.id ? "cursor-pointer" : ""
                  }`}
                >
                  <td className="pl-3">{res.market_cap_rank}</td>
                  <td className="p-2">
                    <div className="flex flex-row items-center gap-4">
                      <img
                        src={res?.image}
                        alt={res.name}
                        className="w-12 h-12 mb-1"
                      />
                      <span className="text-[18px] uppercase font-bold">
                        {res.symbol}
                      </span>
                      <span className="text-[14px] text-gray-400">
                        {res.name}
                      </span>
                    </div>
                  </td>
                  <td className="p-2 ">
                    {"$"} {numberWithCommas(res.current_price.toFixed(2))}
                  </td>
                  <td
                    className={`p-2 font-medium ${
                      res.price_change_percentage_24h > 0
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {res.price_change_percentage_24h > 0 && "+"}
                    {res.price_change_percentage_24h.toFixed(2)}%
                  </td>
                  <td className="p-2 ">
                    {`$ ${res.market_cap.toString().slice(0, -6)}M`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default CoinListData;
