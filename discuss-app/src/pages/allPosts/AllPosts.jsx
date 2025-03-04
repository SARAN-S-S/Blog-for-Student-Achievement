// src/pages/PostsPage/PostsPage.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import BarChart from "../../components/BarChart/BarChart";
import "./allPosts.css";

const eventTypes = ["Project", "Paper", "Competition", "Patent", "Journal"];
const studentYears = ["First Year", "Second Year", "Third Year", "Final Year"];

const PostsPage = () => {
  const [totalPosts, setTotalPosts] = useState(0);
  const [postsByEventType, setPostsByEventType] = useState({});
  const [postsByYear, setPostsByYear] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      const res = await axios.get("/api/stats/posts");
      setTotalPosts(res.data.totalPosts);

      // Initialize counts as 0 for all event types
      const eventTypeCounts = eventTypes.reduce((acc, type) => {
        acc[type] = 0;
        return acc;
      }, {});

      // Fill in actual counts from the API response
      res.data.postsByEventType.forEach((p) => {
        eventTypeCounts[p._id] = p.count;
      });

      // Initialize counts as 0 for all student years
      const studentYearCounts = studentYears.reduce((acc, year) => {
        acc[year] = 0;
        return acc;
      }, {});

      // Fill in actual counts from the API response
      res.data.postsByYear.forEach((p) => {
        studentYearCounts[p._id] = p.count;
      });

      setPostsByEventType(eventTypeCounts);
      setPostsByYear(studentYearCounts);
    };

    fetchData();
  }, []);

  // Calculate percentages
  const calculatePercentage = (count) =>
    totalPosts ? ((count / totalPosts) * 100).toFixed(2) : 0;

  return (
    <div className="postsPage">
      <h1>Post Statistics</h1>

      {/* Total Posts Container */}
      <div className="totalPostsContainer">
        <p>Total Posts: {totalPosts}</p>
      </div>

      {/* Event Type Counts */}
      <span><h2>Event Type Counts</h2></span>
      <div className="grid">
        {eventTypes.map((type) => (
          <div key={type} className="countContainer">
            <p>{type} Count: {postsByEventType[type]}</p>
            <p>Percentage: {calculatePercentage(postsByEventType[type])}%</p>
          </div>
        ))}
      </div>

      {/* Student Year Counts */}
      <span><h2>Student Year Counts</h2></span>
      <div className="grid">
        {studentYears.map((year) => (
          <div key={year} className="countContainer">
            <p>{year} Count: {postsByYear[year]}</p>
            <p>Percentage: {calculatePercentage(postsByYear[year])}%</p>
          </div>
        ))}
      </div>

      {/* Bar Charts */}
      <div className="barChartContainer">
        <span><h2>Event Type Percentage in Charts</h2></span>
        <BarChart
          data={eventTypes.map((type) => calculatePercentage(postsByEventType[type]))}
          labels={eventTypes}
          title="Posts by Event Type"
          backgroundColor={["#ff6384", "#36a2eb", "#cc65fe", "#ffce56", "#4bc0c0"]}
          borderColor={["#ff6384", "#36a2eb", "#cc65fe", "#ffce56", "#4bc0c0"]}
        />

        <span><h2>Student Year Percentage in Charts</h2></span>
        <BarChart
          data={studentYears.map((year) => calculatePercentage(postsByYear[year]))}
          labels={studentYears}
          title="Posts by Student Year"
          backgroundColor={["#ff6384", "#36a2eb", "#cc65fe", "#ffce56"]}
          borderColor={["#ff6384", "#36a2eb", "#cc65fe", "#ffce56"]}
        />
      </div>
    </div>
  );
};

export default PostsPage;
