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
    <div className="statisticsPage">
      <h1>Monthly Post Statistics</h1>
      <div className="filters">
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
      <div className="statsContainer">
        <div className="totalPosts">
          <h3>Total Posts in {year || "All Years"}</h3>
          <p>{totalPosts}</p>
        </div>
        {monthlyPosts.map((post) => (
          <div key={post._id} className="statItem">
            <h3>{post.monthName}</h3>
            <p>Posts: {post.count}</p>
            <p>Percentage: {post.percentage}%</p>
          </div>
        ))}
      </div>
      <div className="charts">
        <BarChart
          data={monthlyPosts.map((p) => p.percentage)}
          labels={monthlyPosts.map((p) => p.monthName)}
          title="Posts by Month (%)"
          backgroundColor={["#36a2eb"]}
          borderColor={["#36a2eb"]}
        />
      </div>
    </div>
  );
};

export default StatisticsPage;