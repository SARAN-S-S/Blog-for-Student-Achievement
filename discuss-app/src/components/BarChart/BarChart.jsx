// src/components/BarChart/BarChart.jsx
import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import "./barChart.css";

const BarChart = ({ data, labels, title, backgroundColor, borderColor }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    const ctx = chartRef.current.getContext("2d");
    const chart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: title,
            data: data,
            backgroundColor: backgroundColor,
            borderColor: borderColor,
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function (value) {
                return value + "%"; // Show percentage
              },
            },
          },
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function (context) {
                let label = context.dataset.label || "";
                if (label) {
                  label += ": ";
                }
                label += context.raw + "%";
                return label;
              },
            },
          },
        },
      },
    });

    return () => chart.destroy();
  }, [data, labels, title, backgroundColor, borderColor]);

  return <canvas ref={chartRef} />;
};

export default BarChart;
