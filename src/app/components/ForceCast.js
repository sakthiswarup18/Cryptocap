import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

const ForceCast = ({ jsonData, name }) => {
  const [predictions, setPredictions] = useState(null);

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
      const predictedData = {
        Prices: processAndPredict(jsonData),
      };
      setPredictions(predictedData);
    }
  }, [jsonData]);

  // Prepare data for the chart
  const chartData = {
    labels: predictions ? Object.keys(predictions) : [],
    datasets: [
      {
        label: 'Predicted Values',
        data: predictions
          ? Object.values(predictions).map((item) => (item ? item[1] : 0))
          : [],
        backgroundColor: ['#8884d8', '#82ca9d', '#ff7300'],
        borderColor: ['#8884d8', '#82ca9d', '#ff7300'],
        borderWidth: 1,
      },
    ],
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Predicted Data',
      },
      tooltip: {
        enabled: true,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Categories',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Predicted Values',
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <div>
      {/* <h1>Data Processing and Prediction</h1> */}

      <div>
        <h2 className="text-2xl font-bold  mt-4">{`Predicted Values ${name}`}</h2>
        {predictions ? (
          Object.entries(predictions).map(([key, value]) => (
            <p key={key} className="text-lg py-2">
              {key}: {value ? `$ ${value[1]}` : 'No prediction'}
            </p>
          ))
        ) : (
          <p>No data available or insufficient data for prediction.</p>
        )}
      </div>

      {/* Chart */}
      <div style={{ width: '100%', height: '400px', marginBottom: '30px' }}>
        <Bar data={chartData} options={chartOptions} />
      </div>

      {/* Predictions */}
    </div>
  );
};

export default ForceCast;
