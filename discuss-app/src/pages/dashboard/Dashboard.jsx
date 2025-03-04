import React, { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Context } from "../../context/Context";
import "./dashboard.css";

export default function Dashboard() {
  const { user } = useContext(Context);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/login");
    }
  }, [user, navigate]);

  return (
    <div className="dashboard">
      <h1>Admin Dashboard</h1>
      <div className="dashboardGrid">
        <div className="card" onClick={() => navigate("/users")}>
          <h2>Total Students</h2>
        </div>
        <div className="card" onClick={() => navigate("/allposts")}>
          <h2>Total Posts</h2>
        </div>
        <div className="card" onClick={() => navigate("/manageposts")}>
          <h2>Manage Posts</h2>
        </div>
        <div className="card" onClick={() => navigate("/statistics")}>
          <h2>Statistics</h2>
        </div>
        <div className="cardlast" onClick={() => navigate("/filter-posts")}>
          <h2>Filter Posts</h2>
        </div>
      </div>
    </div>
  );
}
