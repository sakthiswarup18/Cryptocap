"use client";
import React from "react";
import axios from "axios";

const MarketAlertEmail = ({ coinId, thresholdPrice, direction, email }) => {
  const sendAlert = async () => {
    try {
      // Fetch the current price using CoinGecko's simple price endpoint
      const response = await axios.get(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`
      );
      const price = response.data[coinId].usd;
      let conditionMet = false;
      if (direction === "above" && price >= thresholdPrice) {
        conditionMet = true;
      } else if (direction === "below" && price <= thresholdPrice) {
        conditionMet = true;
      }
      if (conditionMet) {
        // Trigger the email notification by calling the backend API endpoint
        const res = await fetch("/api/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            coinId,
            currentPrice: price,
            threshold: thresholdPrice,
            direction,
          }),
        });
        if (res.ok) {
          alert("Email alert sent successfully.");
        } else {
          alert("Email alert will be sent.");
        }
      } else {
        alert(`Condition not met. Current price: ${price} USD.`);
      }
    } catch (error) {
      console.error("Error sending email alert:", error);
      alert("Error sending email alert.");
    }
  };

  return (
    <button
      onClick={sendAlert}
      className="mt-4 p-2 bg-green-500 text-white rounded hover:bg-green-600"
    >
      Send Email Alert
    </button>
  );
};

export default MarketAlertEmail;
