// src/app/components/CoinListData.js
"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const CoinListData = () => {
  const router = useRouter();
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const coinsPerPage = 25;

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch("/api/coins")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => setCoins(data))
      .catch((err) => {
        console.error("Fetch error:", err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  // Filter + paginate
  const filtered = coins.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.symbol.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / coinsPerPage);
  const start = (page - 1) * coinsPerPage;
  const pageCoins = filtered.slice(start, start + coinsPerPage);

  if (error) {
    return (
      <div className="p-4 text-red-600">
        ⚠️ Unable to load coins: {error}
      </div>
    );
  }

  return (
    <div>
      <div className="text-end mr-4 mb-2">
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
      </div>

      {loading ? (
        <div className="text-center py-8">Loading coins…</div>
      ) : (
        <>
          <div className="overflow-x-auto p-4">
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
                {pageCoins.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => router.push(`/coininfo/?id=${c.id}`)}
                    className="
                      cursor-pointer
                      hover:bg-gray-100 hover:text-black
                      dark:hover:bg-gray-800 dark:hover:text-white
                      transition-colors duration-150
                    "
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
                      ${Number(c.current_price).toFixed(2)}
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
                      ${String(c.market_cap).slice(0, -6)}M
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center gap-2 mt-4">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Prev
            </button>

            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setPage(i + 1)}
                className={`px-3 py-1 border rounded ${
                  page === i + 1
                    ? "bg-yellow-500 text-black font-bold"
                    : "hover:bg-yellow-300"
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() =>
                setPage((p) => Math.min(p + 1, totalPages))
              }
              disabled={page === totalPages}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CoinListData;
