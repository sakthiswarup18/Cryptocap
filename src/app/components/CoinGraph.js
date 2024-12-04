"use client";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale, // Ensure CategoryScale is imported
  Tooltip,
  Legend,
} from "chart.js";
import { chartDays } from "../config/data";
import Test from "./Test";
import ForceCast from "./ForceCast";

// Register the required components globally
ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale, // Register the category scale
  Tooltip,
  Legend
);

const CoinGraph = ({ coinid }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [historicData, setHistoricData] = useState([]);
  const [objprices, setPrices] = useState([]);
  const [objmarket, setObjmarket] = useState([]);
  const [objvolumes, setObjvolumes] = useState([]);

  const [days, setDays] = useState(1 / 24);
  const currency = "usd";

  const tabs = [
    "Price",
    "Predicted Values Prices",
    "Market Caps",
    " Total Volumes",
  ];

  const fetchHistoricData = async () => {
    try {
      const response = await axios.get(
        `https://api.coingecko.com/api/v3/coins/${coinid}/market_chart?vs_currency=usd&days=${days}`
      );
      console.log(response?.data);
      setHistoricData(response?.data.prices);
      setPrices(response?.data.prices);
      setObjmarket(response?.data?.market_caps);
      setObjvolumes(response?.data?.total_volumes);
      setflag(true);
    } catch (error) {
      console.log("Error fetching historical data:", error);
    }
  };

  useEffect(() => {
    if (coinid) {
      fetchHistoricData();
    }
  }, [coinid, days]);

  return (
    <div>
      <div>
        <div>
          <div className="flex border-b">
            {tabs.map((tab, index) => (
              <button
                key={index}
                className={`flex-1 py-2 text-center border-2 font-bold ${
                  activeTab === index
                    ? " bg-slate-200 text-black rounded-t-md"
                    : "border-transparent hover:border-gray-300 "
                }`}
                onClick={() => setActiveTab(index)}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="p-4">
            {activeTab === 0 && (
              <div>
                <Line
                  data={{
                    labels: historicData.map((coin) => {
                      let date = new Date(coin[0]);
                      let time =
                        date.getHours() > 12
                          ? `${date.getHours() - 12}:${date.getMinutes()} PM`
                          : `${date.getHours()}:${date.getMinutes()} AM`;
                      return days === 1 ? time : date.toLocaleDateString();
                    }),

                    datasets: [
                      {
                        data: historicData.map((coin) => coin[1]),
                        label: `Price ( Past ${days} Days ) in ${currency}`,
                        borderColor: "#EEBC1D",
                      },
                    ],
                  }}
                  options={{
                    elements: {
                      point: {
                        radius: 1,
                      },
                    },
                  }}
                />
                <div className="flex flex-row gap-5 justify-around">
                  {chartDays.map((day) => (
                    <button
                      key={day.value}
                      onClick={() => {
                        setDays(day.value);
                      }}
                      className={`flex-1 p-3 rounded-lg border-2 transition-all duration-300 ${
                        day.value === days
                          ? "bg-yellow-500 text-black border-yellow-500 font-bold"
                          : "bg-transparent text-white border-gray-500 hover:bg-yellow-500 hover:text-black"
                      }`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {activeTab === 1 && (
              <div>
                <ForceCast jsonData={objprices} name="Prices" />
              </div>
            )}
            {activeTab === 2 && (
              <div>
                <ForceCast jsonData={objmarket} name="Market Caps" />
              </div>
            )}
            {activeTab === 3 && (
              <div>
                <ForceCast jsonData={objvolumes} name="Total Volumes" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* <Test jsonData={objData} /> */}
      {/* <ForceCast jsonData={objData} /> */}
    </div>
  );
};

export default CoinGraph;
