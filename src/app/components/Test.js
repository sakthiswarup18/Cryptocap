import React, { useEffect, useState } from 'react';

const ProcessDataComponent = ({ jsonData }) => {
  const [predictedPrices, setPredictedPrices] = useState(null);
  const [predictedVolumes, setPredictedVolumes] = useState(null);
  const [predictedMarketCaps, setPredictedMarketCaps] = useState(null);

  // Process and predict values for each dataset
  const processAndPredict = (data) => {
    if (!data || data.length < 2) {
      console.log('Insufficient or invalid data.');
      return null;
    }

    try {
      const n = data.length;

      // Linear regression calculations
      const sumX = data.reduce((acc, curr) => acc + (curr[0] || 0), 0);
      const sumY = data.reduce((acc, curr) => acc + (curr[1] || 0), 0);
      const sumXY = data.reduce(
        (acc, curr) => acc + (curr[0] || 0) * (curr[1] || 0),
        0,
      );
      const sumX2 = data.reduce((acc, curr) => acc + (curr[0] || 0) ** 2, 0);

      const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX ** 2);
      const intercept = (sumY - slope * sumX) / n;

      // Predict the next point
      const lastPoint = data[n - 1];
      const secondLastPoint = data[n - 2];
      const interval = lastPoint[0] - secondLastPoint[0];
      const nextX = lastPoint[0] + interval;
      const nextY = slope * nextX + intercept;

      return [nextX, nextY];
    } catch (error) {
      console.error('Error processing data:', error);
      return null;
    }
  };

  useEffect(() => {
    if (jsonData) {
      // Predict next points for prices, market_caps, and total_volumes
      const predictedPrice = processAndPredict(jsonData.prices);
      const predictedVolume = processAndPredict(jsonData.total_volumes);
      const predictedMarketCap = processAndPredict(jsonData.market_caps);

      setPredictedPrices(predictedPrice);
      setPredictedVolumes(predictedVolume);
      setPredictedMarketCaps(predictedMarketCap);
    }
  }, [jsonData]);

  return (
    <div>
      <h1>Data Processing and Prediction</h1>
      <div>
        <h2>Predicted Price</h2>
        {predictedPrices ? (
          <p>
            Next Predicted Price:{' '}
            {`[${predictedPrices[0]}, ${predictedPrices[1]}]`}
          </p>
        ) : (
          <p>No data available or insufficient data for prediction.</p>
        )}
      </div>
      <div>
        <h2>Predicted Total Volume</h2>
        {predictedVolumes ? (
          <p>
            Next Predicted Total Volume:{' '}
            {`[${predictedVolumes[0]}, ${predictedVolumes[1]}]`}
          </p>
        ) : (
          <p>No data available or insufficient data for prediction.</p>
        )}
      </div>
      <div>
        <h2>Predicted Market Cap</h2>
        {predictedMarketCaps ? (
          <p>
            Next Predicted Market Cap:{' '}
            {`[${predictedMarketCaps[0]}, ${predictedMarketCaps[1]}]`}
          </p>
        ) : (
          <p>No data available or insufficient data for prediction.</p>
        )}
      </div>
    </div>
  );
};

export default ProcessDataComponent;
