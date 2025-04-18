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

  const [sortKey, setSortKey] = useState(""); // 'price', 'marketCap', etc.
  const [sortDirection, setSortDirection] = useState("asc");

  const coinsPerPage = 25;

  const fetchCoins = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        "https://api.coingecko.com/api/v3/coins/markets?" +
          "vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false"
      );
      setCoins(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoins();
  }, []);

  const filtered = coins
    .filter(
      (c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.symbol.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (!sortKey) return 0;

      let valA, valB;

      switch (sortKey) {
        case "price":
          valA = a.current_price;
          valB = b.current_price;
          break;
        case "marketCap":
          valA = a.market_cap;
          valB = b.market_cap;
          break;
        case "name":
          valA = a.name.toLowerCase();
          valB = b.name.toLowerCase();
          break;
        case "rank":
          valA = a.market_cap_rank;
          valB = b.market_cap_rank;
          break;
        default:
          return 0;
      }

      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

  const totalPages = Math.ceil(filtered.length / coinsPerPage);
  const startIndex = (page - 1) * coinsPerPage;
  const paginatedCoins = filtered.slice(startIndex, startIndex + coinsPerPage);

  const numberWithCommas = (x) =>
    x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  const handlePrev = () => setPage((p) => Math.max(p - 1, 1));
  const handleNext = () => setPage((p) => Math.min(p + 1, totalPages));
  const handlePageClick = (p) => setPage(p);

  return (
    <div>
      {/* Search + Sorting Controls */}
      <div className="flex flex-wrap justify-end items-center gap-2 mr-4 mb-4">
        <input
          type="text"
          placeholder="Search coin name or symbol"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full max-w-xs p-3 rounded-md text-black"
        />

        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value)}
          className="p-2 rounded-md border text-black"
        >
          <option value="">Sort by...</option>
          <option value="price">Price</option>
          <option value="marketCap">Market Cap</option>
          <option value="name">Name</option>
          <option value="rank">Rank</option>
        </select>

        <button
          onClick={() =>
            setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
          }
          className="px-3 py-2 bg-yellow-500 hover:bg-yellow-600 rounded text-black font-semibold"
        >
          {sortDirection === "asc" ? "Asc ↑" : "Desc ↓"}
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto p-4">
        {loading ? (
          <div className="text-center py-4">Loading...</div>
        ) : (
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
              {paginatedCoins.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => router.push(`/coininfo/?id=${c.id}`)}
                  className="cursor-pointer hover:bg-gray-100 hover:text-black dark:hover:bg-gray-800 dark:hover:text-white transition-colors duration-150"
                >
                  <td className="pl-3">{c.market_cap_rank}</td>
                  <td className="p-2">
                    <div className="flex items-center gap-4">
                      <img src={c.image} alt={c.name} className="w-12 h-12" />
                      <div>
                        <div className="text-[18px] uppercase font-bold">
                          {c.symbol}
                        </div>
                        <div className="text-[14px] text-gray-400">
                          {c.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-2">
                    ${numberWithCommas(c.current_price.toFixed(2))}
                  </td>
                  <td
                    className={`p-2 font-medium ${
                      c.price_change_percentage_24h > 0
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {c.price_change_percentage_24h > 0 && "+"}
                    {c.price_change_percentage_24h.toFixed(2)}%
                  </td>
                  <td className="p-2">
                    ${numberWithCommas(String(c.market_cap).slice(0, -6))}M
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-2 mt-4">
        <button
          onClick={handlePrev}
          disabled={page === 1}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Prev
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            onClick={() => handlePageClick(p)}
            className={`px-3 py-1 border rounded ${
              p === page
                ? "bg-yellow-500 text-black font-bold"
                : "hover:bg-yellow-300"
            }`}
          >
            {p}
          </button>
        ))}
        <button
          onClick={handleNext}
          disabled={page === totalPages}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default CoinListData;
