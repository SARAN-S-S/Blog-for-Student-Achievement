import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import BarChart from "../../components/BarChart/BarChart";
import "./statistics.css";

const StatisticsPage = () => {
  const [monthlyPosts, setMonthlyPosts] = useState([]);
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [totalPosts, setTotalPosts] = useState(0);

  const fetchData = useCallback(async () => {
    try {
      const res = await axios.get(`/api/stats/monthly-posts?month=${month}&year=${year}`);
      setMonthlyPosts(res.data.posts);
      setTotalPosts(res.data.totalPosts);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  }, [month, year]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="statisStatisticsPage">
      <h1>Monthly Post Statistics</h1>
      <div className="statisFilters">
        <select value={month} onChange={(e) => setMonth(e.target.value)}>
          <option value="">Select Month</option>
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              {new Date(0, i).toLocaleString("default", { month: "long" })}
            </option>
          ))}
        </select>
        <select value={year} onChange={(e) => setYear(e.target.value)}>
          <option value="">Select Year</option>
          {Array.from({ length: 11 }, (_, i) => (
            <option key={i} value={2024 + i}>
              {2024 + i}
            </option>
          ))}
        </select>
      </div>
      <div className="statisStatsContainer">
        <div className="statisTotalPosts">
          <h3>Total Posts in {year || "All Years"}</h3>
          <p>{totalPosts}</p>
        </div>
        {monthlyPosts.map((post) => (
          <div key={post._id} className="statisStatItem">
            <h3>{post.monthName}</h3>
            <p>Posts: {post.count}</p>
            <p>Percentage: {post.percentage}%</p>
          </div>
        ))}
      </div>
      <div className="statisCharts">
        {monthlyPosts.length > 0 && ( // Conditionally render the chart
          <BarChart
            data={monthlyPosts.map((p) => p.percentage)}
            labels={monthlyPosts.map((p) => p.monthName)}
            title="Posts by Month (%)"
            backgroundColor={monthlyPosts.map((p, index) => {
              const colors = ['#81D4FA', '#A5D6A7', '#CE93D8', '#FFE082', '#80CBC4', '#FFCC80', '#80DEEA', '#B39DDB', '#CFD8DC', '#A1C4FD', '#81F7E5', '#E1BEE7'];
              return colors[index % colors.length];
            })}
            borderColor={monthlyPosts.map((p, index) => {
                const colors = ['#29B6F6', '#4CAF50', '#AB47BC', '#FFC107', '#009688', '#FF9800', '#00BCD4', '#5E35B1', '#607D8B', '#3F51B5', '#00ACC1', '#9C27B0'];
                return colors[index % colors.length];
            })}
          />
        )}
      </div>
    </div>
  );
};

export default StatisticsPage;